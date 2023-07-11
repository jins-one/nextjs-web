// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import configs from "@/configs/configs";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import getConfig from "next/config"

/**
 * 이메일 인증번호 확인
 * @param {object} req request
 * @param {object} res response
 */
async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }
    
    const body = JSON.parse(req.body);
    const { serverRuntimeConfig } = getConfig();
    const { emailAuthMap } = serverRuntimeConfig;
    let email;

    if (body.type && body.type == 'assets') {

        email = req.session.user.email;

    } else {
        email = body.email;
    }


    let masking_email = await maskingEmail(email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

    let emailAuthData = emailAuthMap.get(email);

    let current = new Date();
    let current_timestamp = current.getTime();

    
    if (emailAuthData) {
        let diffTime = (current_timestamp - emailAuthData.timestamp) / (1000 * 60);

        if (diffTime > 5) { //유효시간 만료
            emailAuthMap.delete(email);
            insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
            return res.json({ success: false, code: 3001 });
        } else {
            if (emailAuthData.code == body.code) {
                insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                return res.json({ success: true, code: 2001 });

            } else { //인증번호 틀림
                insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                return res.json({ success: false, code: 3002 });
            }
        }
    } else {
        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        return res.json({ success: false, code: 3003 });
    }
    
}
export default withSessionRoute(handler)