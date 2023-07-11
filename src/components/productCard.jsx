import Image from 'next/image';
import Link from 'next/link';

/**
 * style import
 */
import styles from '../styles/components/product_card.module.css';

/**
 * images import
*/

import imagePack from '@/styles/image-module';

import { hoverButtonAnime } from '@/functions/anim/anime-module';
import { useEffect, useRef } from 'react';


export default function ProductCard(props) {

    const buttonRef = useRef();

    useEffect(()=>{
        hoverButtonAnime(buttonRef, "#000", "#8F00FF", 300);
    },[]);

    return (
        <>
            {/* <div className={styles.productBox}>
                <div className={styles.productImgDiv}>
                    <Image src={imagePack.component.Ethereum} className={styles.eth_img} alt="Ethereum" />
                </div>
                <div>
                    <div className={styles.productTitle}>Ethereum_202301_<span className={styles.productTitleM}>12M</span></div>

                    <div className={styles.productDesc}>

                        <div className={styles.productSub}>
                            <div className={styles.productSubTitle}>
                                연이율
                            </div>
                            <div className={`${styles.productSubText} ${styles.productTitleM} ${styles.textEn}`}>
                                16%
                            </div>
                        </div>
                        <div className={styles.productSub}>
                            <div className={styles.productSubTitle}>
                                최소 수량
                            </div>
                            <div className={`${styles.productSubText} ${styles.textEn}`}>
                                1 ETH
                            </div>
                        </div>
                        <div className={styles.productSub}>
                            <div className={styles.productSubTitle}>
                                최대 수량
                            </div>
                            <div className={`${styles.productSubText} ${styles.textEn}`}>
                                500 ETH
                            </div>
                        </div>
                        <div className={styles.productSub}>
                            <div className={styles.productSubTitle}>
                                신청기간
                            </div>
                            <div className={`${styles.productSubText} ${styles.textKr}`}>
                                <span className={styles.textEn}>12</span>개월
                            </div>
                        </div>
                        <div className={styles.productSub}>
                            <div className={styles.productSubTitle}>
                                기간
                            </div>
                            <div className={`${styles.productSubText} ${styles.textKr}`}>
                                상시 신청 가능
                            </div>
                        </div>

                    </div>

                </div>
            </div> */}

            <div className={styles.productBox}>
                {
                    props.event ? (<div className={styles.yesEvent}>봄맞이 이벤트</div>) : (<div className={styles.noEvent}></div>)
                }
                <div className={styles.productTitle}>
                    이더리움
                </div>
                <div className={styles.productCode}>
                    ETH_20231212_99m
                </div>

                <div className={styles.productTextDiv}>
                    <div>
                        <div className={styles.productText}>
                            <div>최소 수량</div>
                            <div>9.99 ETH</div>
                        </div>
                        <div className={styles.productText}>
                            <div>최대 수량</div>
                            <div>100000 ETH</div>
                        </div>
                    </div>
                    <div>
                        <div className={styles.productText}>
                            <div>연이율</div>
                            <div>9.99%</div>
                        </div>
                        <div className={styles.productText}>
                            <div>예치 기간</div>
                            <div>12개월</div>
                        </div>
                    </div>
                </div>

                {
                    props.deadline ? (<div className={`${styles.productBtn} ${styles.deadBtn}`}>신청마감</div>)
                        : (<div className={`${styles.productBtn} ${styles.aliveBtn}`} ref={buttonRef}>신청하기</div>)
                }
            </div>
        </>
    );
}