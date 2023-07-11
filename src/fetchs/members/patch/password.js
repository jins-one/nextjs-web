import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';

const method = 'PATCH';

/**
 * 비밀번호 수정
 * @returns 
 */
export async function ModifyPassword() {
    
    // let api_url = config.members_patch_password;
    // let data = await apiFetch(api_url, method);

    // if(data.success) {
        return res.json({success:true});
    // } else {
    //     return res.json({success:false});
    // }
}