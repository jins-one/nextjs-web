import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';

import defines from '@/defines/defines';
import ValidText from '@/components/isValid';
import useValid from '@/functions/isValid';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';
import { withSessionSsr } from '@/fetchs/session';

import { debounce } from 'lodash';
import { useReCaptcha } from 'next-recaptcha-v3';


/**
 * 로그인
 */
export default function Login(props) {
    let router = useRouter();

    useEffect(() => {
        if (router.query.session == 'no') {

            alert('로그인 세션이 만료되었습니다.')
        }
    }, [])

    const [form, setForm] = useState({
        email: '',
        pw: ''
    });

    const [success, setSuccess] = useState(true);

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async (url, obj, email) => {
        setResValue(await apiFetch2(url, obj, email));
    })
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(() => {
        if (resValue.hasOwnProperty('success')) {
            if (resValue.success) {
                // 비밀번호변경날짜가 지났을때
                if (resValue.redirect) {
                    router.push("/account/passwd");
                } else {
                    router.push('/');
                }
            } else {
                if(resValue.rc==5){
                    setLoginFail(true);
                }

                setForm({ email: '', pw: '' });
                alert(resValue.msg);

                if (resValue.code == 11004) {
                    setSuccess(false);
                } else if (resValue.code == 51011) {
                    router.push('/account/help/pwInquiry');
                } else if(resValue.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                    router.reload();
                }
            }
        }
    }, [resValue]);


    const { executeRecaptcha } = useReCaptcha(); // reCaptcha API 서버로 보낸다. 라는 훅을 선언
    const [loginFail, setLoginFail] = useState(false);
    const [recaptchaNum, setRecaptchaNum] = useState('');

    async function login() {

        let email_valid = useValid(form.email, defines.regex.email);
        if (email_valid) {
            if (loginFail) {
                const token = await executeRecaptcha();
                let res = await fetch('/api/recaptcha', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: token
                    })
                })
                let recaptcha_result = await res.json();

                if (recaptcha_result.success) {
                    if (recaptcha_result.ok) {
                        setRecaptchaNum(recaptcha_result.data);
                        login2();
                    } else {
                        console.log('bot')
                    }
                } else {
                    alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                }
            } else {
                login2();
            }


        } else {
            setSuccess(false);
            setForm({ email: '', pw: '' });
        }
    }



    async function login2() {
        let api_url = '/api/fetch/login';
        let obj = {
            method: 'POST',
            body: JSON.stringify({
                email: form.email,
                pw: form.pw,
                rc: recaptchaNum
            })
        }
        let masking_email = await maskingEmail(form.email);
        apiDebounce(api_url, obj, masking_email);
    }


    /**
     * enter키 눌렀을 때
     * @param {*} e 
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            login();
        }
    };


    return (
        <>

            <Header />

            <Container>
                <section>
                    <div className={styles.loginContainer}>
                        <div className={styles.accountTitle}>로그인</div>

                        <div className={styles.loginBox}>
                            <Image src={imagePack.header.logo} alt='logo' className={styles.logo} priority />

                            <div className={styles.inputDiv} style={{ marginBottom: '2.875rem' }}>
                                <div className={styles.inputLabel}>
                                    이메일
                                </div>
                                <input onChange={(e) => setForm({ ...form, email: e.target.value })} value={form.email} type='email' placeholder='blink@blink.com'
                                    onKeyDown={handleKeyPress} />
                            </div>
                            <div className={styles.inputDiv} style={{ marginBottom: '1.5rem' }}>
                                <div className={styles.inputLabel}>
                                    비밀번호
                                </div>
                                <input onChange={(e) => setForm({ ...form, pw: e.target.value })} value={form.pw} type='password' placeholder='비밀번호를 입력하세요'
                                    onKeyDown={handleKeyPress} />
                            </div>

                            <div className={styles.findDiv} style={{ marginBottom: 'var(--size-50)' }}>
                                <div className={styles.findItem}>
                                    <div>이메일, 비밀번호를 잊으셨나요?</div>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <span className={styles.findItemText}><Link href={'/account/help/idInquiry'}>이메일 찾기</Link></span>
                                        <div className={styles.bar} />
                                        <span className={styles.findItemText}><Link href={'/account/help/pwInquiry'}>비밀번호 찾기</Link></span>
                                    </div>
                                </div>
                                <div className={styles.findItem}>
                                    <div>계정이 없으신가요?</div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={styles.findItemText}><Link href={'/signin'}>회원가입</Link></span>
                                    </div>
                                </div>
                            </div>

                            {
                                !success && (
                                    <div style={{ width: '100%', marginBottom: '0.75rem' }}><ValidText valueType={'login'} /></div>
                                )
                            }
                            <div className={styles.loginBtn} onClick={login}>로그인</div>

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

        },
    };

});