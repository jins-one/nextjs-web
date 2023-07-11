import configs from "@/configs/configs";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import { withSessionRoute } from "@/fetchs/session";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";

async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let data;
    let user_email = req.session.user?req.session.user.email:'';
    let token = req.session.user?req.session.user.token:'';

    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);
    
    const result = await MemberInquiry(user_email, token);
    if(result.success) {
        data = result.data.accounts.balance;
    } else {
        data = 0;
    }

    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);

    if(result.redirect) {
        return res.json({ success: result.success, data:data, redirect: result.redirect });
    } else {
        return res.json({ success: result.success, data:data });
    }
}
export default withSessionRoute(handler)