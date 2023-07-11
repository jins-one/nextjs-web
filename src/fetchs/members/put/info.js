import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';

const method = 'POST';

/**
 * 회원정보 수정
 * @param _data
 * @returns 
 */
export default async function ModifyMembershipInfo(_data) {
    
    // let api_url = config.members_put_info;
    // let data = await apiFetch(api_url, method, _data);

    // if(data.success) {
    //     return {success:true};
    // } else {
    //     return {success:false};
    // }

    console.log(_data)

    return {success:true};
}