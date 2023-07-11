import Image from 'next/image';
import styles from '@/styles/components/assetsDeposit.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';
import AlertDialog from './dialog';
import AlertDialogNew from './dialogNew';
import QRCode from "react-qr-code";
import { useEffect, useRef, useState } from "react";
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';
import { useRouter } from 'next/router';


const ETH_SELECT = '1';
const KRW_SELECT = '2';
const ETH_TEXT = 'ETH';
const KRW_TEXT = 'KRW';
const successText = '출금이 완료 되었습니다.';
export const AssetsDeposit = ({ session, onModal, closeModal }) => {
    const modalRef = useRef();
    const walletAddressRef = useRef();
    const router = useRouter();

    const [account, setAccount] = useState('');


    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
            document.querySelector('body').classList.add('scrollLock');

            //입금 계좌 조회 api
            async function accountInfo() {
                let api_url =  '/api/fetch/account';
                let obj = {
                    method: 'GET'
                }
                const result = await apiFetch2(api_url, obj, session);

                if (result.success) {
                    setAccount(result.data.eth_addr);
                } else if (result.redirect) {
                    closeModal(false)
                    const data = await apiFetch2(configs.frontUrl +'/api/logout', { method: 'POST' }, session);
                    if (data.ok) {
                        router.push('/login?session=no');
                    }
                } else if(result.code==1001){
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    alert('오류가 발생했습니다. 다시 시도해 주세요.');
                    router.reload();
                }
            }
            accountInfo();

        } else {
            modalRef.current.close();
            document.querySelector('body').classList.remove('scrollLock');
        }
    }, [onModal]);


    return (
        <>
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
                        <h1 className={styles.title}>입금신청</h1>
                    </div>

                    <div className={styles.contentsBox}>

                        <div className={styles.product}>
                            <div className={styles.qrCover}>
                                <QRCode
                                    value={'asdfasdfasdfasdfasdf'}
                                />
                            </div>
                        </div>

                        <div className={`${styles.product} ${styles.rowAlignCenter} ${styles.mt40}`}>
                            <input disabled value={account} className={styles.addrssInput} ref={walletAddressRef} />
                            <button className={styles.copyBtn} onClick={() => { /*navigator.clipboard.writeText(walletAddressRef.current.value);*/ console.log(walletAddressRef.current.value) }}>
                                복사하기
                            </button>
                        </div>

                        <div className={`${styles.product} ${styles.inputInfo} ${styles.mt12}`}>
                            <p>*최소 입금금액은 0.0015 ETH 입니다.</p>
                            <p>*0.0015ETH 미만 입금 시 잔고 반영이 불가능 합니다.</p>
                        </div>

                        <div className={`${styles.warringInfoBox} ${styles.mt24}`}>
                            <p>입금 전 주의사항</p>
                            <ul>
                                <li className={styles.mt16}>자금 세탁 행위 예방 및 전기통신금융 사기 피해 방지를 위하여 계정 당 첫 디지털 자산 입금 후 72시간 동안 KRW의 출금이 제한됩니다.</li>
                                <li className={styles.mt14}>내국인 대상 불법 영업행위 미신고 외국 가상자산사업자 (16개)로부터 입금 진행 시, 이용약관에 따라  조치가 이루어질 수 있습니다.</li>
                                <li className={styles.mt14}>해당 주소로 다른 디지털 자산을 입금 시도할 경우에 발생할 수 있는 오류/손실은 복구가 불가능합니다.</li>
                            </ul>
                        </div>

                        <div className={styles.buttonBox}>
                            <button className={styles.close} onClick={() => { closeModal(false) }}>취소</button>
                            <button className={styles.done} onClick={() => { closeModal(false) }}>확인</button>
                        </div>

                    </div>


                </div>



            </dialog>

        </>
    );
}