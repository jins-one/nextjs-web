import configs from "@/configs/configs";

export default async function sendAuthSMS(authNum, to) {
    try{
        console.log(to);

        to = to.replace(/[^0-9]/g, '');
        
        let to_obj;
        if(to.slice(0,3) == "010"){
            console.log("국내");
            to_obj = [ { "recipientNo" : to }];
        }else{
            console.log("해외");
            to_obj = [ { "internationalRecipientNo": to } ];
        }
        let data = { "body" : `[BLINK] 모바일 인증번호는\n[${authNum}] 입니다.`, "sendNo" : configs.sms.from, "recipientList" : to_obj};
        let sendObj = {
            method : "POST",
            headers : {
                "Content-Type" : "application/json;charset=UTF-8",
                "X-Secret-Key" :  configs.sms.Xkey
            },
            body : JSON.stringify(data)   
        }
        let url = `https://api-sms.cloud.toast.com/sms/v3.0/appKeys/${configs.sms.appKey}/sender/sms`;
        
        const sendMsg = await fetch(url,sendObj)
        const result = await sendMsg.json();

        if(result.header.isSuccessful){
            return { success : true }
        }else {
            return { success : false, msg : result.header.resultMessage }
        }
    }
    catch(error){
        console.log(error);
    }
}