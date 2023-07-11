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



export default function PhoneAuth(props) {
    let router = useRouter();

    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');
    const [alertModal, setAlertModal] = useState(false);
    const [complete, setCompelte] = useState(false);

    const [min, setMin] = useState('03');
    const [sec, setSec] = useState('00');
    const time = useRef(180);
    const timerId = useRef(null);

    const [auth, setAuth] = useState(false);

    const [form, setForm] = useState({
        phone1: props.phone.split('-')[0],
        phone2: '****',
        phone3: props.phone.split('-')[2],
        num: '',
        mPhone: props.phone.split('-')[0] + '****' + props.phone.split('-')[2],
    });
    const [isValid, setIsValid] = useState({
        phone: false,
        num: false
    });

    const [f, setF] = useState(false);
    const [f2, setF2] = useState(false);


    // 모바일인지 확인
    const [mobile, setMobile] = useState(false);

    const [phoneNumber, setPhoneNumber] = useState('');

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

            clearInterval(timerId.current);
            // dispatch event

            // const to = props.phone.replace(/-/g, '');

            fetch('/api/fetch/delete-phone-otp', {
                method: "POST",
                body: JSON.stringify({
                    // "to": to,
                    type: 'assets'
                })
            })
                .then(async (res) => {
                    const sendResult = await res.json();

                    if (sendResult.success) {
                        setText('인증번호가 만료되었습니다. 인증번호를 재발송 해주세요.');
                        setImg('alert');
                        setAlertModal(true);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }, [sec]);

    useEffect(() => {
        return () => {
            clearInterval(timerId.current);
        }
    }, [])


    // 인증번호 보내기 debounce //
    const [resValueAuthnum, setResValueAuthnum] = useState({});
    const fetchUseCallbackAuthnum = useCallback(async (url, obj) => {
        setResValueAuthnum(await apiFetch2(url, obj));
    });
    const apiDebounceAuthnum = debounce(fetchUseCallbackAuthnum, 500);

    useEffect(() => {
        if (resValueAuthnum.hasOwnProperty('success')) {
            if (resValueAuthnum.success) {

                clearInterval(timerId.current);
                setForm({ ...form, num: '' });
                setMin('03');
                setSec('00');
                time.current = 180;

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

                setText('입력하신 휴대번호로 인증번호가 발송되었습니다.\n인증번호 6자리를 입력해 주세요');
                setImg('logo');
                setAlertModal(true);

                return () => clearInterval(timerId.current);
            } else {
                if(resValueAuthnum.code==1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    setText('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                    setImg('alert')
                    setAlertModal(true);
                    if (!alertModal) {
                        history.push('/~');
                    }
                }
            }
        }
    }, [resValueAuthnum]);
    // 인증번호 보내기 debounce //


    /**
     * 인증번호 보내기
     * @returns 
     */
    async function authNumSend() {
        setF(true);

        setAuth(true);


        apiDebounceAuthnum('/api/fetch/authnum-send', {
            method: "POST",
            body: JSON.stringify({
                // "to": to
                type: 'assets'
            })
        })
    }

    //모바일 상태에서 입력받은 휴대폰 번호 000-0000-0000 형태로 커스텀
    function mobilePhoneSeperate(phone) {
        let phone_str = '';
        let first = '';
        let second = '';
        let third = '';

        if (phone) {
            let len = phone.length;
            if (len == 11) { //3-4-4
                first = phone.slice(0, 3);
                second = phone.slice(3, 7);
                third = phone.slice(7, 11);
            } else { //3-3-4
                first = phone.slice(0, 3);
                second = phone.slice(3, 6);
                third = phone.slice(6, 10);
            }

            phone_str = first + '-' + second + '-' + third;

        }

        return phone_str;
    }

    // 인증번호 확인 debounce //
    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async (url, obj) => {
        setResValue(await apiFetch2(url, obj));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(() => {
        if (resValue.hasOwnProperty('success')) {
            if (resValue.success) {
                clearInterval(timerId.current);
                setIsValid({ ...isValid, num: true });
                setText('휴대폰 인증이 완료되었습니다.');
                setImg('logo');
                setAlertModal(true);
                // setCompelte(true);
                props.setSeq(1);
                props.setCode(form.num);

            } else {
                if(resValue.code==1001) {
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
                    setAlertModal(true);
                    setIsValid({ ...isValid, num: false });
                }
            }
        }
    }, [resValue]);
    // 인증번호 확인 debounce //

    async function checkPhoneAuth() {
        // const to = props.phone.replace(/-/g, '');
        apiDebounce('/api/fetch/check-phone-otp', {
            method: "POST",
            body: JSON.stringify({
                // to,
                type: 'assets',
                authNum: form.num,
            })
        });
    }

    function closeAlert(boolean) {
        // if (complete) {
        //     props.setSeq(1);
        //     setAlertModal(boolean);
        // } else {
        setAlertModal(boolean);
        // }
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />

            {/* <Header /> */}

            <Container>
                <section className={styles.section} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                    <div className={styles.pwModifyContainer}>

                        {/* <div className={styles.backBtn}><div onClick={() => router.back()}><Image src={imagePack.component.iconLeftGray_w} alt='iconLeft'/> <span>뒤로가기</span></div></div> */}

                        <div className={styles.title}>{props.title}</div>
                        <div className={styles.subTitle}>
                            휴대폰번호 인증을 먼저 수행합니다.
                        </div>

                        <div className={styles.modiInputDiv}>
                            <div className={styles.inputLabel}>휴대폰번호 </div>
                            <div className={styles.selectBox}>
                                {/* <select className={styles.telecom} name='telecom' value={form.telecom} onChange={(e) => setForm({ ...form, telecom: e.target.value })} style={{ width: '7.5rem' }} disabled={!isValid.phone ? false : true}>
                                    <option value='skt'>SKT</option>
                                    <option value='kt'>KT</option>
                                    <option value='u'>U+</option>
                                </select> */}

                                <div className={styles.phoneAuthDiv}>
                                    <div className={styles.wBr}>
                                        <input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} style={{ width: '5rem', paddingInline: '0', textAlign: 'center' }} type='text'
                                            disabled />
                                        <span className={styles.wBr}>&nbsp;―&nbsp;</span>
                                        <input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} style={{ width: '6.25rem', paddingInline: '0', textAlign: 'center' }} type='text'
                                            disabled />
                                        <span className={styles.wBr}>&nbsp;―&nbsp;</span>
                                        <input value={form.phone3} onChange={(e) => setForm({ ...form, phone3: e.target.value })} style={{ width: '6.25rem', paddingInline: '0', textAlign: 'center' }} type='text'
                                            disabled />
                                    </div>
                                    <div className={styles.mBr} style={{ marginRight: '1rem' }}>
                                        <input value={form.mPhone} onChange={(e) => setForm({ ...form, mPhone: e.target.value })} style={{ width: '13rem', paddingInline: '1.5rem', textAlign: 'left' }} type='text'
                                            disabled
                                        />
                                    </div>
                                    {
                                        !isValid.num ? <div className={`${styles.phone} ${styles.authBtn}`} style={{ width: '16.2rem' }} onClick={debounce(authNumSend, 500)}>{auth ? '재전송' : '인증번호 전송'}</div>
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
                                    disabled={auth ? false : true}
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
                                        02-3454-0136 번호가 스팸 문자로 등록되어있는 것은 아닌지 확인해주세요. <br className={styles.wBr} /> 스팸문자로 등록되어있지 않다면, 다시한번 '인증번호 전송'을 눌러주세요.</span>
                                </div>
                            </div>
                        </div>


                        <div className={styles.btnDiv}>
                            <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                            {
                                (f) ? (<div className={styles.authBtn} onClick={checkPhoneAuth} style={{ width: '27.5rem' }}>확인</div>) :
                                    (<div className={styles.authBtn} style={{ width: '27.5rem', background: '#b2b2b2' }}>확인</div>)
                            }

                        </div>


                    </div>
                </section>
            </Container>
            {/* <Footer /> */}
        </>
    )
}
