import configs from "@/configs/configs";
import { withSessionRoute } from "@/fetchs/session"
import { TransactionHistory } from "@/fetchs/txs/get/userid/inquiry";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);


    const result = await TransactionHistory();

    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);

    if(result.success) {
        res.json({ success: result.success, list: result.list});
    } else {
        res.json({ success: result.success });
    }

}
export default withSessionRoute(handler)