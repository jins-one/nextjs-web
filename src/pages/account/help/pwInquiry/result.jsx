import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';


import defines from '@/defines/defines';
import ValidText from '@/components/isValid';

/**
 * 로그인
 */
export default function pwResult(props) {
    let router = useRouter();
    let data = props.data;


    function goLogin() {
        router.replace('/login')
    }

    return (
        <>

            <Header />

            <Container>
                <section>
                <div className={styles.findEmailContainer} style={{minHeight:'calc(100vh - 70px - 314px)', justifyContent:'center'}}>
                        {/* <div className={styles.accountTitle}>아이디(이메일) 찾기</div> */}
                        
                        <div className={styles.resultBox}>
                            <Image src={imagePack.header.logo} alt='logo' className={styles.logo2}/>

                            <div className={styles.resultText}>
                                <div>회원님의 비밀번호가 안전하게 변경되었습니다.</div>
                                <div>다시 로그인하여 주시기 바랍니다.</div>
                            </div>

                            <div className={styles.loginBtn2} onClick={goLogin}>확인</div>

                            {/* <div className={styles.findDiv}>
                                <div className={styles.findItem}>
                                    <div style={{fontSize:'0.875rem', marginBottom:'0.4rem'}}>비밀번호를 잊으셨나요?</div>
                                    <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                        <span className={styles.findItemText}><Link href={'/account/help/pwInquiry'} style={{fontSize:'0.875rem'}}>비밀번호 찾기</Link></span>
                                    </div>
                                </div>
                            </div> */}

                        </div>
                    </div>
                </section>
            </Container>

            <Footer />
        </>
    )

}


export const getServerSideProps = async (context) => {

    return {
        props: {
            data: defines.mydata
        },
    };

};