import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';

const method = 'GET';

/**
 * 입출금 조회
 * @param {number} userId 유저 idx
 * @returns 
 */
export async function DepositTransactionHistory(userId) {

    // let api_url = config.txs_get_userid_inquiry+`/${userId}`;
    // let data = await apiFetch2(api_url, {method:method});

    // if(data.success) {
    //     return res.json({success:true});
    // } else {
    //     return res.json({success:false});
    // }

    return {
        success: true,
        list: [
            {
                type:'예치중',
                product:'ETH',
                price: '10,000',
                rate: '16%',
                p_date: '2023.01.01 23:59:59',
                s_date:'2023.01.01 23:59:59',
                e_date: '2023.01.01 23:59:59',
            },
            {
                type:'예치종료',
                product:'ETH',
                price: '10,000',
                rate: '16%',
                p_date: '2023.01.01 23:59:59',
                s_date:'2023.01.01 23:59:59',
                e_date: '2023.01.01 23:59:59',
            },
            {
                type:'예치종료',
                product:'ETH',
                price: '10,000',
                rate: '16%',
                p_date: '2023.01.01 23:59:59',
                s_date:'2023.01.01 23:59:59',
                e_date: '2023.01.01 23:59:59',
            },
            {
                type:'예치중',
                product:'ETH',
                price: '10,000',
                rate: '16%',
                p_date: '2023.01.01 23:59:59',
                s_date:'2023.01.01 23:59:59',
                e_date: '2023.01.01 23:59:59',
            },
        ]
    }
}