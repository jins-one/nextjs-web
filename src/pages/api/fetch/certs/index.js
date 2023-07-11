import configs from "@/configs/configs";
import defines from "@/defines/defines";
import { Certs } from "@/fetchs/mypage/post/certs";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import useValid from "@/functions/isValid";
import insertLogs from "@/functions/logs";
import phoneAuthNumDoubleCheck from "@/functions/phoneAuthNumDoubleCheck";

async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if (!blackListCheck.success && blackListCheck.code == '1001') {
        return res.json({ success: false, code: 1001 });
    }

    let user_email = req.session.user ? req.session.user.email : '';
    let token = req.session.user ? req.session.user.token : '';

    let masking_email = await maskingEmail(user_email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

    let body = JSON.parse(req.body);
    let kind = body.kind;
    body.id = user_email;


    if (kind == 'phone') {

        ////regex 한번 더 검사
            let name_valid = useValid(body.name, defines.regex.nochar);
            let phone_valid = useValid(body.phone_num, defines.regex.phone_bar);

            if (!(name_valid && phone_valid)) {
                return res.json({ success: false });
            }
        ////


        let phoneDoubleCheck = await phoneAuthNumDoubleCheck(body.phone_num.replace(/-/g, ''), body.code); //휴대폰 인증 더블 체크
        if (phoneDoubleCheck) {

            const data = await Certs(token, body);

            insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);

            if (data.redirect) {
                return res.json({ success: data.success, redirect: data.redirect });
            } else {
                return res.json({ success: data.success });
            }
        } else {
            return res.json({ success: false, code: 1011 });
        }



    } else { //bank, idcard, kyc

        ////regex 한번 더 검사
            if(kind == 'kyc') {
                let home_valid = useValid(body.home_address, /^\(([0-6][0-3]\d{3})\)\s.*$/);
                let work_valid = useValid(body.work_address, /^\(([0-6][0-3]\d{3})\)\s.*$/);
                // let work_phone_valid = useValid(body.work_phone_num, );
                
                if (!(home_valid && work_valid && body.work_phone_num && body.work_department_name && body.work_position && body.work_info && body.transaction_purpose && body.funds_source && body.management_service.toString())) {
                    return res.json({ success: false });
                }
            }
        ////


        const data = await Certs(token, body);

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);

        if (data.redirect) {
            return res.json({ success: data.success, redirect: data.redirect });
        } else {
            return res.json({ success: data.success });
        }
    }


}
export default withSessionRoute(handler)