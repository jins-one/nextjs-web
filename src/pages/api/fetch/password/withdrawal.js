import configs from "@/configs/configs";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }
    
    let method = req.method;
    
    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    if(method=='POST') { //출금비밀번호 등록
        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);

    } else if(method=='PATCH') {
        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);
    } 


    return res.json({ success: true});
}
export default withSessionRoute(handler)