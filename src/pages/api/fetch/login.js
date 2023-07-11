import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import { Login } from "@/fetchs/login/post/login";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import getConfig from "next/config";
import maskingEmail from "@/functions/emailMasking";
import configs from "@/configs/configs";
import insertLogs from "@/functions/logs";

import checkNomalApi from "@/functions/checkNomalApi";

async function getSession(req, res) {

  const { serverRuntimeConfig } = getConfig();
  const { loginSession, reCaptchaList, loginFailMap } = serverRuntimeConfig;


  let blackListCheck = checkNomalApi(req);
  if(!blackListCheck.success && blackListCheck.code=='1001') {
      return res.json({success:false, code:1001});
  }
  

  let body = JSON.parse(req.body);
  let email = body.email;
  let pw = body.pw;
  let recaptcha_num = body.rc;

  let masking_email = await maskingEmail(email);
  let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '1.1.1.1';
  insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);
  
  
  let login_fail_cnt = loginFailMap.get(email); //이메일별로..?


  //reCAPTCHA data가 외부에 의해 강제로 변환되었는지 확인
  if (recaptcha_num) {
    let rc_data = reCaptchaList.get(recaptcha_num);
    console.log(rc_data)

    if (rc_data) {
      if (rc_data.score <= 0.5) {
        reCaptchaList.delete(recaptcha_num);
        return res.json({ success: false, code:1011 });
      } else {
        reCaptchaList.delete(recaptcha_num);
      }
    } else {
      return res.json({ success: false, code:1011 });
    }
  }
  //



  const result = await Login(email, pw);

  if (result.success) {
    if (login_fail_cnt) {
      loginFailMap.delete(client_ip);
    }

    // 중복로그인 체크
    // if(loginSession.get(email)){

    //   return res.json({ success: false , code : '-1', err : 'login overlap', email});

    // }else {
    const user_info = await MemberInquiry(email, result.data.token);

    if (user_info.success) {

      insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);

      req.session.user = {
        email: email,
        phone: user_info.data.members.phone_num,
        cert_level: user_info.data.members.cert_level,
        token: result.data.token
      }

      req.session.save()
        .then(() => {
          let compare_date = compareChangedPasswdAt(result.data.changed_passwd_at);

          loginSession.set(req.session.user.email, true);

          if (compare_date >= 90) {
            return res.json({ success: true, pwRedirect: true });
          } else {
            return res.json({ success: true });
          }

        })
        .catch((err) => {
          console.log(err);
          return res.json({ success: false });
        });

    } else {

      return res.json({ success: false });
    }
    // }

  } else {

    if (login_fail_cnt) {
      loginFailMap.set(email, login_fail_cnt + 1);
    } else {
      loginFailMap.set(email, 1)
    }

    if (login_fail_cnt > 3) {
      return res.json({ success: false, msg: result.msg, code: result.code, rc: 5 });
    }
    return res.json({ success: false, msg: result.msg, code: result.code });
  }



}

export default withSessionRoute(getSession);


function compareChangedPasswdAt(date) {
  let now = new Date();

  let s_now = now.toISOString().split('T')[0];
  let s_pw_changed_at = date.split('T')[0];

  let now_date = new Date(s_now);
  let pw_date = new Date(s_pw_changed_at);

  const diffMSec = now_date.getTime() - pw_date.getTime();
  const diffDate = diffMSec / (24 * 60 * 60 * 1000);

  return diffDate;
}