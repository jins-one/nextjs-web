import { withSessionRoute } from "@/fetchs/session";
import ModifyMembershipInfo from "@/fetchs/members/put/info";
import maskingEmail from "@/functions/emailMasking";
import configs from "@/configs/configs";
import insertLogs from "@/functions/logs";
import checkNomalApi from "@/functions/checkNomalApi";

async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    const method = req.method;
    let user_email = req.session.user?req.session.user.email:'';

    let masking_email = await maskingEmail(user_email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    if (method == 'GET') {

    } else if (method == 'POST') {
        let body = JSON.parse(req.body);
        body.user_email = user_email;

        const result = await ModifyMembershipInfo(body);

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);
        if (result.success) {
            res.json({ success: result.success, user_email: user_email });
        } else {
            res.json({ success: result.success, user_email: user_email });
        }

    } else if (method == 'PUT') {


    }

}
export default withSessionRoute(handler)