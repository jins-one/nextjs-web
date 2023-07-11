import styles from '@/styles/components/alert_dialog.module.css';
import Image from 'next/image';
import imagePack from '@/styles/image-module';
import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router';

export default function AlertDialogNew2({ onModal, closeModal, ...props }) {

    const modalRef = useRef();
    const router = useRouter();

    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
        } else {
            modalRef.current.close();
        }
    }, [onModal]);


    return (
        <dialog ref={modalRef} className={styles.contianer} onCancel={() => closeModal(false)}>

            <div className={styles.closeDiv}>
                <Image src={imagePack.component.iconClose} alt='close' onClick={() => { closeModal(false) }} style={{ float: 'right', cursor: 'pointer' }} />
            </div>
            <div className={styles.contentsDiv}>
                <div>
                    {
                        props.img == 'logo' ? <Image src={imagePack.component.iconCheck2_w} alt='iconCheck2_w' />
                            :
                            <Image src={imagePack.component.iconTriangleWarn_m} alt='iconTriangleWarn_m' style={{ width: '24px', height: 'auto' }} />
                    }
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {props.text}
                </div>
            </div>

            <div className={styles.btnDiv}>
                {
                    props.onBtn ? (
                        <>
                            <div className={styles.cancelBtn} onClick={() => closeModal(false)}>취소</div>
                            <div className={`${styles.okBtn} ${styles.onBtn}`} style={{ background: (props.img == 'logo') ? 'var(--defaultColor)' : '#ff0000' }} onClick={() => closeModal(false, true)}>
                                {props.goBtn ? props.goBtn : '확인'}
                            </div>
                        </>
                    ) : (
                        <div className={`${styles.okBtn}`} style={{ background: (props.img == 'logo') ? 'var(--defaultColor)' : '#ff0000' }} onClick={() => closeModal(false)}>확인</div>
                    )
                }
            </div>

        </dialog>
    )
} 