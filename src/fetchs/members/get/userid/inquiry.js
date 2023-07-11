import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';


const method = 'GET';

/**
 * 회원 1명 정보 조회
 * @param {number} id 유저 id
 * @returns 
 */
export async function MemberInquiry(id, token) {

    let api_url = config.apiAddress + `/members/${id}`;

    let obj = {
        method: method,
        headers: {
            'token':token
        }
    }
    let masking_email = await maskingEmail(id);
    const data = await apiFetch2(api_url, obj, masking_email);

    if(data.success) {
        return {success:true, data:data.data}
    } else if(data.redirectUrl) {
        return {success:false, data:{}, redirect: data.redirectUrl}
    }
     else {
        return {success:false, data:{}}
    }
}