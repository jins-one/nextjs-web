import { withSessionRoute } from "@/fetchs/session";
import { InssuedToken } from "@/fetchs/members/post/userid/inssuedToken";
import { ChangePassword } from "@/fetchs/members/patch/userid/changePw";
import maskingEmail from "@/functions/emailMasking";
import configs from "@/configs/configs";
import insertLogs from "@/functions/logs";
import checkNomalApi from "@/functions/checkNomalApi";
import emailAuthNumDoubleCheck from "@/functions/emailAuthNumDoubleCheck";

async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let body = JSON.parse(req.body);
    
    let name = body.name;
    let email = body.email;
    let birth = body.birthDate;
    let pw = body.pw;

    let masking_email = await maskingEmail(email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    let emailDoubleCheck = await emailAuthNumDoubleCheck(email, body.code);
    if(emailDoubleCheck) {
        const result = await InssuedToken(email, name, birth);

        if (result.success) {
    
            //비밀번호 변경 api
            let change_pw = await ChangePassword(result.token, email, pw);
    
            insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);
    
            if(change_pw.success) {
                return res.json({ success: result.success });
    
            }
    
        } else {
            if(result.code && result.code==11014){
                return res.json({ success: false, code:11014 });
            } else {
                return res.json({ success: false });
            }
        }
    } else {
        return res.json({success:false, code:1011});
    }

}
export default withSessionRoute(handler)