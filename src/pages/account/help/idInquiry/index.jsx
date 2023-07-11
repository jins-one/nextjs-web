import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import ValidText from '@/components/isValid';
import AlertDialogNew2 from '@/components/alertDialog';

import defines from '@/defines/defines';
import useValid from '@/functions/isValid';
import { debounce } from 'lodash';
import apiFetch2 from '@/functions/apiFetch2';

/**
 * 이메일 찾기
 */
export default function FindId(props) {
    let router = useRouter();

    let data = props.data;
    const [alertModal, setAlertModal] = useState(false);

    const [f, setF] = useState(false);
    const [f2, setF2] = useState(false);
    // const [f3, setF3] = useState(false);

    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');

    const [min, setMin] = useState('03');
    const [sec, setSec] = useState('00');
    const time = useRef(180);
    const timerId = useRef(null);

    const [auth, setAuth] = useState(false);

    const [form, setForm] = useState({
        name: '',
        phone1: '',
        phone2: '',
        phone3: '',
        num: '',
        mPhone: '',
    })

    const [isValid, setIsValid] = useState({
        name: false,
        phone: false,
        num: false,
    })

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

    //이름 regex확인
    function inputName(e) {
        setForm({ ...form, name: e.target.value });

        let name_result = useValid(e.target.value, defines.regex.nochar);
        setIsValid({ ...isValid, name: name_result });
    }

    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {

            clearInterval(timerId.current);
            // dispatch event

            const to = mobile ? form.mPhone : form.phone1 + form.phone2 + form.phone3;

            fetch('/api/fetch/delete-phone-otp', {
                method: "POST",
                body: JSON.stringify({
                    "to": to
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
        return () => clearInterval(timerId.current);
    }, [])

    const [resValueAuthnum, setResValueAuthnum] = useState({});
    const fetchUseCallbackAuthnum = useCallback(async (url, obj, session) => {
        setResValueAuthnum(await apiFetch2(url, obj, session));
    });
    const apiDebounceAuthnum = debounce(fetchUseCallbackAuthnum, 500);

    useEffect(() => {
        if (resValueAuthnum.hasOwnProperty('success')) {
            if (resValueAuthnum.success) {
                if (resValueAuthnum.data == 1) {
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

                    setText('입력하신 휴대폰번호로 인증번호가 발송되었습니다.\n인증번호 6자리를 입력해 주세요');
                    setImg('logo');
                    setAlertModal(true);

                    return () => clearInterval(timerId.current);
                } else {
                    setImg('alert');
                    setText('등록되지 않은 번호입니다.');
                    setAlertModal(true);
                }


            } else {
                if (resValueAuthnum.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/')
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
    }, [resValueAuthnum])


    //인증번호 보내기
    function authNumberSend() {
        setF(true);
        let phone_result;

        if (mobile) {
            phone_result = useValid(form.mPhone, defines.regex.phone);
        } else {
            phone_result = useValid(form.phone1 + form.phone2 + form.phone3, defines.regex.phone);
        }

        if (phone_result) { //휴대폰 번호가 올바르다면 인증번호 보내기
            setIsValid({ ...isValid, phone: phone_result });
            setAuth(true);

            const to = mobile ? form.mPhone : form.phone1 + form.phone2 + form.phone3;
            const phone_num = mobile ? mobilePhoneSeperate(form.mPhone) : form.phone1 + '-' + form.phone2 + '-' + form.phone3;
            apiDebounceAuthnum('/api/fetch/authnum-send', {
                method: "POST",
                body: JSON.stringify({
                    "to": to,
                    "duplicate": 2,
                    "phone_num": phone_num,
                })
            });
        } else {
            setIsValid({ ...isValid, phone: phone_result });
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
                clearInterval(timerId.current);
                setIsValid({ ...isValid, num: true });
                // setText('휴대폰 인증이 완료되었습니다.');
                // setImg('logo');
                // setAlertModal(true);

                if (form.name) {
                    //TODO : 이메일 찾기 api -> 여기서 phone 인증 더블체크
                    router.replace('/account/help/idInquiry/result');
                }



            } else {
                if (resValue.code == 3001) {
                    setText('인증번호가 유효하지 않습니다.\n인증번호 재발급 후 다시 시도해주세요.');
                } else if (resValue.code == 3002) {
                    setText('인증번호가 올바르지 않습니다.');
                } else if (resValue.code == 1001) {
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



    function findPhoneNum() {
        setF2(true);

        if (!isValid.num && auth) {

            const to = mobile ? form.mPhone : form.phone1 + form.phone2 + form.phone3;
            apiDebounce('/api/fetch/check-phone-otp', {
                method: "POST",
                body: JSON.stringify({
                    to,
                    authNum: form.num,
                })
            });
        }
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);
    }


    //모바일 상태에서 입력받은 휴대폰 번호 000-0000-0000 형태로 커스텀
    function mobilePhoneSeperate(phone) {
        let phone_str = '';
        let first = '';
        let second = '';
        let third = '';

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

        return phone_str;
    }

    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />

            <Header />

            <Container>
                <section>
                    <div className={`${styles.findEmail} ${styles.findEmailContainer}`} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                        <div className={styles.accountTitle}>아이디(이메일) 찾기</div>
                        <div className={styles.accountSubTitle}>아이디를 찾기 위해 회원 정보에<br className={styles.mBr} /> 등록한 휴대전화로 인증하여 주시기 바랍니다.</div>

                        <div className={styles.inputBox}>
                            <div className={`${styles.email} ${styles.inputDiv}`} style={{ marginBottom: '2.875rem' }}>
                                <div className={styles.inputLabel2}>
                                    이름
                                    {(f2 && !isValid.name) && <ValidText valueType={'name'} />}
                                </div>
                                <div className={styles.selectBox}>
                                    {/* <select name='national' value={form.national} onChange={(e) => setForm({ ...form, telecom: e.target.value })} style={{ width: '8.125rem' }}>
                                        <option value='local'>내국인</option>
                                        <option value='foreign'>외국인</option>
                                    </select> */}
                                    <input type='text' value={form.name} onChange={inputName} style={{ width: '100%' }} placeholder='이름을 입력하세요' />
                                </div>
                            </div>

                            <div className={styles.inputDiv} >
                                <div className={styles.inputLabel2}>
                                    휴대폰 번호
                                    {(f && !isValid.phone) ? <ValidText valueType={'phone'} /> : (!f && f2 && !isValid.num) ? <ValidText valueType={'phone_check'} /> : <></>}
                                </div>
                                <div className={styles.selectBox}>
                                    {/* <select className={styles.telecom} name='telecom' value={form.telecom} onChange={(e) => setForm({ ...form, telecom: e.target.value })} style={{ width: '7.5rem' }} disabled={!isValid.phone ? false : true}>
                                        <option value='skt'>SKT</option>
                                        <option value='kt'>KT</option>
                                        <option value='u'>U+</option>
                                    </select> */}

                                    <div className={styles.phoneAuthDiv}>
                                        <div className={styles.wBr}>
                                            <input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} style={{ width: '5.5rem', paddingInline: '0', textAlign: 'center' }} maxLength={3} type='number'
                                                disabled={!isValid.phone ? false : true}
                                                onInput={(e) => {
                                                    if (e.target.value.length > e.target.maxLength)
                                                        e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                }} />
                                            <span className={styles.wBr}>&nbsp;―&nbsp;</span>
                                            <input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} style={{ width: '7rem', paddingInline: '0', textAlign: 'center' }} maxLength={4} type='number'
                                                disabled={!isValid.phone ? false : true}
                                                onInput={(e) => {
                                                    if (e.target.value.length > e.target.maxLength)
                                                        e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                }} />
                                            <span className={styles.wBr}>&nbsp;―&nbsp;</span>
                                            <input value={form.phone3} onChange={(e) => setForm({ ...form, phone3: e.target.value })} style={{ width: '7rem', paddingInline: '0', textAlign: 'center' }} maxLength={4} type='number'
                                                disabled={!isValid.phone ? false : true}
                                                onInput={(e) => {
                                                    if (e.target.value.length > e.target.maxLength)
                                                        e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                }} />
                                        </div>
                                        <div className={styles.mBr} style={{ marginRight: '1rem' }}>
                                            <input value={form.mPhone} onChange={(e) => setForm({ ...form, mPhone: e.target.value })} style={{ width: '13rem', paddingInline: '1.5rem', textAlign: 'left' }} maxLength={11} type='number'
                                                disabled={!isValid.phone ? false : true}
                                                onInput={(e) => {
                                                    if (e.target.value.length > e.target.maxLength)
                                                        e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                }}
                                            />
                                        </div>
                                        {
                                            !isValid.num ? <div className={`${styles.phone} ${styles.authBtn}`} style={{ width: '14rem' }} onClick={debounce(authNumberSend, 500)}>{auth ? '재전송' : '인증번호 전송'}</div>
                                                :
                                                <div className={styles.authDoneBtn} style={{ width: mobile ? '6rem' : '14rem' }} >인증완료</div>
                                        }
                                    </div>
                                </div>
                            </div>

                            {
                                auth && (
                                    <>
                                        <div className={styles.inputDiv} style={{ marginTop: mobile ? '1.688rem' : '2.875rem' }}>
                                            <div className={styles.inputLabel2}>
                                                인증번호
                                                {((f && f2) && !isValid.num) && <ValidText valueType={'num'} />}
                                            </div>
                                            <div className={`inputAuthNumber ${styles.selectBox}`} style={{ position: 'relative' }}>
                                                <input value={form.num} onChange={(e) => setForm({ ...form, num: e.target.value })} style={{ width: '100%' }} maxLength={6} placeholder='인증번호 6자리를 입력해주세요' type='number'
                                                    disabled={!isValid.num ? false : true}
                                                    onInput={(e) => {
                                                        if (e.target.value.length > e.target.maxLength)
                                                            e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                    }} />
                                                <div style={{ width: 'fit-content', position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} >{min} : {sec}</div>

                                            </div>

                                            <div className={styles.alertDiv}>
                                                <div>
                                                    <Image src={imagePack.component.iconAlertPurple} alt='iconAlertPurple' style={{ marginRight: '0.75rem' }} />
                                                    <span style={{ fontSize: '1rem', fontWeight: '500', color: '#808080' }}>인증번호가 오지 않았나요?</span>
                                                </div>
                                                <div>
                                                    <div style={{ width: '2.25rem' }} />
                                                    <span style={{ marginTop: '0.625rem', fontSize: '1rem', color: '#b2b2b2' }}>
                                                        02-3454-0136 번호가 스팸 문자로 등록되어있는 것은 아닌지 확인해주세요. <br className={styles.wBr} /> 스팸문자로 등록되어있지 않다면, 다시한번 '재전송'버튼을 눌러주세요.</span>
                                                </div>
                                            </div>
                                        </div>

                                    </>
                                )
                            }

                            <div className={styles.btnDiv}>
                                <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                                <div className={styles.authBtn} onClick={findPhoneNum} style={{ width: '27.5rem' }}>확인</div>
                            </div>



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

        },
    };

};