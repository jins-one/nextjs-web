import Image from 'next/image';
import styles from '@/styles/components/identification.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';
import AlertDialogNew from './dialogNew';
import ValidText from "@/components/isValid";
import { useEffect, useRef, useState } from "react";
import defines from '@/defines/defines';
import DisableCkEditor from './disableCkeditor';


export const IdentificationModal = ({ onModal, closeModal, contents, isAuth }) => {
    const modalRef = useRef();

    const [auth, setAuth] = useState(false);

    const handleScroll = (e) => {
        const bottom = (e.target.scrollHeight - e.target.scrollTop)-e.target.clientHeight <= 2;
        if (bottom) {
            setAuth(true)
        }else{
            setAuth(false)
        }
    }

    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
            document.querySelector('body').classList.add('scrollLock');
        } else {
            modalRef.current.close();
            document.querySelector('body').classList.remove('scrollLock');
        }
    }, [onModal]);


    function appAuthFunc() {
        isAuth(true);
        closeModal(false);
    }



    return (
        <>
            <dialog ref={modalRef} className={styles.modal2} onCancel={()=>closeModal(false)}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { closeModal(false); }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>


                <div className={styles.dialogContainer}>


                    <div className={styles.contentsBox}>

                        <div className={styles.titleBox}>
                            <h1 className={styles.title}>본인인증 약관 안내</h1>
                        </div>

                        <div className={`${styles.ckMainBox} ${styles.identi} identification`} onScroll={handleScroll}>
                            <DisableCkEditor contents={contents} />
                        </div>

                        <div className={styles.btnDiv}>
                            <div className={styles.cancelBtn} onClick={() => { closeModal(false); }}>취소</div>
                            {
                                auth ?
                            <div className={styles.authBtn} onClick={appAuthFunc}>약관내용에 동의합니다.</div>
                             :
                                    <div className={styles.authBtn} style={{ background: '#b2b2b2', cursor: 'inherit' }}>약관내용에 동의합니다.</div>
                            } 

                        </div>
                    </div>

                </div>

            </dialog>

        </>
    );
}