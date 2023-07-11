import { withSessionRoute } from "@/fetchs/session";
import { MembershipWithdrawal } from "@/fetchs/members/put/userid/withdrawal";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import configs from "@/configs/configs";

/**
 * 회원 탈퇴
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);


    let body = JSON.parse(req.body);
    let user_id = body.user_id;

    const result = await MembershipWithdrawal(user_id);
    
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);
    return res.json({ success: result.success });


}
export default withSessionRoute(handler)