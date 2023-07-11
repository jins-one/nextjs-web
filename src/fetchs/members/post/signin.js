import configs from '@/configs/configs';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

/**
 * 회원가입
 * @param {object} _data 입력받은 회원 정보
 * @returns 
 */
export async function SignIn(_data) {

    const apiUrl = configs.apiAddress + '/members';
    const birthDate = _data.year + '-' + _data.month + '-' + _data.date;
    const method = 'POST';

    const obj = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({
            id: _data.email,
            email_addr: _data.email,
            passwd: _data.pw,
            name: _data.name,
            birthDate: birthDate,
            requirement_1: _data.requirement_1 ? 1 : 0,
            requirement_2: _data.requirement_2 ? 1 : 0,
            option_1: _data.option_1 ? 1 : 0
        })
    }

    let masking_email = await maskingEmail(_data.email);
    const result = await apiFetch2(apiUrl, obj, masking_email);

    // console.log(result);


    if (result.code === 21001) {
        return { success: false, msg: "중복된 이메일입니다. 다시 한번 확인해주세요" }
    } else if (result.code === 21003) {
        return { success: false, msg: "중복된 아이디입니다. 다시 한번 확인해주세요" }
    } else {
        return { success: true }
    }
}