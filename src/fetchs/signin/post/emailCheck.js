import configs from '@/configs/configs';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

const method = 'POST';
export default async function emailCheck(email){

    const apiUrl = configs.apiAddress + '/checks/email';
    const sendObj = {
        method : method, 
        headers: {
            'Content-Type': 'application/json',
          },
        body : JSON.stringify({
            email_addr : email
        })
    }
    
    let masking_email = await maskingEmail(email);
    const rJson = await apiFetch2(apiUrl, sendObj, masking_email);

    
    if(rJson.success){
        return {success:true, data:rJson};
    } else {
        return {success:false};
    }
}