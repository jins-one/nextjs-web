import configs from '@/configs/configs';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

/**
 * 비밀번호 찾기용 토큰 발행
 * @returns 
 */
export async function InssuedToken(id, name, birth) {

    const apiUrl = configs.apiAddress + `/members/${id}`;
    const method = 'POST';

    const obj = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            birthDate: birth
        })
    }

    let masking_email = await maskingEmail(id);
    const result = await apiFetch2(apiUrl, obj, masking_email);

    if (result.success) {
        return { success: true, token: result.data.token }
    } else {
        if (result.code === 11014) {
            return { success: false, code: 11014, msg: "가입되지 않은 계정입니다." }
        } else {
            return { success: false }
        }
    }
}