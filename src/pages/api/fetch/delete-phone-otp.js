import configs from "@/configs/configs";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import getConfig from "next/config";

async function handler(req, res) {
    // checkNomalApi(req);

    let masking_email = req.session.user?await maskingEmail(req.session.user.email):'';
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    const body = JSON.parse(req.body);
    
    const { serverRuntimeConfig } = getConfig();
    const { phoneAuthMap } = serverRuntimeConfig;
    
    let to;
    if(body.type && body.type=='assets') {
        //저장된 휴대폰 번호 찾기
        // let email = req.session.user.email;
        // let token = req.session.user.token;
        // let phone_result = await MemberInquiry(email, token);
        // let phone = phone_result.data.members.phone_num;
        
        let phone = req.session.user.phone;
        let split_phone = phone.split('-')
        to = split_phone[0]+split_phone[1]+split_phone[2];
    } else {
        to = body.to;
    }

    phoneAuthMap.delete(to);
    
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);

    res.status(200).json({ success : true });
}
export default withSessionRoute(handler);