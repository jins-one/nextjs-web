import configs from "@/configs/configs";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import getConfig from "next/config";

async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    const body = JSON.parse(req.body);
    let success = false;
    
    const { serverRuntimeConfig } = getConfig();
    const { phoneAuthMap } = serverRuntimeConfig;

    let masking_email = req.session.user?await maskingEmail(req.session.user.email):'';
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    let current = new Date();
    let current_timestamp = current.getTime();


    let to;
    if(body.type && body.type=='assets') {
        let phone = req.session.user.phone;
        let split_phone = phone.split('-')
        to = split_phone[0]+split_phone[1]+split_phone[2];
    } else {
        to = body.to;
    }

    let phoneAuthData = phoneAuthMap.get(to);


    if (phoneAuthData) {
        let diffTime = (current_timestamp - phoneAuthData.timestamp) / (1000 * 60);

        if (diffTime > 3) { //유효시간 만료
            phoneAuthMap.delete(to);
            insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
            return res.json({ success: false, code: 3001 });
        } else {
            if (phoneAuthData.code == body.authNum) {
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
export default withSessionRoute(handler);