import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import ValidText from '@/components/isValid';
import AlertDialog from '@/components/dialog';

import defines from '@/defines/defines';
import useValid from '@/functions/isValid';
import DisableCkEditor from '@/components/disableCkeditor';
import AlertDialogNew2 from '@/components/alertDialog';

import SignInEmail from '@/components/emailAuth';
import SignIn from '@/components/signin';
import { withSessionSsr } from '@/fetchs/session';
import { useReCaptcha } from 'next-recaptcha-v3';

/**
 * 약관동의
 */
export default function signInConditions(props) {
    let router = useRouter();

    useEffect(()=>{
        alert('정식 서비스 기간이 아닙니다.');
        router.push('/');
    }, [])



    let checkRef = useRef([]);

    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');
    const [alertModal, setAlertModal] = useState(false);

    const [check, setCheck] = useState({
        check1: false,
        check2: false,
        check3: false,
        // check4: false,
        check5: false,
    });


    // 회원가입 단계
    const [seq, setSeq] = useState(0);
    const [email, setEmail] = useState('');

    function totalAccept() {

        if (check.check1) {
            setCheck({
                check1: false,
                check2: false,
                check3: false,
                // check4: false,
                check5: false,
            });

            checkRef.current[0].checked = false;
            checkRef.current[1].checked = false;
            checkRef.current[2].checked = false;
            // checkRef.current[3].checked = false;
            checkRef.current[4].checked = false;

        } else {

            setCheck({
                check1: true,
                check2: true,
                check3: true,
                // check4: true,
                check5: true,
            });

            checkRef.current[0].checked = true;
            checkRef.current[1].checked = true;
            checkRef.current[2].checked = true;
            // checkRef.current[3].checked = true;
            checkRef.current[4].checked = true;
        }

    }


    // useEffect(() => {

    //     if (!checkRef.current[1].checked || !checkRef.current[2].checked || !checkRef.current[3].checked || !checkRef.current[4].checked) {
    //         checkRef.current[0].checked = false;
    //     }

    // }, [check])


    function changeFirstCheckBox() {
        if (!checkRef.current[1].checked || !checkRef.current[2].checked || /*!checkRef.current[3].checked ||*/ !checkRef.current[4].checked) {
            checkRef.current[0].checked = false;
            setCheck({ ...check, check1: false });
        }
    }


    const { executeRecaptcha } = useReCaptcha(); // reCaptcha API 서버로 보낸다. 라는 훅을 선언
    const [recaptchaNum, setRecaptchaNum] = useState('');

    async function goNext() {
        if (checkRef.current[1].checked && checkRef.current[2].checked && checkRef.current[4].checked) {

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
                    setSeq(1);
                    setRecaptchaNum(recaptcha_result.data);

                    setCheck({ ...check, check2: checkRef.current[1].checked, check3: checkRef.current[2].checked/*, check4: checkRef.current[3].checked*/ })
                } else {
                    console.log('bot')
                }
            } else {
                setText('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                setImg('alert');
                setAlertModal(true);
            }

        } else {
            setText('필수 약관에 동의해주세요');
            setImg('alert');
            setAlertModal(true);
        }
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);
    }


    const [code, setCode] = useState('');


    return (
        <>
            <Header />


            <Container>

                {
                    seq == 0 ? (
                        <>
                            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />
                            <section>
                                <div className={styles.findEmailContainer} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                                    <div className={styles.accountTitle}>회원가입</div>
                                    <div className={styles.accountSubTitle}>약관동의</div>

                                    <div className={styles.inputBox}>

                                        <div className={styles.checkDiv}>
                                            <label htmlFor='check1'>
                                                <input type='checkbox' id='check1' ref={e => checkRef.current[0] = e} onChange={totalAccept} />
                                                전체동의
                                            </label>
                                        </div>

                                        <div className={styles.bar2} />

                                        <div className={styles.checkDiv}>
                                            <label htmlFor='check2'>
                                                <input type='checkbox' id='check2' ref={e => checkRef.current[1] = e} onChange={() => { setCheck({ ...check, check2: checkRef.current[1].checked }); changeFirstCheckBox(); }} />
                                                (필수) 서비스 이용약관에 동의합니다.
                                            </label>
                                        </div>
                                        <div className='conditionsBox'>
                                            <DisableCkEditor contents={props.list.service.contents} />
                                        </div>

                                        <div className={styles.checkDiv}>
                                            <label htmlFor='check3'>
                                                <input type='checkbox' id='check3' ref={e => checkRef.current[2] = e} onChange={() => { setCheck({ ...check, check3: checkRef.current[2].checked }); changeFirstCheckBox(); }} />
                                                (필수) 개인정보 수집에 동의합니다.
                                            </label>
                                        </div>
                                        <div className='conditionsBox'>
                                            <DisableCkEditor contents={props.list.privacy.contents} />
                                        </div>

                                        {/* <div className={styles.checkDiv}>
                                            <label htmlFor='check4'>
                                                <input type='checkbox' id='check4' ref={e => checkRef.current[3] = e} onChange={() => { setCheck({ ...check, check4: checkRef.current[3].checked }); changeFirstCheckBox(); }} />
                                                (선택) 마케팅/이벤트 및 정보수신 안내에 동의합니다.
                                            </label>
                                        </div>
                                        <div className='conditionsBox' style={{ marginBottom: '1.5rem' }}>
                                            <DisableCkEditor contents={props.list.marketing.contents} />
                                        </div> */}

                                        <div className={styles.checkDiv}>
                                            <label className={styles.year19Over} htmlFor='check5' style={{ fontSize: '0.875rem', display: 'flex' }}>
                                                <input type='checkbox' id='check5' ref={e => checkRef.current[4] = e} onChange={() => { setCheck({ ...check, check5: checkRef.current[4].checked }); changeFirstCheckBox(); }} />
                                                (필수) 만 19세 이상입니다.
                                            </label>
                                        </div>

                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                            <div className={styles.btnDiv} style={{ width: '38.75rem' }}>
                                                <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                                                <div className={styles.authBtn} onClick={goNext} style={{ width: '27.5rem' }}>다음</div>
                                            </div>
                                        </div>
                                        <div className={styles.recaptchaDisc}>
                                            이 사이트는 reCAPTCHA 에 의해 보호되며 <a href='https://policies.google.com/privacy?hl=ko'>개인정보 보호</a> • <a href='https://policies.google.com/terms?hl=ko'>이용약관</a> 이 적용됩니다.
                                        </div>


                                    </div>
                                </div>
                            </section>
                        </>
                    ) :
                        seq == 1 ? (
                            <SignInEmail seq={setSeq} email={setEmail} rc={recaptchaNum} setCode={setCode}/>
                        ) :
                            seq == 2 && (
                                <SignIn email={email} requirement_1={check.check2} requirement_2={check.check3} /*option_1={check.check4}*/ code={code}/>
                            )
                }
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
            list: defines.cs_list.conditions
        },
    };

});