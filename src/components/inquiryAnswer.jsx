import Image from 'next/image';
import Link from 'next/link';

import styles from '../styles/components/inquiry_item.module.css';

import imagePack from '@/styles/image-module';
import { useState } from 'react';

import dynamic from 'next/dynamic';
import DisableCkEditor from './disableCkeditor';


export default function InquiryAnswer(props) {
    // const DisableCkEditor = dynamic(() => import("@/components/disableCkeditor"), { ssr: false });

    let title = props.title;
    let date = props.answer_date;
    let answer = props.answer;

    return (
        <div className={styles.inquiryBox}>
            <div style={{width:'100%', marginBottom:'0.75rem'}}>
                <div className={styles.answerBedge}>
                    관리자 답변
                </div>
            </div>
            <div className={styles.inquiryTitle}>
                {title}
            </div>
            <div className={styles.dateDiv}>
                <div>{date}</div>
            </div>

            {
                answer && (
                    <div className={styles.contentsDiv}>
                        <DisableCkEditor contents={answer} />
                    </div>
                )
            }

        </div>
    );
}