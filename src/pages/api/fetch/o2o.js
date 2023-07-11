import configs from "@/configs/configs";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
// import { OneToOneWrite } from


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    const method = req.method;
    
    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

    if (method == 'POST') { //1:1문의 작성

        let body = JSON.parse(req.body);

        // const result = await OneToOneWrite(body);
        // return res.json({ success: result.success });

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        res.json({ success: true})


    } else if (method == 'PUT') { //1:1문의 수정

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        res.json({ success: true})


    } else if (method == 'PATCH') { //1:1문의 삭제

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        res.json({ success: true})
    }

}
export default withSessionRoute(handler)