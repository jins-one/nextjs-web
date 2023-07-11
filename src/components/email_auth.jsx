import styles from '@/styles/pages/modify_myinfo.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import useValid from '@/functions/isValid';
import ValidText from '@/components/isValid';
import AlertDialogNew2 from './alertDialog';

import apiFetch2 from '@/functions/apiFetch2';

import defines from '@/defines/defines';
import configs from '@/configs/configs';

import { debounce } from 'lodash';
import maskingEmail from '@/functions/emailMasking';



export default function EmailAuth(props) {
    let router = useRouter();

    const [img, setImg] = useState('logo');
    const [text, setText] = useState('');
    const [alertModal, setAlertModal] = useState(false);
    const [complete, setCompelte] = useState(false);

    const [min, setMin] = useState('05');
    const [sec, setSec] = useState('00');
    const time = useRef(300);
    const timerId = useRef(null);

    const [auth, setAuth] = useState(false);


    const [form, setForm] = useState({
        email: props.email,
        num: '',
    });
    const [isValid, setIsValid] = useState({
        phone: false,
        num: false
    });

    const [f, setF] = useState(false);
    const [f2, setF2] = useState(false);

    // 모바일인지 확인
    const [mobile, setMobile] = useState(false);


    useEffect(() => {
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    }, []);

   
    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {

            fetch('/api/fetch/delete-email-otp',{
                method : "POST",
                body : JSON.stringify({
                    // email : props.email
                    type: 'assets'
                })
            })
            .then(async (res)=>{
                // console.log(res);
                const sendResult = await res.json();

                if(sendResult.success){
                    setText('인증번호가 만료되었습니다. 인증번호를 재발송 해주세요.');
                    setImg('alert');
                    setAlertModal(true);
                }
                // 
            })
            .catch(err => {
                console.log(err);
            })

            clearInterval(timerId.current);
            // dispatch event
        }
    }, [sec]);

    useEffect(() => {
        return () => {
            clearInterval(timerId.current);
            delete window.modalClose;
        }
    }, [])


    // 인증번호 보내기 debounce //
    const [resValueAuthnum, setResValueAuthnum] = useState({});
    const fetchUseCallbackAuthnum = useCallback(async(url, obj)=>{
        setResValueAuthnum(await apiFetch2(url, obj));
    });
    const apiDebounceAuthnum = debounce(fetchUseCallbackAuthnum, 500);

    useEffect(()=>{
        if(resValueAuthnum.hasOwnProperty('success')){
            if (resValueAuthnum.success) {
                setAuth(true);

                clearInterval(timerId.current);
                setForm({ ...form, num: '' });
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

                setText('가입하신 메일로 인증번호가 발송되었습니다.\n인증번호 6자리를 입력해 주세요');
                setImg('logo');
                setAlertModal(true);
    
                return () => clearInterval(timerId.current);
            } else {
                if(resValueAuthnum.code==1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    setText('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                    setImg('alert');
                    setAlertModal(true);
                    if (!alertModal) {
                        history.push('/~');
                    }
                }
            }
        }
    },[resValueAuthnum]);
    // 인증번호 보내기 debounce //


    /**
     * 인증번호 보내기
     * @returns 
     */
    async function authNumSend() {
        setF(true);

            apiDebounceAuthnum('/api/auth/email-no-member-check',{
                method : "POST",
                body: JSON.stringify({
                    // email: props.email,
                    type: 'assets'
                })
            })

    }

    // 인증번호 확인 debounce //
    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj)=>{
        setResValue(await apiFetch2(url, obj));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        if(resValue.hasOwnProperty('success')){
            if (resValue.success) {
                clearInterval(timerId.current);
                setIsValid({ ...isValid, num: true });
                setText('이메일 인증이 완료되었습니다.');
                setAlertModal(true);
                setCompelte(true);
                props.setCode(form.num);

            } else if(resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                router.push('/');
            } else {
                if (resValue.code == 3001) {
                    setText('인증번호가 유효하지 않습니다.\n인증번호 재발급 후 다시 시도해주세요.');
                } else if (resValue.code == 3002) {
                    setText('인증번호가 올바르지 않습니다.');
                } else {
                    setText('오류가 발생했습니다. 다시 시도해 주세요.');
                }
                setImg('alert');
                setIsValid({ ...isValid, num: false });
                setAlertModal(true);
            }
        }
    },[resValue]);
    // 인증번호 확인 debounce //

    async function checkPhoneAuth() {
        setF2(true);

        apiDebounce('/api/join',{
            method: 'POST',
            body: JSON.stringify({
                // email: props.email,
                code: form.num,
                type: 'assets'
            })
        });
    }

    function closeAlert(boolean) {
        if (complete) {
            props.setSeq(1);
            setAlertModal(boolean);
        } else {
            setAlertModal(boolean);
        }
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />

            <Container>
                <section className={styles.section} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                    <div className={styles.pwModifyContainer}>

                        <div className={styles.title}>{props.title}</div>
                        <div className={styles.subTitle}>
                            이메일 인증을 먼저 수행합니다.
                        </div>

                        <div className={styles.modiInputDiv}>
                            <div className={styles.inputLabel}>이메일</div>
                            <div className={styles.selectBox}>


                                <div className={styles.phoneAuthDiv} style={{width:'100%', justifyContent:'space-between'}}>
                                    <input value={form.email} type={'text'} disabled style={{width:mobile?'208px':'340px'}}/>
        
                                    {
                                        !isValid.num ? <div className={`${styles.phone} ${styles.authBtn}`} style={{ width: '16.2rem' }} onClick={debounce(authNumSend,500)}>{auth ? '재전송' : '인증번호 전송'}</div>
                                            :
                                            <div className={styles.authDoneBtn} style={{ width: mobile ? '6rem' : '16.2rem' }} >인증완료</div>
                                    }
                                </div>
                            </div>

                        </div>

                        <div className={styles.modiInputDiv} style={{ marginTop: mobile ? '0.688rem' : '2.875rem' }}>
                            <div className={styles.inputLabel}>인증번호 {(f2 && !isValid.num) && <ValidText valueType={'num'} />}</div>
                            <div className={`inputAuthNumber ${styles.selectBox}`} style={{ position: 'relative' }}>
                                <input value={form.num} onChange={(e) => setForm({ ...form, num: e.target.value })} style={{ width: '100%', paddingInline: '1.5rem' }} maxLength={6} placeholder='인증번호 6자리를 입력해주세요' type='number'
                                    disabled={isValid.num ? true : false}
                                    onInput={(e) => {
                                        if (e.target.value.length > e.target.maxLength)
                                            e.target.value = e.target.value.slice(0, e.target.maxLength);
                                    }} />
                                {
                                    !isValid.num && <div style={{ width: 'fit-content', position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} >{min} : {sec}</div>
                                }

                            </div>

                            <div className={styles.alertDiv}>
                                <div>
                                    <Image src={imagePack.component.iconAlertPurple} alt='iconAlertPurple' style={{ marginRight: '0.75rem' }} />
                                    <span style={{ fontSize: '1rem', fontWeight: '400', color: '#808080' }}>인증번호가 오지 않았나요?</span>
                                </div>
                                <div>
                                    <div style={{ width: '2.25rem' }} />
                                    <span style={{ marginTop: '0.625rem', fontSize: '1rem', color: '#b2b2b2' }}>
                                    스팸 메일확인 후에도 이메일이 오지 않았다면, 블링크 이메일(blink@blink.com)이 차단된 것이 아닌지 확인해주세요.</span>
                                </div>
                            </div>
                        </div>


                        <div className={styles.btnDiv}>
                            <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                            {
                                f ? (<div className={styles.authBtn} onClick={checkPhoneAuth} style={{ width: '27.5rem' }}>확인</div>) :
                                    (<div className={styles.authBtn} style={{ width: '27.5rem', background: '#b2b2b2' }}>확인</div>)
                            }

                        </div>


                    </div>
                </section>
            </Container>
        </>
    )
}
