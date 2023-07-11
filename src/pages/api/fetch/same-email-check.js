import configs from "@/configs/configs";
import { withSessionRoute } from "@/fetchs/session"
import emailCheck from "@/fetchs/signin/post/emailCheck";
import apiFetch2 from "@/functions/apiFetch2";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import getConfig from "next/config";

async function handler(req, res) {
    checkNomalApi(req);

    const body = JSON.parse(req.body);
    let recaptcha_num = body.rc;
    console.log(recaptcha_num)
    
    let masking_email = await maskingEmail(body.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);


    //reCAPTCHA data가 외부에 의해 강제로 변환되었는지 확인
    const { serverRuntimeConfig } = getConfig();
    const { reCaptchaList } = serverRuntimeConfig;
    let rc_data = reCaptchaList.get(recaptcha_num);
    console.log(rc_data)

    if(rc_data) {
        if(rc_data.score <= 0.5) {
            reCaptchaList.delete(recaptcha_num);
            return res.json({ success: false });
        } else {
            reCaptchaList.delete(recaptcha_num);
        }
    } else {
        return res.json({ success: false });
    }
    //

    const result = await emailCheck(body.email);

    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);

    if(result.success) {
        if(result.data.data.count == 0){
            // 중복없음

            let email_send = await fetch('/api/auth/email', {
                method: 'POST',
                body: JSON.stringify({
                    email: body.email,
                })
            })

            let email_result = await email_send.json();
            console.log(email_result);

            if(email_result.success) {
                return res.json({ success: true, data:0, code:2001});
            } else {
                return res.json({success: false, data:0, code:3001});
            }

        }else {
            // 중복있음
            return res.json({ success: true, data:1 });
        }
    } else {
        return res.json({ success: false });
    }
    
    
}
export default withSessionRoute(handler)
