
import configs from "@/configs/configs";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import { withSessionRoute } from "@/fetchs/session";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";

/**
 * 고객의무인증 단계 수행 후 session의 cert_level update
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function updateStack(req, res) {
  let blackListCheck = checkNomalApi(req);
  if(!blackListCheck.success && blackListCheck.code=='1001') {
      return res.json({success:false, code:1001});
  }

  let user_email = req.session.user ? req.session.user.email : '';
  let token = req.session.user ? req.session.user.token : '';

  let masking_email = await maskingEmail(user_email);
  let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
  insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

  let data = await MemberInquiry(user_email, token);

  insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);

  let cert_level = data.data.members.cert_level;

  req.session.user.cert_level = cert_level;

  req.session.save()
    .then(() => {
      return res.json({ success: true });

    })
    .catch((err) => {
      return res.json({ success: false });
    });

}

export default withSessionRoute(updateStack);