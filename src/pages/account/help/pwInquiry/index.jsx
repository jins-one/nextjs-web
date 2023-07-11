import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import AlertDialogNew2 from '@/components/alertDialog';
import ValidText from '@/components/isValid';

import defines from '@/defines/defines';
import useValid from '@/functions/isValid';
import maskingEmail from '@/functions/emailMasking';

import ResettingPasswd from '@/components/reSettingPasswd';
import apiFetch2 from '@/functions/apiFetch2';

/**
 * 비밀번호 찾기
 */
export default function FindPw(props) {
    let router = useRouter();

    const [alertModal, setAlertModal] = useState(false);

    const [goNext, setGoNext] = useState(false);
    const [sendemail, setSendEmail] = useState(false);
    const [numCheck, setNumCheck] = useState(false);

    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');

    const [min, setMin] = useState('05');
    const [sec, setSec] = useState('00');
    const time = useRef(300);
    const timerId = useRef(null);

    const [seq, setSeq] = useState(0);

    const [auth, setAuth] = useState(false);

    const [maxDay, setMaxDay] = useState(0);
    const [year, setYear] = useState(1900);
    const [birth, setBirth] = useState('');
    const [form, setForm] = useState({
        email: '',
        name: '',
        num: '',
        year: 'default',
        month: 'default',
        date: 'default'
    })

    const [isValid, setIsValid] = useState({
        email: false,
        name: false,
        num: false,
        birth: false
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


    //생년월일 체크
    useEffect(() => {
        if (form.year != 'default' && form.month != 'default' && form.date != 'default') {
            setIsValid({ ...isValid, birth: true });
            setBirth(form.year + '-' + form.month + '-' + form.date);
        } else {
            setIsValid({ ...isValid, birth: false });
        }

    }, [form.year, form.month, form.date])

    useEffect(() => {
        let current_year = new Date().getFullYear();
        setYear(current_year);

    }, [])


    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function setMaxDays() {
        if (form.year != 'default' && form.month != 'default') {
            setMaxDay(getDaysInMonth(form.year.toString(), form.month.toString()))
        }
    }

    useEffect(() => {
        setMaxDays()
    }, [form.year, form.month])



    //email regex확인
    function inputEmail(e) {
        setForm({ ...form, email: e.target.value });

        let email_result = useValid(e.target.value, defines.regex.email);
        setIsValid({ ...isValid, email: email_result });
    }

    //이름 regex확인
    function inputName(e) {
        setForm({ ...form, name: e.target.value });

        let name_result = useValid(e.target.value, defines.regex.nochar);
        setIsValid({ ...isValid, name: name_result });
    }

    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {

            fetch('/api/fetch/delete-email-otp', {
                method: "POST",
                body: JSON.stringify({
                    email: form.email
                })
            })
                .then(async (res) => {
                    // console.log(res);
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

            clearInterval(timerId.current);
            // dispatch event
        }
    }, [sec]);

    useEffect(() => {
        return () => clearInterval(timerId.current);
    }, [])


    //인증번호 보내기
    async function authNumberSend() {
        setSendEmail(true);

        if (isValid.email) {
            //가입된 이메일이 있는지 확인
            const res = await fetch('/api/auth/email2', {
                method: 'POST',
                body: JSON.stringify({
                    email: form.email,
                })
            })
            const data = await res.json();

            if (data.success) {
                if (data.data == 0) {
                    setText('가입된 이메일이 없습니다.');
                    setImg('alert')
                    setAlertModal(true);

                } else {
                    setAuth(true);

                    setText('인증메일이 발송 되었습니다.\n메일함을 확인하여 주시기 바랍니다.');
                    setImg('logo')
                    setAlertModal(true);

                    clearInterval(timerId.current);
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
                if (data.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/')
                } else {
                    setText('오류가 발생했습니다. 다시 시도해 주세요.');
                    setImg('alert')
                    setAlertModal(true);
                }
            }
        } else {

        }

    }


    async function goNextStep() {
        setGoNext(true);
        if (auth) {
            setNumCheck(true);
        }

        if (!isValid.num) {
            const res = await fetch('/api/join', {
                method: 'POST',
                body: JSON.stringify({
                    email: form.email,
                    code: form.num,
                })
            })
            const data = await res.json();

            if (data.success) {
                clearInterval(timerId.current);
                setIsValid({ ...isValid, num: true });

                if (isValid.email && isValid.name) {
                    setSeq(1);
                }

            } else {
                if(data.code==1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                }else if (data.code == 3001) {
                    setIsValid({ ...isValid, num: false });
                    setText('인증번호가 유효하지 않습니다.\n인증번호 재발급 후 다시 시도해주세요.');
                    setImg('alert');
                    setAlertModal(true);
                } else if (data.code == 3002) {
                    setIsValid({ ...isValid, num: false });
                    setText('인증번호가 올바르지 않습니다.');
                    setImg('alert');
                    setAlertModal(true);
                } else {
                    setIsValid({ ...isValid, num: false });
                    setText('오류가 발생했습니다. 다시 시도해 주세요.');
                    setImg('alert');
                    setAlertModal(true);
                } 
            }

        }

        if (isValid.num && isValid.email && isValid.name) {
            setSeq(1);
        }
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />

            <Header />

            <Container>
                {
                    seq == 0 ? (
                        <section>
                            <div className={`${styles.newPasswd} ${styles.findEmailContainer}`} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                                <div className={styles.accountTitle}>비밀번호 찾기</div>
                                <div className={styles.accountSubTitle}>비밀번호를 찾기 위해 회원 정보에 등록한 <br className={styles.mBr} />이메일로 인증하여 주시기 바랍니다.</div>

                                <div className={styles.inputBox}>
                                    <div className={`${styles.pw} ${styles.inputDiv}`} style={{ marginBottom: '2.875rem' }}>
                                        <div className={styles.inputLabel2}>
                                            이름
                                            {(goNext && !isValid.name) && <ValidText valueType={'name'} />}
                                        </div>
                                        <div className={styles.selectBox}>
                                            <input type='text' value={form.name} onChange={inputName} style={{ width: '100%' }} placeholder='성함을 입력해 주세요.' />
                                        </div>
                                    </div>

                                    <div className={`${styles.pw} ${styles.inputDiv}`} style={{ marginBottom: '2.875rem' }}>
                                        <div className={styles.inputLabel2}>
                                            생년월일
                                            {(goNext && !isValid.birth) && <ValidText valueType={'birth'} />}
                                        </div>
                                        <div className={styles.selectBox} style={{ justifyContent: 'flex-start' }}>
                                            <div className={styles.infoBoxCont} style={{ paddingInline: '0', marginLeft: '0' }}>

                                                <div className={styles.addressModi}>
                                                    <div className={`${styles.selectBox} ${styles.birthSelect}`}>
                                                        <select name='year' value={form.year} onChange={(e) => { setForm({ ...form, year: e.target.value }); }} required   >
                                                            <option value='default' disabled size={2}>YYYY</option>
                                                            {
                                                                (() => {
                                                                    let ar = []
                                                                    for (let i = year; i >= 1900; i--) {
                                                                        if (year - i + 1 >= 20) {
                                                                            ar.push(<option key={i} value={i}>{i}</option>)
                                                                        }
                                                                    }
                                                                    return ar
                                                                })()
                                                            }
                                                        </select>
                                                        <div className={`${styles.wBr} ${styles.birthText}`}>년</div>
                                                        <div className={styles.mobileBirth}>
                                                            <select name='month' value={form.month} onChange={(e) => { setForm({ ...form, month: e.target.value }); }} required >
                                                                <option value='default' disabled >MM</option>
                                                                <option value={'01'}>01</option>
                                                                <option value={'02'}>02</option>
                                                                <option value={'03'}>03</option>
                                                                <option value={'04'}>04</option>
                                                                <option value={'05'}>05</option>
                                                                <option value={'06'}>06</option>
                                                                <option value={'07'}>07</option>
                                                                <option value={'08'}>08</option>
                                                                <option value={'09'}>09</option>
                                                                <option value={'10'}>10</option>
                                                                <option value={'11'}>11</option>
                                                                <option value={'12'}>12</option>
                                                            </select>
                                                            <div className={`${styles.wBr} ${styles.birthText}`}>월</div>
                                                            <select name='date' value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required >
                                                                <option value='default' disabled >DD</option>
                                                                {(() => {
                                                                    let ar = []
                                                                    for (let i = 1; i <= maxDay; i++) {
                                                                        const num = i < 10 ? `0${i}` : i
                                                                        ar.push(<option key={i} value={num}>{num}</option>)
                                                                    }
                                                                    return ar
                                                                })()}
                                                            </select>
                                                            <div className={`${styles.wBr} ${styles.birthText}`}>일</div>
                                                        </div>
                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.inputDiv} >
                                        <div className={styles.inputLabel2}>
                                            이메일
                                            {((goNext || sendemail) && !isValid.email) ? <ValidText valueType={'email'} /> : (goNext && !isValid.num) && <ValidText valueType={'email_check'} />}
                                        </div>
                                        <div className={`${styles.email} ${styles.selectBox}`}>

                                            <input type='email' value={form.email} onChange={inputEmail} style={{ width: mobile ? '13.25rem' : '28.375rem', paddingRight: '1.5rem' }} disabled={auth ? true : false} placeholder='blink@blink.com' />
                                            {
                                                !isValid.num ? <div className={`${styles.phone} ${styles.authBtn}`} style={{ width: '8.875rem' }} onClick={authNumberSend}>{auth ? '재전송' : '인증메일 전송'}</div>
                                                    :
                                                    <div className={styles.authDoneBtn} style={{ width: mobile ? '6rem' : '8rem' }} >인증완료</div>
                                            }

                                        </div>
                                    </div>

                                    {
                                        (auth && isValid.email) && (
                                            <>
                                                <div className={styles.inputDiv} style={{ marginTop: '2.875rem' }}>
                                                    <div className={styles.inputLabel2}>
                                                        이메일 인증번호
                                                        {(numCheck && !isValid.num) && <ValidText valueType={'num'} />}
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
                                                                스팸 메일확인 후에도 이메일이 오지 않았다면, 블링크 이메일(blink@blink.com)이 차단된 것이 아닌지 확인해주세요.</span>
                                                        </div>
                                                    </div>
                                                </div>




                                            </>
                                        )
                                    }

                                    <div className={styles.btnDiv}>
                                        <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                                        <div className={styles.authBtn} onClick={goNextStep} style={{ width: '27.5rem' }}>확인</div>
                                    </div>



                                </div>
                            </div>
                        </section>
                    ) : (
                        <ResettingPasswd email={form.email} birth={birth} name={form.name} code={form.num} />
                    )
                }

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