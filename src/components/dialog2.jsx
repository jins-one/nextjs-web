import styles from '@/styles/components/dialog.module.css';
import Image from 'next/image';
import imagePack from '@/styles/image-module';
import { useEffect, useRef } from 'react';

export default function PopupDialog({ onModal, closeModal, ...props }) {

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


    function test() {
        // if (props.children) {
        //     modalRef.current.addEventListener('keydown', (e) => {
        //         if (e.key === 'Escape') {
        //             e.preventDefault();
        //         }
        //     })
        // } else {
            closeModal(false)
        // }
    }

    return (
        <dialog id='dialog2' ref={modalRef} onCancel={test} onFocus={()=>{modalRef.scrollTop=0}}>

            <div style={{ position: 'relative' }}>
                <div className={styles.closeDiv2}>
                    <Image src={imagePack.component.iconClose} alt='close' onClick={()=>closeModal(false)} style={{ float: 'right', cursor: 'pointer' }} />
                </div>

                <div>
                    {props.children}
                </div>
            </div>

        </dialog>
    )
} 
