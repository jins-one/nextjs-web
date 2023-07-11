import Image from 'next/image';
import Link from 'next/link';

/**
 * style import
 */
import styles from '../styles/components/ongoing_deposit.module.css';

/**
 * images import
*/

import imagePack from '@/styles/image-module';


export default function OnGoingDeposit({ type }) {
    return (
        <>
            <div className={styles.depositProductBox}>
                <div>
                    <div className={styles.depositProductTitle}>
                        <div>이더리움</div>
                        <div>ETH_20231212_99m</div>
                    </div>
                    {
                        type && (
                            <div className={styles.Dday}>
                                D-30
                            </div>
                        )
                    }
                </div>
                <div style={{marginTop:'1.563rem'}}>
                    <div className={styles.balance}>
                        <div>총 잔액</div>
                        <div>
                            <div className={`${styles.balanceAmount} ${styles.totalBalance}`}>999,999,999,999</div> 
                            <div>WON</div>
                        </div>
                    </div>
                    <div className={styles.balance}>
                        <div>출금가능액</div>
                        <div>
                            <div className={`${styles.balanceAmount}`}>999,999,999,999</div> 
                            <div>ETH</div>
                        </div>
                    </div>
                </div>
                <div className={styles.bar} />
                <div className={styles.dueDate}>
                    <div>
                        <span>신규일:</span>
                        <span>2023.09.09</span>
                    </div>
                    <div>
                        <span>만료일:</span>
                        <span>2028.09.09</span>
                    </div>
                </div>
                {
                    type ? (
                        <div className={`${styles.expireBtn} ${styles.defiBtn}`}><Image src={imagePack.component.iconShare} style={{marginRight:'0.75rem'}} alt="iconShare"/>만기출금</div>
                    ) : (
                        <div className={`${styles.depositBtn} ${styles.defiBtn}`}><Image src={imagePack.component.iconDownload} style={{marginRight:'0.75rem'}} alt="iconDownload"/>입금하기</div>
                    )
                }
            </div>
        </> 
    );
}