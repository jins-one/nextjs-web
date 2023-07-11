import styles from '../styles/components/assetsHistoryMobile.module.css';
import Image from 'next/image';
import Link from 'next/link';
import imagePack from '@/styles/image-module';
import { useState, useEffect } from 'react';


export default function AssetsHistory_m({ data, ...props }) {

    const [toggle, setToggle] = useState(false);

    const [openDetail, setOpenDetail] = useState(false);

    useEffect(() => {
        if (props.close) {
            setToggle(false);
            setOpenDetail(false);
        }
    }, [props.close])

    return (
        <>
            <div className={styles.historyItem}>

                <div className={styles.historyDesc}>
                    <div className={styles.type}>
                        <span>{data.type}</span>
                        <span type={data.status}>{data.status}</span>
                    </div>
                    <div className={styles.date}>{data.s_date}</div>

                    <div className={styles.priceDiv}>
                        <div className={styles.detailItem}>
                            <span>금액</span>
                            <span className={styles.price}>{data.price}</span>
                        </div>
                        <div className={styles.detailItem}>
                            <span>처리일</span>
                            <span>{data.p_date}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.detailDiv}>
                    <div>
                        <div onClick={() => setToggle(!toggle)}>
                            상세내역
                            {
                                toggle ? <Image src={imagePack.component.iconTop2} alt='iconTop2' />
                                    :
                                    <Image src={imagePack.component.iconDown2} alt='iconDown2' />
                            }

                        </div>
                    </div>
                    {
                        toggle && (
                            <div className={styles.detailOpen}>
                                <div className={styles.detailItem}>
                                    <span>금액(ETH)</span>
                                    <span>{data.price}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>수수료(ETH)</span>
                                    <span>{data.fee}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>신청일</span>
                                    <span>{data.s_date}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>처리일</span>
                                    <span>{data.p_date}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span>상세내역</span>
                                    <span className={styles.ellipsis} onClick={()=>setOpenDetail(!openDetail)} detail={openDetail.toString()}>{data.detail}</span>
                                </div>
                                {
                                    data.status == '출금대기' && (
                                        <div className={styles.detailItem}>
                                            <span>출금관리</span>
                                            <span className={styles.withdrawalManagerBtn} onClick={() => { props.modal(true) }}>출금대기<Image src={imagePack.component.iconRightPurple} alt='iconRightPurple' /></span>
                                        </div>
                                    )
                                }

                            </div>
                        )
                    }
                </div>
            </div>

        </>
    );
}