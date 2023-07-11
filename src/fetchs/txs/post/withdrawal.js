import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';

const method = 'POST';

/**
 * 출금신청
 * @returns 
 */
export async function WithdrawalEth() {

    let api_url = config.txs_post_withdrawal;
    let data = await apiFetch(api_url, method);

    // if(data.success) {
    //     return {success:true}
    // } else {
    //     return {success:false}
    // }


    return { success: true }

}