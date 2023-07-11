import styles from '@/styles/pages/popup.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';

import imagePack from '@/styles/image-module';
import useValid from '@/functions/isValid';

import defines from '@/defines/defines';
import ValidText from '@/components/isValid';

import AlertDialogNew2 from '@/components/alertDialog';
import { IdentificationModal } from '@/components/identification';
import apiFetch from '@/functions/apiFetch';

import cryptoNumber from '@/functions/cryptoNumber';
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';
import { debounce } from 'lodash';


/**
 * 휴대폰 인증 팝업
 */
export default function PhoneNumberAuth(props) {
    const router = useRouter();

    const [img, setImg] = useState('logo');
    const [text, setText] = useState('');
    const [duplicate, setDuplicate] = useState(false);

    //타이머
    const [min, setMin] = useState('03');
    const [sec, setSec] = useState('00');
    const time = useRef(180);
    const timerId = useRef(null);

    const [auth, setAuth] = useState(false);

    const [alertModal, setAlertModal] = useState(false); //알림 모달

    //input form setState
    const [form, setForm] = useState({
        nationality: 'local',
        name: '',
        telecom: 'skt',
        phone1: '',
        phone2: '',
        phone3: '',
        num: '',
        gender: '',
        birth: '',
        mPhone: ''
    })

    //최초 입력 확인
    const [f, setF] = useState(false);
    const [f2, setF2] = useState(false);

    //input valid check setState
    const [isValid, setIsValid] = useState({
        accept: false,
        name: false,
        phone: false,
        num: false,
        birth: false,
    });

    const [showModal, setshowModal] = useState(false); //이용약관 모달
    const [accept, setAccept] = useState(false);

    const [allStepComplete, setAllStepComplete] = useState(false);

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

    /**
     * 이용약관 확인
     */
    function openCondition() {
        setshowModal(true);
    }

    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {
            clearInterval(timerId.current);
            setAuth(false);
            setIsValid({ ...isValid, num: false });
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
    }, []);

    const [resValueAuthnum, setResValueAuthnum] = useState({});
    const fetchUseCallbackAuthnum = useCallback(async (url, obj, session) => {
        setResValueAuthnum(await apiFetch2(url, obj, session));
    });
    const apiDebounceAuthnum = debounce(fetchUseCallbackAuthnum, 500);

    useEffect(() => {
        if (resValueAuthnum.hasOwnProperty('success')) {
            if (resValueAuthnum.success) {
                if (resValueAuthnum.data == 0) {
                    setDuplicate(true);
                    setAuth(true);

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
                    setDuplicate(false);
                    setImg('alert');
                    setText('이미 사용중인 휴대폰 번호입니다.');
                    setAlertModal(true);
                    setIsValid({ ...isValid, phone: false });
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

    /**
     * 인증번호 보내기
     * @returns 
     */
    async function authNumSend() {
        setF(true);

        let phone_result;

        if (mobile) {
            phone_result = useValid(form.mPhone, defines.regex.phone);
        } else {
            phone_result = useValid(form.phone1 + form.phone2 + form.phone3, defines.regex.phone);
        }

        if (phone_result) { //휴대폰 번호가 올바르다면 인증번호 보내기
            setIsValid({ ...isValid, phone: phone_result });

            const to = mobile ? form.mPhone : form.phone1 + form.phone2 + form.phone3;
            const phone_num = mobile ? mobilePhoneSeperate(form.mPhone) : form.phone1 + '-' + form.phone2 + '-' + form.phone3;
            apiDebounceAuthnum('/api/fetch/authnum-send', {
                method: "POST",
                body: JSON.stringify({
                    "to": to,
                    "phone_num": phone_num,
                    "duplicate": 1
                })
            });


        } else {
            setIsValid({ ...isValid, phone: phone_result });
        }
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


    /**
     * 이름 확인
     * @param {*} e 
     */
    function nameAuthCheck(e) {
        setForm({ ...form, name: e.target.value });
        let name_result = useValid(e.target.value, defines.regex.nochar);
        setIsValid({ ...isValid, name: name_result });
    }

    // 전체 인증 완료
    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async (url, obj) => {
        setResValue(await apiFetch2(url, obj));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(() => {

        const fetch2Api_logout = async (url, obj, email) => {
            const data = await apiFetch2(url, obj, email);
            if (data.ok) {
                router.push('/login?session=no');
            }
        }

        const fetch2Api_certified = async (api_url, obj, email) => {
            const result = await apiFetch2(api_url, obj, email);

            if (result.success) {
                setAllStepComplete(true);
                setText('휴대폰 인증이 완료되었습니다.');
                setImg('logo');
                setAlertModal(true);
            } else if (result.redirect) {
                fetch2Api_logout(configs.frontUrl + '/api/logout', { method: 'POST' }, props.email);
            } else if (resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.')
                router.push('/')
            } else {
                alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                router.reload();
            }
        }

        if (resValue.hasOwnProperty('success')) {
            if (resValue.success) {
                clearInterval(timerId.current);
                setIsValid({ ...isValid, num: true });

                if (accept && isValid.name && isValid.phone) {

                    //고객의무인증 - 휴대폰인증 성공
                    let api_url = '/api/fetch/certs';
                    let obj = {
                        method: 'POST',
                        body: JSON.stringify({
                            kind: 'phone',
                            name: form.name,
                            gender: '1',
                            birthDate: '2000-12-31',
                            phone_num: mobile ? mobilePhoneSeperate(form.mPhone) : form.phone1 + '-' + form.phone2 + '-' + form.phone3,

                            code: form.num
                        })
                    }
                    fetch2Api_certified(api_url, obj, props.email);
                }
            } else {
                if (resValue.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    if (resValue.code == 3001) {
                        setText('인증번호가 유효하지 않습니다.\n인증번호 재발급 후 다시 시도해주세요.');
                        setImg('alert');
                        setAlertModal(true);
                        setIsValid({ ...isValid, num: false });
                    } else if (resValue.code == 3002) {
                        setText('인증번호가 올바르지 않습니다.');
                        setImg('alert');
                        setAlertModal(true);
                        setIsValid({ ...isValid, num: false });
                    } else {
                        alert('오류가 발생했습니다. 다시 시도해 주세요.');
                        router.reload();
                    }

                }
            }
        }
    }, [resValue]);

    /**
     * 전체 인증 완료
    */
    async function allAuthCheck() {
        setF2(true);

        if (!accept) {
            setText('본인인증 약관에 동의해주세요.');
            setImg('alert');
            setAlertModal(true);
            return;
        }
        if (!isValid.name) {
            setText('성함을 입력해 주세요.');
            setImg('alert');
            setAlertModal(true);
            return;
        }

        // if (!isValid.num && auth) {

        const to = mobile ? form.mPhone : form.phone1 + form.phone2 + form.phone3;
        apiDebounce('/api/fetch/check-phone-otp', {
            method: "POST",
            body: JSON.stringify({
                to,
                authNum: form.num,
            })
        });
        // }
    }
    // 전체 인증 완료


    function consentCheck() { }

    function closeAlert(boolean) {
        setAlertModal(boolean);

        if (allStepComplete) {
            props.func(1);
            props.setDone(true);
        }
    }



    return (

        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />
            <IdentificationModal onModal={showModal} closeModal={setshowModal} contents={defines.cs_list.conditions.identification.contents} isAuth={setAccept} />

            <div className={styles.popupDiv} >
                <Image src={imagePack.mypage.phoneAuthImg} alt='phoneAuthImg' style={{ marginBottom: '1rem' }} priority />
                <div className={styles.authText}>블링크는 안전한 자산거래를 위하여 인증단계를<br /> 모두 진행하신 고객님에 한하여 서비스를 제공합니다.</div>

                <div className={styles.authenticationBox}>
                    <div>
                        <div className={styles.authTitle} style={{ marginTop: '5rem' }}>본인인증 약관 동의 {(f2 && !accept) && <ValidText valueType={'accept'} />}</div>
                        <div className={styles.condition}>
                            <span>{accept && <input type={'checkbox'} className={styles.checkbox} checked onChange={consentCheck} />}본인인증서비스 약관에 동의합니다.</span> <span onClick={openCondition}>약관보기</span>
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>이름(필수) {(f2 && !isValid.name) && <ValidText valueType={'name'} />}</div>
                        <div className={styles.selectBox}>
                            <input type='text' value={form.name} onChange={nameAuthCheck} placeholder='성함을 입력해주세요' style={{ width: '100%' }} />
                        </div>
                    </div>

                    {/* <div className={styles.genderBirth}>
                        <div className={styles.genderDiv}>
                            <div className={styles.authTitle}>성별 {(f2 && !form.gender) && <ValidText valueType={'essential'} />}</div>
                            <div className={styles.genderSelect}>
                                {
                                    form.gender == 'M' ?
                                        <div className={`${styles.genderNoSelect} ${styles.activeAuthNumBtn}`}>남자</div>
                                        : <div className={`${styles.genderNoSelect}`} onClick={() => setForm({ ...form, gender: 'M' })}>남자</div>
                                }
                                {
                                    form.gender == 'F' ?
                                        <div className={`${styles.genderNoSelect} ${styles.activeAuthNumBtn}`}>여자</div>
                                        : <div className={`${styles.genderNoSelect}`} onClick={() => setForm({ ...form, gender: 'F' })}>여자</div>
                                }
                            </div>
                        </div>
                        <div className={styles.birthDiv}>
                            <div className={styles.authTitle}>생년월일 {(f2 && !isValid.birth) && <ValidText valueType={'birth2'} />}</div>
                            <div className={styles.selectBox}>
                                <input type='text' value={form.birth} className={styles.birthInput} onChange={checkBirthDay} placeholder='YYYYMMDD' maxLength={8} />
                            </div>
                        </div>
                    </div> */}

                    <div>
                        <div className={styles.authTitle}>휴대폰 번호 {(f && !isValid.phone) ? <ValidText valueType={'phone'} /> : (!f && f2 && !isValid.num) ? <ValidText valueType={'phone_check'} /> : <></>}</div>


                        <div className={styles.selectBox}>
                            {/* <select className={styles.telecom} name='telecom' value={form.telecom} onChange={(e) => setForm({ ...form, telecom: e.target.value })} style={{ width: '7.5rem' }} disabled={!isValid.phone ? false : true}>
                                <option value='skt'>SKT</option>
                                <option value='kt'>KT</option>
                                <option value='u'>U+</option>
                            </select> */}

                            <div className={styles.phoneAuthDiv}>
                                <div className={styles.wBr}>
                                    <input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} style={{ width: '5rem', paddingInline: '0', textAlign: 'center' }} maxLength={3} type='number'
                                        disabled={!duplicate ? false : true}
                                        onInput={(e) => {
                                            if (e.target.value.length > e.target.maxLength)
                                                e.target.value = e.target.value.slice(0, e.target.maxLength);
                                        }} />
                                    <span className={styles.wBr}>&nbsp;―&nbsp;</span>
                                    <input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} style={{ width: '6.25rem', paddingInline: '0', textAlign: 'center' }} maxLength={4} type='number'
                                        disabled={!duplicate ? false : true}
                                        onInput={(e) => {
                                            if (e.target.value.length > e.target.maxLength)
                                                e.target.value = e.target.value.slice(0, e.target.maxLength);
                                        }} />
                                    <span className={styles.wBr}>&nbsp;―&nbsp;</span>
                                    <input value={form.phone3} onChange={(e) => setForm({ ...form, phone3: e.target.value })} style={{ width: '6.25rem', paddingInline: '0', textAlign: 'center' }} maxLength={4} type='number'
                                        disabled={!duplicate ? false : true}
                                        onInput={(e) => {
                                            if (e.target.value.length > e.target.maxLength)
                                                e.target.value = e.target.value.slice(0, e.target.maxLength);
                                        }} />
                                </div>
                                <div className={styles.mBr} style={{ marginRight: '1rem' }}>
                                    <input value={form.mPhone} onChange={(e) => setForm({ ...form, mPhone: e.target.value })} style={{ width: '13rem', paddingInline: '1.5rem', textAlign: 'left' }} maxLength={11} type='number'
                                        disabled={!duplicate ? false : true}
                                        onInput={(e) => {
                                            if (e.target.value.length > e.target.maxLength)
                                                e.target.value = e.target.value.slice(0, e.target.maxLength);
                                        }}
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

                    {
                        auth && (
                            <>
                                <div>
                                    <div className={styles.authTitle}>인증번호 {((f && f2) && !isValid.num) && <ValidText valueType={'num'} />}</div>
                                    <div className={styles.selectBox} style={{ position: 'relative' }}>
                                        <input value={form.num} onChange={(e) => setForm({ ...form, num: e.target.value })} style={{ width: '100%' }} maxLength={6} placeholder='인증번호 6자리를 입력해주세요' type='number'
                                            disabled={isValid.num ? true : false}
                                            onInput={(e) => {
                                                if (e.target.value.length > e.target.maxLength)
                                                    e.target.value = e.target.value.slice(0, e.target.maxLength);
                                            }} />
                                        <div style={{ width: 'fit-content', position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} >{min} : {sec}</div>

                                    </div>

                                    <div className={styles.alertDiv}>
                                        <div>
                                            <Image src={imagePack.component.iconAlertPurple} alt='iconAlertPurple' style={{ marginRight: '0.75rem' }} />
                                            <span style={{ fontSize: '1rem', fontWeight: '400', color: '#808080' }}>인증번호가 오지 않았나요?</span>
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


                </div>

                <div className={styles.btnDiv}>
                    <div className={styles.cancelBtn} onClick={() => { router.back(); }}>취소</div>
                    <div className={styles.authBtn} onClick={allAuthCheck} style={{ width: '27.5rem' }}>확인</div>
                </div>


            </div>
        </>

    )
}

