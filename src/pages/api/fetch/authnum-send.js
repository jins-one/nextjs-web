import configs from "@/configs/configs";
import { DuplicatePhoneNum } from "@/fetchs/checks/post/phone/duplicateCheck";
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import sendAuthSMS from "@/pages/api/phoneCertified";

async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    const body = JSON.parse(req.body);
    let to;

    let masking_email = req.session.user ? await maskingEmail(req.session.user.email) : '';
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

    if (body.type && body.type == 'assets') {

        let phone = req.session.user.phone;

        let split_phone = phone.split('-');
        to = split_phone[0] + split_phone[1] + split_phone[2];
    } else {
        to = body.to;
    }


    let result;
    let phone_dublicate_check;
    if (!body.duplicate) {
        result = await sendAuthSMS(to);

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
        return res.json({ success: result.success });

    } else {
        phone_dublicate_check = await DuplicatePhoneNum(body.phone_num, masking_email);


        if (phone_dublicate_check.success) {

            if (body.duplicate == 1) { //등록된 계정이 없을 때
                if (phone_dublicate_check.data.data.count == 0) {
                    result = await sendAuthSMS(to);

                    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                    return res.json({ success: true, data: 0 });
                } else {
                    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                    return res.json({ success: true, data: 1 });
                }
            } else {  //등록된 계정이 있을 때
                if (phone_dublicate_check.data.data.count == 0) {
                    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                    return res.json({ success: true, data: 0 });
                } else {
                    result = await sendAuthSMS(to);

                    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                    return res.json({ success: true, data: 1 });
                }
            }

        } else {
            return res.json({ success: false });
        }

    }


}
export default withSessionRoute(handler);