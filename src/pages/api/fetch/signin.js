import { withSessionRoute } from "@/fetchs/session"
import { SignIn } from "@/fetchs/members/post/signin";
import maskingEmail from "@/functions/emailMasking";
import configs from "@/configs/configs";
import insertLogs from "@/functions/logs";
import checkNomalApi from "@/functions/checkNomalApi";
import emailAuthNumDoubleCheck from "@/functions/emailAuthNumDoubleCheck";
import defines from "@/defines/defines";
import useValid from "@/functions/isValid";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if (!blackListCheck.success && blackListCheck.code == '1001') {
        return res.json({ success: false, code: 1001 });
    }

    let body = JSON.parse(req.body);

    let email = body.email;
    let pw = body.pw;
    let name = body.name;
    let year = body.year;
    let month = body.month;
    let date = body.date;
    let requirement_1 = body.requirement_1;
    let requirement_2 = body.requirement_2;
    let option_1 = body.option_1;


    let masking_email = await maskingEmail(email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);


    ////regex 한번 더 검사
        let email_valid = useValid(email, defines.regex.email);
        let pw_valid = useValid(pw, defines.regex.pw);
        let pw_valid2 = useValid(pw, defines.regex.continue);
        let name_valid = useValid(name, defines.regex.nochar);
        let birth_valid;

        let today = new Date(); // 날짜 변수 선언
        let yearNow = today.getFullYear(); // 올해 연도 가져옴


        if (1900 > year || year > yearNow) {
            birth_valid = false;
        } else if (month < 1 || month > 12) {
            birth_valid = false;
        } else if (date < 1 || date > 31) {
            birth_valid = false;
        } else if ((month == 4 || month == 6 || month == 9 || month == 11) && date == 31) {
            birth_valid = false;
        } else if (month == 2) {
            let isleap = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));

            if (date > 29 || (date == 29 && !isleap)) {
                birth_valid = false;
            } else {
                birth_valid = true;
            }

        } else {
            birth_valid = true;
        }

        //정규식이 일치하지 않을때
        if (!(email_valid && pw_valid && !pw_valid2 && name_valid && birth_valid && requirement_1 && requirement_2)) {
            return res.json({ success: false })
        }
    ////



    let _data = {
        email,
        pw,
        name,
        year,
        month,
        date,
        requirement_1,
        requirement_2,
        option_1
    }


    let emailDoubleCheck = await emailAuthNumDoubleCheck(email, body.code);
    if (emailDoubleCheck) {
        const result = await SignIn(_data);

        insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);

        return res.json(result);
    } else {
        return res.json({ success: false, code: 1011 });
    }


}
export default withSessionRoute(handler)