import styles from '@/styles/components/dialogNew.module.css';
import Image from 'next/image';
import imagePack from '@/styles/image-module';
import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router';

export default function AlertDialogNew({ onModal, closeModal, ...props }) {

    const modalRef = useRef();
    const router = useRouter();

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
    
    function handleClick() {   
        closeModal(false);
        router.push('/');
    }


    return (
        <dialog ref={modalRef} className={styles.contianer} onCancel={()=>closeModal(false)}>

            <div className={styles.closeDiv} style={{cursor:'pointer'}}>
                <Image src={imagePack.component.iconClose} alt='close' onClick={()=>{closeModal(false)}} style={{ float: 'right' }} />
            </div>
            {/* <div className={styles.imgDiv}>
                {
                    props.img == 'logo' ? <Image src={imagePack.header.logo} alt='logo' style={{ width: '142px', height: 'auto', marginTop: '1.875rem' }} />
                        :
                        <Image src={imagePack.component.iconAlert40x40_w} alt='alert' />
                }
            </div> */}
            <div className={styles.textDiv}>
                <div className={styles.textBox}>
                    <Image src={imagePack.component.iconTriangleWarn_m} alt='iconTriangleWarn_m' />
                    <p>{props.txt}</p>
                </div>
                
                {props.goBtn ? (
                    <div className={`${styles.goBtnContainer} ${styles.mt46}`}>
                        <button className={styles.closeBtn} onClick={()=>{closeModal(false)}}>닫기</button>
                        <button className={styles.goBtn} onClick={handleClick}>
                            {props.goBtn}
                        </button>
                    </div>
                ):null}
                {
                    props.subtxt && (
                        <div className={styles.subText}>
                            {props.subtxt}
                        </div>
                    )
                }
            </div>

        </dialog>
    )
} 