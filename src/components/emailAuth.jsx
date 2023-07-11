import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';

import useValid from '@/functions/isValid';

import defines from '@/defines/defines';
import ValidText from '@/components/isValid';
import AlertDialogNew2 from '@/components/alertDialog';

import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';

import { debounce } from 'lodash';


/**
 * 회원가입 시 이메일 인증받는 페이지
 * @param {*} props 
 * @returns 
 */
export default function SignInEmail(props) {
    const router = useRouter();

    const [f, setF] = useState(false);
    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');
    const [alertModal, setAlertModal] = useState(false);
    const [allStepComplete, setAllStepComplete] = useState(false);

    const [email, setEmail] = useState('');
    const [auth, setAuth] = useState(false);
    const [emailCheck, setEmailCheck] = useState(false);
    const [isValid, setIsValid] = useState(false);

    const [inputNum, setInputNum] = useState('');

    const [min, setMin] = useState('05');
    const [sec, setSec] = useState('00');
    const time = useRef(300);
    const timerId = useRef(null);


    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {

            fetch('/api/fetch/delete-email-otp', {
                method: "POST",
                body: JSON.stringify({
                    email: email
                })
            })
                .then(async (res) => {
                    // console.log(res);
                    const sendResult = await res.json();

                    if (sendResult.success) {
                        setImg('alert');
                        setText('인증번호가 만료되었습니다. 인증번호를 재발송 해주세요.');
                        setAlertModal(true);
                    }
                })
                .catch(err => {
                    // console.log(err);
                })

            // setNum('');
            clearInterval(timerId.current);
            // dispatch event
        }
    }, [sec]);

    useEffect(() => {
        return () => {
            clearInterval(timerId.current);
        }
    }, []);

    const [resValueAuthnum, setResValueAuthnum] = useState({});
    const fetchUseCallbackAuthnum = useCallback(async (url, obj, email) => {
        setResValueAuthnum(await apiFetch2(url, obj, email));
    });
    const apiDebounceAuthnum = debounce(fetchUseCallbackAuthnum, 500);

    useEffect(() => {
        if (resValueAuthnum.hasOwnProperty('success')) {
            if (resValueAuthnum.success) {
                if (resValueAuthnum.data == 1) {
                    setImg('alert');
                    setText('이미 가입된 이메일이 있습니다. 다시 시도 해주세요.');
                    setAlertModal(true);

                } else {

                    setAuth(true);

                    setImg('logo');
                    setText('회원가입을 위한 인증메일을 발송하였습니다.\n메일함을 확인하여 주시기 바랍니다.');
                    setAlertModal(true);

                    clearInterval(timerId.current);
                    setInputNum('');
                    setMin('05');
                    setSec('00');
                    time.current = 300;

                    timerId.current = setInterval(() => {
                        time.current -= 1;

                        setMin('0' + String(parseInt(time.current / 60)));
                        let seconds = time.current % 60;

                        if (seconds < 10) {
                            setSec('0' + String(seconds));
                        } else {
                            setSec(String(seconds));
                        }
                    }, 1000);

                }
            } else {
                if(resValueAuthnum.code==1001){
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/')
                } else {
                    alert('오류가 발생했습니다. 다시 시도해 주세요.');
                    router.reload();
                }
            }
        }
    }, [resValueAuthnum]);

    async function goEmailAuth() {
        setF(true);

        let email_valid = useValid(email, defines.regex.email);
        setEmailCheck(email_valid);

        if (email_valid) {
            let api_url = '/api/auth/email';
            let obj = {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    rc: props.rc
                })
            }
            let masking_email = await maskingEmail(email);
            apiDebounceAuthnum(api_url, obj, masking_email);
        }
    }

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async (url, obj) => {
        setResValue(await apiFetch2(url, obj));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(() => {
        if (resValue.hasOwnProperty('success')) {
            if (resValue.success) {
                setIsValid(true);
                setText('이메일 인증에 성공하였습니다.');
                setImg('logo');
                setAlertModal(true);

                props.setCode(inputNum);
                setAllStepComplete(true);
            } else {
                if (resValue.code == 3001) {
                    setText('인증번호가 유효하지 않습니다.\n인증번호 재발급 후 다시 시도해주세요.');
                } else if (resValue.code == 3002) {
                    setText('인증번호가 올바르지 않습니다.');
                } else if(resValue.code == 3003) {
                    setText('인증 메일을 다시 요청해 주세요.')
                } else if (resValue.code==1001) {
                    setText('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                } else {
                    setText('오류가 발생했습니다. 다시 시도해 주세요.');
                }
                setImg('alert');
                setIsValid(false);
                setAlertModal(true);
            }
        }
    }, [resValue]);

    async function goNextStep() {

        apiDebounce('/api/join', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                code: inputNum,
            })
        })
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);
        if (allStepComplete && isValid) {

            props.email(email)
            props.seq(2);
        }
    }


    return (
        <>

            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />

            <section>
                <div className={styles.findEmailContainer} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                    <div className={styles.accountTitle}>회원가입</div>
                    <div className={styles.accountSubTitle}>이메일 인증</div>

                    <div className={`${styles.signinEmail} ${styles.inputBox}`}>
                        <div className={styles.inputDiv}>
                            <div className={styles.inputLabel2}>
                                이메일
                                {(f && !emailCheck) && <ValidText valueType={'email'} />}
                            </div>
                            <div className={styles.selectBox}>
                                <div style={{ position: 'relative' }}>
                                    <input className={styles.emailAuth} type='email' value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '28.375rem' }} placeholder='blink@blink.com' disabled={auth ? true : false} />
                                    {
                                        (!auth && email) && (
                                            <Image src={imagePack.component.iconX_w} alt='iconX_w'
                                                style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                onClick={() => setEmail('')} />
                                        )
                                    }
                                </div>
                                <div className={styles.authBtn2} style={{ width: '142px' }} onClick={goEmailAuth}>{auth ? '재전송' : '인증메일 전송'}</div>
                            </div>
                        </div>


                        <div className={styles.subText}>
                            <div>*이메일은 변경이 불가합니다.</div>
                            <div>*이메일 인증 후 블링크 서비스 이용이 가능합니다.</div>
                            {/* <div>*인증을 정상적으로 진행하셨다면, [다음]버튼을 눌러 회원가입을 계속 진행해주세요.</div> */}
                        </div>

                        {
                            auth && (
                                <>
                                    <div className={styles.inputDiv} style={{ marginTop: 'var(--size-40)' }}>
                                        <div className={styles.inputLabel2}>
                                            인증번호
                                            {(allStepComplete && !isValid) && <ValidText valueType={'num'} />}
                                        </div>
                                        <div className={styles.selectBox} style={{ position: 'relative' }}>
                                            <input value={inputNum} onChange={(e) => setInputNum(e.target.value)} style={{ width: '100%', border: (allStepComplete && !isValid) ? '2px solid #ff0000' : '2px solid #b2b2b2' }} maxLength={6} placeholder='인증번호 6자리를 입력해주세요' disabled={isValid ? true : false} type='number'
                                                onInput={(e) => {
                                                    if (e.target.value.length > e.target.maxLength)
                                                        e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                }} />
                                            <div style={{ width: 'fit-content', position: 'absolute', right: '1.5rem' }} >{min} : {sec}</div>

                                        </div>
                                    </div>
                                    <div className={styles.alertDiv} style={{ marginTop: 'var(--size-10)' }}>
                                        <div>
                                            <Image src={imagePack.component.iconAlertPurple} alt='iconAlertPurple' style={{ marginRight: '0.75rem' }} />
                                            <span style={{ fontSize: '1rem', fontWeight: '500', color: '#808080' }}>메일이 오지 않았나요?</span>
                                        </div>
                                        <div>
                                            <div style={{ width: '2.25rem' }} />
                                            <span style={{ marginTop: '0.625rem', fontSize: '1rem', color: '#b2b2b2' }}>
                                                블링크의 메일주소가 스펨메일로 등록되어 있는 것은 아닌지 확인해 주세요.<br className={styles.wBr} /> 스팸메일로 등록되어있지 않다면, 다시한번 '재전송'버튼을 눌러주세요.</span>
                                        </div>
                                    </div>
                                </>
                            )
                        }




                        <div className={styles.btnDiv} style={{ marginTop: '3.75rem' }}>
                            <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                            <div className={styles.authBtn} onClick={goNextStep} style={{ width: '27.5rem' }}>다음</div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    )

}
