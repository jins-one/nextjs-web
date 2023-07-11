import configs from "@/configs/configs";
import getConfig from "next/config";

export default async function sendAuthSMS(to) {
    try{
        let random = String(Math.floor(Math.random() * 1000000)).padStart(6, "0"); //랜덤 값

        to = to.replace(/[^0-9]/g, '');
        
        let to_obj;
        if(to.slice(0,3) == "010"){
            // console.log("국내");
            to_obj = [ { "recipientNo" : to }];
        }else{
            // console.log("해외");
            to_obj = [ { "internationalRecipientNo": to } ];
        }
        let data = { "body" : `[BLINK] 모바일 인증번호는\n[${random}] 입니다.`, "sendNo" : configs.sms.from, "recipientList" : to_obj};
        let sendObj = {
            method : "POST",
            headers : {
                "Content-Type" : "application/json;charset=UTF-8",
                "X-Secret-Key" :  configs.sms.Xkey
            },
            body : JSON.stringify(data)   
        }
        let url = `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${configs.sms.appKey}/sender/sms`;
        
        const sendMsg = await fetch(url, sendObj);
        const result = await sendMsg.json();

        if(result.header.isSuccessful) {
            let currentTime = new Date();
            let timestamp = currentTime.getTime();

            const { serverRuntimeConfig } = getConfig();
            const { phoneAuthMap } = serverRuntimeConfig;

            phoneAuthMap.set(to, {code:random, timestamp:timestamp});

            console.log(phoneAuthMap);

            return { success : true }
        }else {
            return { success : false, msg : result.header.resultMessage }
        }
    }
    catch(error){
        console.log(error);
    }
}

