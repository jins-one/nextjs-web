import configs from "@/configs/configs";
import defines from "@/defines/defines";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import { withSessionRoute } from "@/fetchs/session"
import { WalletRegist } from "@/fetchs/wallets/post/regist";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";


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

    if (method == 'GET') { //출금지갑정보 조회

        const data = await MemberInquiry(user_email, token)

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);

        if(data.redirect) {
            return res.json({ success: false, redirect:data.redirect});
        } else {
            if(data.data.wallets) {
                return res.json({ success: true, data:data.data.wallets});
            } else {
                return res.json({ success: true, data:null});
            }
        }


    } else if (method == 'POST') { //출금지갑 생성

        let body = JSON.parse(req.body);
        body.user_email = user_email;

        const result = await WalletRegist(body);

        return res.json({ success: result.success, user_email: user_email });


    } else if (method == 'PUT') { //출금지갑정보 수정


        

        return res.json({ success: true });
    }

}
export default withSessionRoute(handler)