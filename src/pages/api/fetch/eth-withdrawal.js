import { withSessionRoute } from "@/fetchs/session"
import { WithdrawalEth } from "@/fetchs/txs/post/withdrawal";
import { WithdrawalEthCancel } from "@/fetchs/txs/patch/withdrawal";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import configs from "@/configs/configs";


/**
 * 출금신청
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if (!blackListCheck.success && blackListCheck.code == '1001') {
        return res.json({ success: false, code: 1001 });
    }


    let method = req.method;

    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

    if (method == 'POST') { //출금신청

        const result = await WithdrawalEth();

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        return res.json({ success: result.success, user_email: user_email });

    } else if (method == 'PATCH') { //출금신청 상태 변경

        const result = await WithdrawalEthCancel();

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        return res.json({ success: result.success, user_email: user_email });
    }

}
export default withSessionRoute(handler)