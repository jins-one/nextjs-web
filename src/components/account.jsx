import styles from '@/styles/pages/popup.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

import imagePack from '@/styles/image-module';
import AlertDialogNew2 from './alertDialog';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';
import { debounce } from 'lodash';

/**
 * 계좌 인증 팝업
 */
export default function AccountAuth(props) {
    const router = useRouter();

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    const [allStepComplete, setAllStepComplete] = useState(false);

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj, email)=>{
        setResValue(await apiFetch2(url, obj, email));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        const fetch2Api_logout = async (url, obj, email)=>{
            const data = await apiFetch2(url, obj, email);
            if (data.ok) {
                router.push('/login?session=no');
            }
        }

        if(resValue.hasOwnProperty('success')){
            if (result.success) {
                setAllStepComplete(true);
                setText('KYC 계좌 인증이 완료되었습니다.');
                setAlertModal(true);
            } else if (result.redirect) {
                fetch2Api_logout(configs.frontUrl +'/api/logout', { method: 'POST' }, props.email);
            } else if (resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.')
                router.push('/')
            } else {
                alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
            }
        }
    },[resValue]);

    async function startAccountAuth() {
        //고객의무인증 - 계좌인증 성공
        let api_url =  '/api/fetch/certs';
        let obj = {
            method: 'POST',
            body: JSON.stringify({
                kind: 'bank',
                bank: 'kb',
                account_number: '1231234564567878'
            })
        }
        apiDebounce(api_url, obj, props.email);
    }


    function closeAlert(boolean) {
        setAlertModal(boolean);

        if (allStepComplete) {
            props.func(2);
            props.setDone(true);
        }
    }

    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'logo'} text={text} />
            <div className={styles.popupDiv}>
                <Image src={imagePack.mypage.accountAuthImg} alt='accountAuthImg' style={{ marginBottom: '2rem' }} priority />
                <div className={styles.authText}>블링크는 안전한 자산거래를 위하여 인증단계를<br /> 모두 진행하신 고객님에 한하여 서비스를 제공합니다.</div>

                {/* <div className={`${styles.authBtn} ${styles.activeBtn} ${styles.accountBtn}`} onClick={startAccountAuth} style={{ width: '100%' }}>계좌 인증 시작하기</div> */}

                <div className={styles.btnDiv}>
                    <div className={styles.cancelBtn} onClick={() => { router.back(); }}>취소</div>
                    <div className={styles.authBtn} onClick={startAccountAuth} style={{ width: '27.5rem' }}>확인</div>
                </div>

            </div>

        </>
    )
}

