import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

const method = 'POST';

/**
 * 고객의무인증
 * @returns 
 */
export async function Certs(token, _body) {

    let api_url = config.apiAddress+'/certs';
    let obj = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'token':token
        },
        body: JSON.stringify(_body)
    }

    let masking_email = await maskingEmail(_body.id);
    const data = await apiFetch2(api_url, obj, masking_email);

    if(data.success) {
        return {success:true}
    } else {
        return {success:false, redirect: data.redirectUrl}
    }

    
}