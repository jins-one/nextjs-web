import styles from '../styles/components/coin_rate.module.css';
import Image from 'next/image';

import imagePack from '@/styles/image-module';

import { useRef, useEffect, useState } from 'react';

import { numberCountAnime } from '@/functions/anim/anime-module';

/**
 * 메인 페이지
 */
export default function CoinRate(props) {

    const amountRef = useRef();
    const rateRef = useRef();

    

    useEffect(()=>{
        numberCountAnime(amountRef, 0, props.amount, 1000);
        numberCountAnime(rateRef, 0, props.rate, 500, ()=>{
            rateRef.current.innerText = "+" + rateRef.current.innerText
        });
    },[]);

    return (
        <>
            <div className={styles.coinRateBox}>
                <Image src={imagePack.component.iconEth} style={{ marginRight: '0.75rem' }} alt='iconEth' />
                <div className={styles.coinRateText}>
                    <div className={styles.coinRateType}>
                        <div><span>{props.type}</span><span>{props.type_en}</span></div>
                    </div>
                    <div className={styles.coinRateAmount}>
                        <span ref={amountRef}></span> <span ref={rateRef}></span>
                    </div>
                </div>
            </div>

        </>
    );

    
}
