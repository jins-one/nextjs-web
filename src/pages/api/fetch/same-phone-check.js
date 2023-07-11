import configs from "@/configs/configs";
import { DuplicatePhoneNum } from "@/fetchs/checks/post/phone/duplicateCheck";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";

async function handler(req, res) {
    checkNomalApi(req);

    let email = req.session.user?req.session.user.email:'';
    let token = req.session.user?req.session.user.token:'';

    let masking_email = await maskingEmail(email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    const body = JSON.parse(req.body);
    const phone = body.phone_num;

    const result = await DuplicatePhoneNum(token, phone, masking_email);

    insertLogs(client_ip, '', req.method, configs.frontUrl+req.url, res.statusCode);

    if(result.success) {
        if(result.data.data.count == 0){
            // 중복없음
            return res.json({ success: true, data:0 });
        }else {
            // 중복있음
            return res.json({ success: true, data:1 });
        }
    } else {
        return res.json({ success: false });
    }
    
    
}
export default withSessionRoute(handler)
