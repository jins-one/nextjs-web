import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';

const method = 'PATCH';

/**
 * 출금신청상태변경
 * @returns 
 */
export async function WithdrawalEthCancel() {

    // let api_url = config.txs_patch_withdrawal;
    // let data = await apiFetch(api_url, method);

    // if(data.success) {
    //     return {success:true}
    // } else {
    //     return {success:false}
    // }


    return { success: true }

}