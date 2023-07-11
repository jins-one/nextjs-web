import styles from '@/styles/components/dialog.module.css';
import Image from 'next/image';
import imagePack from '@/styles/image-module';
import { useEffect, useContext } from 'react';

export default function AlertDialog(props) {

    function closeDialog() {
        document.getElementById('dialog').close();
        document.querySelector('body').classList.remove('scrollLock');

        if (window.hasOwnProperty('modalClose') && props.parentComplete) {
            window.modalClose();
        }
    }


    return (
        <dialog id='dialog'>

            <div className={styles.closeDiv}>
                <Image src={imagePack.component.iconClose} alt='close' onClick={closeDialog} style={{ float: 'right', cursor: 'pointer' }} />
            </div>
            <div className={styles.imgDiv}>
                {
                    props.img == 'logo' ? <Image src={imagePack.header.logo} alt='logo' style={{ width: '142px', height: 'auto', marginTop: '1.875rem' }} />
                        :
                        <Image src={imagePack.component.iconAlert40x40_w} alt='alert' />
                }

            </div>
            <div className={styles.textDiv}>
                {props.txt}
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
