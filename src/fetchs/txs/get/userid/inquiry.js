import config from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';

const method = 'GET';

/**
 * 입출금 조회
 * @param {number} userId 유저 idx
 * @returns 
 */
export async function TransactionHistory(userId) {

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
                type:'출금',
                status:'출금대기',
                s_date:'2023.01.01 23:59:59',
                price: '10,000',
                fee: '10,000',
                p_date: '2023.01.01 23:59:59',
                detail: '0xlsf7s0dfjls063lsdfksf8s60gs9uh3klrwsghfdksu3334543sfse87d'
            },
            {
                type:'입금',
                status:'입금완료',
                s_date:'2023.01.01 23:59:59',
                price: '10,000',
                fee: '10,000',
                p_date: '2023.01.01 23:59:59',
                detail: '0xlsf7s0dfjls063lsdfksf8s60gs9uh3klrwsghfdksu3334543sfse87d'
            },
            {
                type:'입금',
                status:'입금실패',
                s_date:'2023.01.01 23:59:59',
                price: '10,000',
                fee: '10,000',
                p_date: '2023.01.01 23:59:59',
                detail: '0xlsf7s0dfjls063lsdfksf8s60gs9uh3klrwsghfdksu3334543sfse87d'
            }
        ]
    }
}