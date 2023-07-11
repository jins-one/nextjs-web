import styles from '@/styles/pages/popup.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

import QRCode from 'react-qr-code';

import imagePack from '@/styles/image-module';
import AlertDialogNew2 from './alertDialog';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';

import { debounce} from 'lodash';

/**
 * 신분증 인증
 */
export default function IdCardAuth(props) {
    const router = useRouter();

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    const [allStepComplete, setAllStepComplete] = useState(false);

    // 모바일인지 확인
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    }, []);

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
            if (resValue.success) {
                setAllStepComplete(true);
                setText('신분증 인증이 완료되었습니다.');
                setAlertModal(true);
            } else if (resValue.redirect) {
                fetch2Api_logout(configs.frontUrl +'/api/logout', { method: 'POST' }, props.email);
            } else if (resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.')
                router.push('/')
            } else {
                alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
            }
        }
    }, [resValue]);

    async function startIdCardAuth() {

        //고객의무인증 - 신분증인증 성공
        let api_url =  '/api/fetch/certs';
        let obj = {
            method: 'POST',
            body: JSON.stringify({
                kind: 'idcard',
                identifyNumber: 'identifyNumber',
                gender: 'M',
                nationality: 'KR',
                name: 'kim',
                birthDate: '2000-12-31',
                issueDate: '2000-12-31',
                expireDate: '2000-12-31',
                submissionid: 'submissionid',
                idImage: 'idImage'
            })
        }
        apiDebounce(api_url, obj, props.email);
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);

        if (allStepComplete) {
            props.func(3);
            props.setDone(true);
        }
    }

    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'logo'} text={text} />

            <div className={styles.popupDiv} style={{ width: '45rem' }}>
                {mobile ? <Image src={imagePack.mypage.idCardAuthImg} alt='idCardAuthImg' priority /> :
                    <div className={styles.qrCover}>
                        <QRCode
                            style={{ height: "auto", width: "188.6px", maxHeight: '185.7px' }}
                            value={'asdfasdfasdfasdfasdf'}
                        />
                    </div>
                }


                <div className={`${styles.wBr} ${styles.authText}`}>신분증 인증은 모바일을 통해서만 가능합니다.<br />
                    QR코드를 인식하여 신분증 인증을 하시고 인증완료 버튼을 누르시면 다음단계로 넘어갑니다.</div>

                <div className={styles.btnDiv} style={{ width: '38.75rem' }}>
                    <div className={styles.cancelBtn} onClick={() => { router.back(); }}>취소</div>
                    <div className={styles.authBtn} onClick={startIdCardAuth} style={{ width: '27.5rem' }}>
                        {mobile ? 'KYC 인증하기' : '확인'}
                    </div>
                </div>

            </div>

        </>
    )
}
