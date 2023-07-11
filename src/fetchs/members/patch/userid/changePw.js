import configs from '@/configs/configs';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

/**
 * 비밀번호 변경
 * @returns 
 */
export async function ChangePassword(token, id, pw) {

    const apiUrl = configs.apiAddress + `/members`;
    const method = 'PATCH';

    const obj = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            token: token
          },
        body: JSON.stringify({
            id: id,
            passwd: pw
        })
    }

    let masking_email = await maskingEmail(id);
    const result = await apiFetch2(apiUrl, obj, masking_email);

    return {success: result.success}
}