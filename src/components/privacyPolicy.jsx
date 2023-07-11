import Image from 'next/image';
import styles from '@/styles/components/identification.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';
import AlertDialogNew from './dialogNew';
import ValidText from "@/components/isValid";
import { useEffect, useRef, useState } from "react";
import defines from '@/defines/defines';
import DisableCkEditor from './disableCkeditor';


export const PrivacyPolicyModal = ({ onModal, closeModal, contents }) => {
    const modalRef = useRef();

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



    return (
        <>
            <dialog ref={modalRef} className={styles.modal}   onCancel={()=>closeModal(false)}>

                <div className={styles.headerBox} type='pp'>
                    <button className={styles.closeButton} onClick={() => { closeModal(false) }} type='pp'>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo} type='pp'>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>


                <div className={styles.dialogContainer}>


                    <div className={styles.contentsBox}>

                        <div className={styles.titleBox} type='pp'>
                            <h1 className={styles.title}>본인인증 약관 안내</h1>
                        </div>

                        <div className={`${styles.ckMainBox} identification`}>
                            <DisableCkEditor contents={contents} />
                        </div>

                        <div className={styles.closeBtn} onClick={()=>closeModal(false)}>닫기</div>

                    </div>

                </div>

            </dialog>

        </>
    );
}