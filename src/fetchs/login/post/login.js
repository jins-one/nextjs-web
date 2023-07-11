import config from '@/configs/configs';
import defines from '@/defines/defines';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

const method = 'POST';

/**
 * 로그인
 * @param {*} email 
 * @param {*} pw 
 */
export async function Login(email, pw) {

    let api_url = config.apiAddress + '/login';

    let obj = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: email,
            passwd: pw
        })
    }
    let masking_email = await maskingEmail(email);
    const data = await apiFetch2(api_url, obj, masking_email);

    

    if(data.success) {

        return {success:true, data: data.data}
    } else if(data.code === 11003){
        return {success:false, msg: '탈퇴 또는 차단된 회원입니다.', code:11003}
    } else if(data.code === 11004) {
        return {success:false, msg:'아이디 또는 비밀번호 오류입니다.', code:11004}
    } else if(data.code===51004) {
        return {success:false, msg:'일시적 서버 장애로 인한 오류입니다. 잠시 후 다시 시도해 주세요.', code:51004}
    } else if(data.code===51011) {
        return {success:false, msg:'로그인 실패회수 5회를 초과하셨습니다.', code:51011}
    } else {
        return {success:false}
    }
}