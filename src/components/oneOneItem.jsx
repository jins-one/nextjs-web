import Image from 'next/image';
import Link from 'next/link';

import styles from '../styles/components/inquiry_item.module.css';

import imagePack from '@/styles/image-module';
import { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import DisableCkEditor from './disableCkeditor';
import WriteCkeditor from './writeCkeditor';
import AlertDialogNew2 from './alertDialog';

/**
 * 1:1 문의 카드
 * @param {*} props 
 * @returns 
 */
export default function OneonOneItem(props) {

    let title = props.title;
    let date = props.date;
    let is_answer = props.is_answer;
    let contents = props.contents;
    // let file = props.file

    let type = props.type;


    return (
        <>

            <div className={styles.inquiryBox}>
                <div style={{ width: '100%', marginBottom: '0.75rem' }}>
                    <div className={styles.typeBedge}>
                        문의유형1
                    </div>
                </div>
                <div className={styles.inquiryTitle}>
                    {title}
                </div>
                <div className={styles.dateDiv}>
                    <div>{date}</div>
                    {
                        !type && 
                        (is_answer ? <div className={styles.answerDone}>답변완료</div> : <div className={styles.answerWait}>답변대기</div>)
                    }

                </div>

                {
                    contents && (

                        <div className={styles.contentsDiv}>
                            <DisableCkEditor contents={contents} />
                        </div>

                    )
                }

                {/* {
                    file && (
                        <div className={styles.attachedFileDiv}>
                            <div className={styles.fileCount}>파일첨부({file.length}개)</div>
                            {
                                file.map((f, idx) => (
                                    <div key={idx} className={styles.fileContents}>
                                        {idx + 1}. {f.name} ({f.size})
                                    </div>
                                ))
                            }
                        </div>
                    )
                } */}

            </div>
        </>
    );
}