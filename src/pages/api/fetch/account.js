import { withSessionRoute } from "@/fetchs/session"
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import maskingEmail from "@/functions/emailMasking";
import configs from "@/configs/configs";
import insertLogs from "@/functions/logs";
import checkNomalApi from "@/functions/checkNomalApi";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let method = req.method;
    let user_email = req.session.user?req.session.user.email:'';
    let token = req.session.user?req.session.user.token:'';

    let masking_email = await maskingEmail(user_email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    if (method == 'GET') { //입금 계좌 정보 조회

        const data = await MemberInquiry(user_email, token)

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);

        if(data.redirect) {
            return res.json({success:false, redirect:data.redirect})
        }
        return res.json({success:data.success, data:data.data.accounts});
        
    } 

}
export default withSessionRoute(handler)