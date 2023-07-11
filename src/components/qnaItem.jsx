import Image from 'next/image';
import Link from 'next/link';

import styles from '../styles/components/qna_item.module.css';

import imagePack from '@/styles/image-module';
import { useState } from 'react';


export default function QnAItem(props) {

    const [toggle, setToggle] = useState(false);

    let title = props.title;
    let answer = props.answer;

    return (
        <>
            <div className={styles.itemList}>

                {
                    toggle ? (

                        <div className={styles.titleDiv2} onClick={() => setToggle(!toggle)}>
                            <Image src={imagePack.component.iconTop} alt='iconTop' />
                            <div className={styles.ListFullTitle}><span className={styles.qnaType}>Q.</span>{title}</div>
                        </div>

                    ) : (

                        <div className={styles.titleDiv} onClick={() => setToggle(!toggle)}>
                            <Image src={imagePack.component.iconDown} alt='iconDown' />
                            <div className={styles.ListTitle}><span className={styles.qnaType}>Q.</span>{title}</div>
                        </div>

                    )
                }


            </div>

            {
                toggle && (
                    <>
                        {/* <div className={styles.bar}></div> */}
                        <div className={styles.answerBox}>
                            <div className={styles.mobileAnswerDiv}>
                                <span className={styles.qnaType}>A.</span>
                                <span>{answer}</span>
                            </div>
                        </div>
                    </>
                )
            }

        </>
    );
}