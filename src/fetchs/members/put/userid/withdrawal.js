import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';

const method = 'PUT';

/**
 * 회원탈퇴
 * @param {number} userId 유저 idx
 * @returns 
 */
export async function MembershipWithdrawal(userId) {

    let api_url = config.members_put_userid_withdrawal;
    let data = await apiFetch(api_url, method);

    // if(data.success) {
    //     return {success:true};
    // } else {
    //     return {success:false};
    // }

    return {success:true};
}