import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';

const method = 'POST';

/**
 * 예치신청
 * @returns 
 */
export async function DepositInvestment(_data) {

    // let api_url = config.investments_post_deposit;
    // let data = await apiFetch(api_url, method);

    // if(data.success) {
    //     return {success:true};
    // } else {
    //     return {success:false};
    // }

    return {success:true};
}