import Image from 'next/image';
import styles from '@/styles/components/withdrawal_wait.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';

import { useEffect, useRef, useState } from "react";
import AlertDialogNew2 from './alertDialog';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';
import apiFetch2 from '@/functions/apiFetch2';

export const WithdrawalWait = ({ onModal, closeModal, price, fee }) => {
    const modalRef = useRef();

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');
    const [onBtn, setOnBtn] = useState(false);
    const [allStepComplete, setAllStepComplete] = useState(false);

    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
        } else {
            modalRef.current.close();
        }
    }, [onModal]);

    function cancelWithdrawal() {
        setText('정말 출금신청을 취소하시겠습니까?');
        setImg('alert');
        setOnBtn(true);
        setAlertModal(true);
    }

    async function closeAlert(boolean, go) {
        setAlertModal(boolean);

        //출금신청 상태변경 api
        if (go) {

            let api_url =  '/api/fetch/eth-withdrawal';
            let result = await apiFetch2(api_url, {method:'PATCH'});

            if (result.success) {
                setText('출금신청이 취소되었습니다.');
                setImg('logo');
                setOnBtn(false);
                setAlertModal(true);
                setAllStepComplete(true);
            } else {
                if(result.redirect) {
                    const data = await apiFetch2('/api/logout', { method: 'POST' });
                    if (data.ok) {
                        router.push('/login?session=no');
                    }
                } else if(result.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                }
            }

        }

        if (allStepComplete) {
            closeModal(false);

            setAllStepComplete(false);
        }
    }

    return (
        <>
            <AlertDialogNew2 goBtn={'출금 취소'} onModal={alertModal} closeModal={closeAlert} img={img} text={text} onBtn={onBtn} />

            <dialog ref={modalRef} className={styles.modal} onCancel={() => closeModal(false)}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { closeModal(false) }} style={{ cursor: 'pointer' }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>


                <div className={styles.dialogContainer}>
                    <div className={styles.titleBox}>
                        <h1 className={styles.title}>출금대기</h1>
                    </div>

                    <div className={styles.contentsBox}>

                        <div className={styles.withdrawalScheduled}>

                            <div className={styles.wsTitle}>출금 예정액</div>
                            <div className={styles.wsContents}>
                                <div>{price} ETH</div>
                                {/* <div>≈</div>
                                <div><span style={{marginRight:'0.75rem'}}>100,000,000</span>KRW</div> */}
                            </div>

                            <div className={styles.estimatedFee}>
                                <span>예상 출금 수수료</span>
                                <span style={{ marginLeft: '0.25rem' }}>{fee} ETH</span>
                            </div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#808080', lineHeight: '1.2' }}>
                                *출금 수수료는 실제 트랜젝션이 발생되는 시점의  네트워크 상황에 따라 변동 될 수 있습니다.
                            </div>

                            <div className={styles.warningBox}>
                                <div>최종 출금 전 주의사항</div>

                                <ul>
                                    <li>
                                        자금 세탁 행위 예방 및 전기통신금융 사기 피해 방지를 위하여 계정 당 첫 디지털 자산 입금 후 72시간 동안 KRW의 출금이 제한됩니다.
                                    </li>
                                    <li>
                                        내국인 대상 불법 영업행위 미신고 외국 가상자산사업자 (16개)로부터 입금 진행 시, 이용약관에 따라  조치가 이루어질 수 있습니다.
                                    </li>
                                    <li>
                                        해당 주소로 다른 디지털 자산을 입금 시도 시 발생할 수 있는 오류/손실은 복구가 불가능합니다.
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.btnDiv}>
                                <div className={styles.cancelBtn} onClick={() => { cancelWithdrawal() }}>출금 취소</div>
                                <div className={styles.okBtn} onClick={() => { closeModal(false) }}>확인</div>
                            </div>

                        </div>



                    </div>


                </div>



            </dialog>
        </>
    )
}