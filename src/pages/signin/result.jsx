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
import { withSessionSsr } from '@/fetchs/session';

/**
 * 회원가입 후 이메일의 링크를 타고 와야 들어올 수 있는 페이지
 */
export default function signInResult(props) {
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
                        
                        <div className={styles.resultBox} >
                            <Image src={imagePack.header.logo} alt='logo' className={styles.logo2}/>

                            <div className={styles.resultText}>
                                <div>회원가입이 완료되었습니다.</div>
                                <div>다시 로그인해 주세요</div>

                            </div>

                            <div className={styles.loginBtn2} onClick={goLogin} style={{marginBottom:'0'}}>확인</div>

                        </div>
                    </div>
                </section>
            </Container>

            <Footer />
        </>
    )

}


export const getServerSideProps = withSessionSsr(async function ({ req, res }) {
    let session = req.session.user;
    if (session) {
        return {
            redirect: {
                permanent: false,
                destination: "/",
            }
        }
    }

    return {
        props: {
            data: defines.mydata
        },
    };

});