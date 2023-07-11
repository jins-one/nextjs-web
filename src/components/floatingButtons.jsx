import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/components/floatingButtons.module.css';
import Image from 'next/image'
import imagePack from '@/styles/image-module';

import Script from 'next/script';
import configs from '@/configs/configs';

export default function FloatingButtons(element, className){
    const pTagRef = useRef();
    function hasClassName(element, className) {
        return element.classList.contains(className);
      }
    function mouseOver(){
        if(!hasClassName(pTagRef.current,styles.hoverBigAni)){
            pTagRef.current.classList.remove(styles.hoverSmallAni)
            pTagRef.current.classList.add(styles.hoverBigAni)
        }
    }
    function mouseOut(){
        if(!hasClassName(pTagRef.current,styles.hoverSmallAni)){
            pTagRef.current.classList.remove(styles.hoverBigAni)
            pTagRef.current.classList.add(styles.hoverSmallAni)
        }
    }
    function toTop(){
        window.scrollTo({
            top: 0
        })
    }
    function kakaoInit(){
        window.Kakao.init(configs.kakao_dev_key);
    }
    function goChat(){
        window.Kakao.Channel.chat({
            channelPublicId: '_xcQFpxj',
        });
    }
    
    return (
        <div className={styles.container}>

            <Script
                src='https://t1.kakaocdn.net/kakao_js_sdk/2.2.0/kakao.min.js'
                onLoad={kakaoInit} 
                integrity="sha384-x+WG2i7pOR+oWb6O5GV5f1KN2Ko6N7PTGPS7UlasYWNxZMKQA63Cj/B2lbUmUfuC"
                crossorigin="anonymous"
            ></Script>
            
            {/* 메뉴 하나 시작 */}
            <div className={styles.oneMenuBox} onMouseOver={mouseOver} onMouseOut={mouseOut}  >
                {/*  */}
                <div className={styles.iconBgd} onClick={goChat} >
                    <Image className={styles.kakaoIcon} alt={'kakao'} src={imagePack.component.kakaoIcon} />
                </div>

                <div id={'kakao-hover'} className={styles.textBox} ref={pTagRef} onClick={goChat}>
                    <p>궁금한게 있으신가요?</p>
                    <p>챗봇을 통해 물어보세요</p>
                </div>

            </div>
            {/* 메뉴 하나 끝 */}



            {/* 메뉴 하나 시작 */}
            {/* <div className={styles.oneMenuBox}> */}
                {/*  */}
                {/* <div className={styles.iconBgd}> */}
                    <Image className={`${styles.topIcon} ${styles.mt20}`} alt={'kakao'} src={imagePack.component.buttonToTop} onClick={toTop} priority/>
                {/* </div> */}

            {/* </div> */}
            {/* 메뉴 하나 끝 */}

        </div>
    )
}