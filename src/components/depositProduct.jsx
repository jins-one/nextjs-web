import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

/**
 * style import
 */
import styles from '@/styles/components/deposit_product.module.css';

/**
 * images import
*/
import imagePack from '@/styles/image-module';


export default function DepositProduct({ data }) {
    const router = useRouter();

    let name = data.name;
    let rate = data.rate;
    let count = data.count;
    let period = data.period;
    let application = data.application;
    let min = data.min;
    let max = data.max;

    let gauge = '60%';
    let current = 300;
    let total_eth = 200;


    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    }, [])


    return (
        <>
            {
                mobile ? (
                    <>
                        <div className={`${styles.depositBox} ${styles.mobile}`}>
                            <div>
                                <div className={styles.productNameDiv}>
                                    <Image src={imagePack.component.iconEthPurple} alt='iconEthPurple' />
                                    <div className={styles.productName}>
                                        <div>이더리움</div>
                                        <div>{name}</div>
                                    </div>
                                </div>
                                <div className={styles.insertButton} onClick={() => router.push(`/deposit/${name}`)}>
                                    예치신청
                                </div>
                            </div>
                            <div className={styles.productDesc}>
                                <div className={styles.period}>
                                    <div className={styles.title}>예치기간</div>
                                    <div className={styles.result}>{period}</div>
                                </div>
                                <div className={styles.interest}>
                                    <div className={styles.title}>연이율</div>
                                    <div className={styles.result}>{rate}</div>
                                </div>
                                <div className={styles.quantity}>
                                    <div className={styles.minBox}>
                                        <div className={styles.title}>최소수량</div>
                                        <div className={styles.result}>{min}</div>
                                    </div>
                                    <div className={styles.maxBox}>
                                        <div className={styles.title}>총 수량</div>
                                        <div className={styles.result}>{max}</div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.depositBox}>
                            <div className={styles.boxSection}>
                                <Image src={imagePack.component.iconEthPurple} alt='iconEthPurple' />
                                <div className={styles.productName}>
                                    <div>이더리움</div>
                                    <div>{name}</div>
                                </div>
                                <div className={styles.interest}>
                                    <div className={styles.title}>연이율</div>
                                    <div className={styles.result}>{rate}</div>
                                </div>
                                <div className={styles.period}>
                                    <div className={styles.title}>예치기간</div>
                                    <div className={styles.result}>{period}</div>
                                </div>
                                <div className={styles.quantity}>
                                    <div className={styles.minBox}>
                                        <div className={styles.title}>최소수량</div>
                                        <div className={styles.result}>{min}</div>
                                    </div>
                                    <div className={styles.maxBox}>
                                        <div className={styles.title}>총 수량</div>
                                        <div className={styles.result}>{max}</div>
                                    </div>

                                </div>
                            </div>

                            <div className={styles.insertButton} onClick={() => router.push(`/deposit/${name}`)} >예치신청</div>
                        </div>
                    </>
                )
            }
        </>
    );
}