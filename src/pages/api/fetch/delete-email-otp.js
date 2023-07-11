import configs from "@/configs/configs";
import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import getConfig from "next/config";

async function handler(req, res) {
    // checkNomalApi(req);

    const body = JSON.parse(req.body);
    const { serverRuntimeConfig } = getConfig();
    const { emailAuthMap } = serverRuntimeConfig;
    let email;

    if(body.type && body.type=='assets') {
        
        email = req.session.user.email;
       
    } else {
        email = body.email;
    }


    let masking_email = req.session.user?await maskingEmail(email):'';
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    emailAuthMap.delete(email);

    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);
    res.status(200).json({ success : true });
}
export default withSessionRoute(handler);

// const Client = require('node-rest-client').Client;
// const client = new Client();

// const AUTH_TIMEOUT_MIL_SEC = 1800000;

// const smsConfig = {
//     XKey : "1OGeReSD",
//     appKey : "b46ylnYrm5qoJKqQ",
//     from : "0234540136"
// }

// function timeoutToken(email_addr) {
//     authTokenMap.delete(email_addr);
// }

// module.exports.validateToken = async (body) => {
//     const server_token = authTokenMap.get(body.phone_num);
    
//     let ret;

//     if (server_token == body.auth_token) {
//         ret = { res: true, error_code: 0, error_msg: 'SUCCESS' };
//     } else {
//         if (!server_token) {
//             ret_msg = { res: false, error_code: 1302, error_msg: "ERR_AUTH_TOKEN_EXPIRE" };
//         } else {
//             ret_msg = { res: false, error_code: 1301, error_msg: "ERR_AUTH_TOKEN_INVALID" };
//         }
//     }
//     return ret;
// }

// export const deleteToken = (email_addr) => {
//     authTokenMap.delete(email_addr);
// }

// sendSMS = async (authNum, to) => {
//     try{
//         to = to.replace(/[^0-9]/g, '');
//         console.log(to);
//         let to_obj;
//         if(to.slice(0,3) == "010")
//         {
//             console.log("국내");
//             to_obj = [ { "recipientNo" : to }];
//         }
//         else
//         {
//             // console.log("해외");
//             // to_obj = [ { "internationalRecipientNo": to } ];
//             return { res: false, error_code: 9999, error_msg : "ERR_UNKNOWN" };
//         }
//         // 국내
//         // let to_obj = [ { "recipientNo" : to }];
//         // 해외발송시
//         // let to_obj = [ { "internationalRecipientNo": to } ];
//         let sendObj = {
//             headers : {
//                 "Content-Type" : "application/json",
//                 "X-Secret-Key" :  smsConfig.XKey
//             },
//             data : {
//                 "body" : `[티핑포인트] 모바일 인증번호는\n[${authNum}] 입니다.`,
//                 "sendNo" : smsConfig.from,
//                 "recipientList" : to_obj
//             }
//         }
//         let url = `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${smsConfig.appKey}/sender/sms`;
//         await client.post(url, sendObj, async function (res)
//         {
//             if(res.header.isSuccessful != true)
//             {
//                 console.log(`[SMS] [sendAuthSMS] Send SMS Fail : error_code - ${res.header.resultCode} : ${res.header.resultMessage}`);
//             }
//             else
//             {
//                 console.log(`[SMS] [sendAuthSMS] Send SMS Success`);
//             }
//         });
//         return { res: true, error_code: 0, error_msg: "SUCCESS" };
//     }
//     catch(error){
//         console.log(error);
//     }
// }

// module.exports.sendAuthSMS = async (to) => {
// // sendAuthSMS = async (to) => {
//     let auth_num = Math.floor(Math.random() * 1000000) + 100000;
//     if (auth_num > 1000000) {
//         auth_num = auth_num - 100000;
//     }

//     let result = await sendSMS(auth_num, to);

//     authTokenMap.set(to, auth_num.toString());

//     setTimeout(timeoutToken, AUTH_TIMEOUT_MIL_SEC, to);

//     return result;
// }