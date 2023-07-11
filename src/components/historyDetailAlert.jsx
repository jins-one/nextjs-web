import styles from '@/styles/components/alert_dialog.module.css';
import Image from 'next/image';
import imagePack from '@/styles/image-module';
import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router';

export default function HistoryDetailAlert({ onModal, closeModal, ...props }) {

    const modalRef = useRef();

    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
        } else {
            modalRef.current.close();
        }
    }, [onModal]);


    return (
        <dialog ref={modalRef} className={styles.contianer} onCancel={() => closeModal(false)} style={{width:'450px'}}>

            <div className={styles.closeDiv}>
                <Image src={imagePack.component.iconClose} alt='close' onClick={() => { closeModal(false) }} style={{ float: 'right', cursor: 'pointer' }} />
            </div>
            <div style={{fontSize:'1rem', display:'flex', flexDirection:'column'}}>
                <div style={{fontSize:'1.25rem', marginBottom:'1rem', fontWeight:'700'}}>
                    상세내역
                </div>
                <div style={{ wordBreak:'break-all' }}>
                    {props.text}
                </div>
            </div>

        </dialog>
    )
} 