
import styles from '@/styles/components/myWalletDetail.module.css';
import Link from 'next/link';
import Image from 'next/image';
import imagePack from '@/styles/image-module';
import AlertDialog from './dialog';
import AlertDialogNew from './dialogNew';
import QRCode from "react-qr-code";
import { useEffect, useRef, useState } from "react";
import AlertDialogNew2 from './alertDialog';


export default function MyWalletDetail({ onModal, closeModal, data, ...props}) {
    const modalRef = useRef();

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');


    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
            document.querySelector('body').classList.add('scrollLock');

            if(!data) {
                setText('등록하신 출금주소가 없습니다.\n출금주소를 추가하여 주시기 바랍니다.');
                setImg('alert');
                setAlertModal(true);
            }
        } else {
            modalRef.current.close();
            document.querySelector('body').classList.remove('scrollLock');
        }
    }, [onModal]);

    function test() {
        if(props.modify) {
            modalRef.current.addEventListener('keydown',(e)=>{
                   if(e.key === 'Escape'){
                       e.preventDefault();
                   }
               })
        } else {
            closeModal(false)
        }
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);
        props.changeModal(true);
        closeModal(false);
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} text={text} img={img}/>
            <dialog ref={modalRef} className={styles.modal}   onCancel={test}>

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
                        <h1 className={styles.title}>출금정보</h1>
                    </div>

                    <div className={styles.contentsBox}>

                        <div className={styles.product}>
                            <div className={styles.textsBox}>
                                <p>출금주소별명</p>
                                <p className={styles.ml24}>{data&&data.nickname?data.nickname:'-'}</p>
                            </div>

                            <div className={`${styles.textsBox} ${styles.mt26}`}>
                                <p>지갑주소출처</p>
                                <p className={styles.ml24}>{data&&data.source?data.source:'-'}</p>
                            </div>

                            <div className={`${styles.textsBox} ${styles.mt26}`}>
                                <p>수취인명</p>
                                <p className={styles.ml24}>{data&&data.receiver?data.receiver:'-'}</p>
                            </div>

                            <div className={`${styles.textsBox} ${styles.mt26}`}>
                                <p>지갑주소</p>
                                <p className={styles.ml24}>{data&&data.address?data.address:'-'}</p>
                            </div>

                            <div className={`${styles.textsBox} ${styles.mt26}`}>
                                <p>출금주소등록일</p>
                                <p className={styles.ml24}>{data&&data.date?data.date:'-'}</p>
                            </div>
                        </div>


                        <div className={`${styles.btnsBox} ${styles.mt52}`}>
                        <button onClick={()=>{props.changeModal(true)}}>
                            수정
                        </button>
                        <button className={styles.ml24} onClick={()=>{closeModal(false)}}>
                            확인
                        </button>
                    </div>

                    </div>

                </div>

            </dialog>

        </>
    );
}