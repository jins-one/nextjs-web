import styles from '@/styles/pages/modify_myinfo.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import PasswordPresentor from '@/functions/password-presentor';
import AlertDialogNew2 from '@/components/alertDialog';

// import PhoneAuth from '@/pages/mypage/modinfo/phone.jsx';
import PhoneAuth from '@/components/phone_auth';

import defines from '@/defines/defines';
import ValidText from '@/components/isValid';
import apiFetch from '@/functions/apiFetch';
import maskingEmail from '@/functions/emailMasking';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';
import apiFetch2 from '@/functions/apiFetch2';
import { debounce } from 'lodash';

export default function registWPW({ session, ...props }) {
    const router = useRouter();
    const inputRef = useRef([]);
    const inputRef2 = useRef([]);

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');

    const [seq2, setSeq2] = useState(0);

    const passwordPresentor = new PasswordPresentor(); // 인스턴스 생성
    const passwordPresentor2 = new PasswordPresentor(); // 인스턴스 생성


    const [f, setF] = useState(false);
    const [seq, setSeq] = useState(0);
    const [isValid, setIsValid] = useState({
        pw: false,
        new_pw: false,
        again_pw: false,
        new_pw2: false
    })

    const [form, setForm] = useState({
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
    });
    const [form2, setForm2] = useState({
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
    });



    // input onChange
    const handleInputChange = (e) => {
        passwordPresentor.handleInputChange(e, form, setForm);
    };

    // value 입력 시, 다음 Index로 focus 이동
    const handleNextFocus = () => {
        passwordPresentor.handleNextFocus(inputRef);
    };

    // value 삭제
    const handleDeleteEvent = (e) => {
        passwordPresentor.handleDeleteEvent(e, inputRef, form, setForm);
    };

    // 랜덤한 value 클릭 시, 비어있는 index에 focus 지정
    const emptyIndexFocus = () => {
        passwordPresentor.emptyIndexFocus(inputRef);
    };

    useEffect(() => {
        if (seq2 == 1) {
            inputRef.current[0].focus(); // 마운트 > 첫 번째 value에 focus
            handleNextFocus(); // 각각의 value에 값을 입력 시, 다음 value 로 focus 이동
        }
    }, [form]); // dependency 에 form 를 넣음으로써, form의 값이 변경될 때마다 리렌더링


    // input onChange
    const handleInputChange2 = (e) => {
        passwordPresentor2.handleInputChange(e, form2, setForm2);
    };

    // value 입력 시, 다음 Index로 focus 이동
    const handleNextFocus2 = () => {
        passwordPresentor2.handleNextFocus(inputRef2);
    };

    // value 삭제
    const handleDeleteEvent2 = (e) => {
        passwordPresentor2.handleDeleteEvent(e, inputRef2, form2, setForm2);
    };

    // 랜덤한 value 클릭 시, 비어있는 index에 focus 지정
    const emptyIndexFocus2 = () => {
        passwordPresentor2.emptyIndexFocus(inputRef2);
    };

    useEffect(() => {
        handleNextFocus2(); // 각각의 value에 값을 입력 시, 다음 value 로 focus 이동
    }, [form2]); // dependency 에 form 를 넣음으로써, form의 값이 변경될 때마다 리렌더링





    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj)=>{
        setResValue(await apiFetch2(url, obj));
    })
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{

        const fetch2Api_logout = async (url, obj, email)=>{
            const data = await apiFetch2(url, obj, email);
            if (data.ok) {
                router.push('/login?session=no');
            }
        }
        
        if(resValue.hasOwnProperty('success')){
            if(resValue.success){
                setF(false);
                setText('출금 비밀번호가 안전하게 설정되었습니다.');
                setAlertModal(true);
                if(!alertModal){
                    router.push('/mypage/modiinfo');
                }
            } else {
                if(result.redirect) {
                    fetch2Api_logout(configs.frontUrl +'/api/logout', { method: 'POST' });
                } else if(resValue.code==1001){
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/')
                } else {
                    alert('오류가 발생했습니다. 다시 시도해 주세요.');
                    router.reload();
                } 
            } 
        }
    },[resValue]);




    async function modifyNumber() {
        setF(true);

        let w_pw = form.value1.toString() + form.value2.toString() + form.value3.toString() + form.value4.toString() + form.value5.toString() + form.value6.toString() + form.value7.toString() + form.value8.toString();
        let again_pw = form2.value1.toString() + form2.value2.toString() + form2.value3.toString() + form2.value4.toString() + form2.value5.toString() + form2.value6.toString() + form2.value7.toString() + form2.value8.toString();

        if (w_pw == again_pw) {
            setIsValid((p) => { return { ...p, again_pw: true } });
        } else {
            setIsValid((p) => { return { ...p, again_pw: false } });
        }

        if (form.value1 && form.value2 && form.value3 && form.value4 && form.value5 && form.value6 && form.value7 && form.value8) {
            setIsValid((p) => { return { ...p, new_pw2: true } });
            if (form.value1 == form.value2 || form.value2 == form.value3 || form.value3 == form.value4 || form.value4 == form.value5 || form.value5 == form.value6 || form.value6 == form.value7 || form.value7 == form.value8) {
                setIsValid((p) => { return { ...p, new_pw: false } });
            } else {
                setIsValid((p) => { return { ...p, new_pw: true } });

                if (w_pw == again_pw) {
                    //출금 비밀번호 등록 api

                    // let api_url = '/api/fetch/password/withdrawal';
                    // let body_data = {
                    //     method: "POST",
                    //     body: JSON.stringify({
                    //         pw: form.pw,
                    //         new: form.new_pw,
                    //         again: form.again_pw,

                    //         code: code
                    //     })
                    // }

                    // apiDebounce(api_url, body_data);

                }
            }
        } else {
            setIsValid((p) => { return { ...p, new_pw2: false } });
        }
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);
        router.replace('/mypage/modinfo');
    }

    const [code, setCode] = useState('');

    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'logo'} text={text} />
            <Header login={session} name={props.name} />
            {
                seq2 == 0 ? (
                    <PhoneAuth setSeq={setSeq2} title={'출금 비밀번호 등록'} phone={props.phone} setCode={setCode} />
                ) : (
                    <>

                        <Container>
                            <section className={styles.section} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                                <div className={styles.pwModifyContainer}>

                                    <div className={styles.title}>출금 비밀번호 등록</div>
                                    <div className={styles.subTitle}>
                                        새로운 출금 비밀번호를 입력하여 주세요.
                                    </div>

                                    <div className={styles.modiInputDiv2}>
                                        <div className={styles.inputLabel}>
                                            새 출금 비밀번호
                                            {(f && !isValid.new_pw2) ? <ValidText valueType={'wpw2'} /> : (f && !isValid.new_pw) && <ValidText valueType={'wpw'} />}
                                        </div>
                                        <div className={styles.secureInput}>

                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value1}
                                                name="value1"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[0] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value2}
                                                name="value2"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[1] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value3}
                                                name="value3"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[2] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value4}
                                                name="value4"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[3] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value5}
                                                name="value5"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[4] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value6}
                                                name="value6"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[5] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value7}
                                                name="value7"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[6] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form.value8}
                                                name="value8"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef.current[7] = el)}
                                                onClick={emptyIndexFocus}
                                                onChange={handleInputChange}
                                                onKeyDown={handleDeleteEvent}
                                            />
                                        </div>

                                    </div>


                                    <div className={styles.modiInputDiv2}>
                                        <div className={styles.inputLabel}>
                                            비밀번호 확인 {(f && !isValid.again_pw) && <ValidText valueType={'pw'} />}
                                        </div>
                                        <div className={styles.secureInput}>

                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value1}
                                                name="value1"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[0] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value2}
                                                name="value2"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[1] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value3}
                                                name="value3"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[2] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value4}
                                                name="value4"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[3] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value5}
                                                name="value5"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[4] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value6}
                                                name="value6"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[5] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value7}
                                                name="value7"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[6] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                            <input
                                                type="password"
                                                placeholder='*'
                                                value={form2.value8}
                                                name="value8"
                                                pattern="\d*"
                                                inputMode="numeric"
                                                ref={(el) => (inputRef2.current[7] = el)}
                                                onClick={emptyIndexFocus2}
                                                onChange={handleInputChange2}
                                                onKeyDown={handleDeleteEvent2}
                                            />
                                        </div>

                                    </div>


                                    <div className={styles.btnDiv}>
                                        <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>

                                        <div className={styles.authBtn} onClick={modifyNumber} style={{ width: '27.5rem' }}>확인</div>


                                    </div>

                                </div>
                            </section>
                        </Container>
                    </>
                )
            }
            <Footer />

        </>
    )




}

export const getServerSideProps = withSessionSsr(async function ({ req, res }) {
    let session = req.session.user;
    let masking_email = '';
    let email = '';
    let phone = '';
    let name = '';

    if (session) {
        email = session.email;
        masking_email = await maskingEmail(session.email);

        const data = await MemberInquiry(session.email, session.token);
        phone = session.phone.split('-')[0] + ' - **** - ' + session.phone.split('-')[2];
        name = data.data.members.name;
        if (data.hasOwnProperty('redirect')) {
            req.session.destroy();
            return data.redirect;
        }
    }

    return {
        ...checkSessionRedirect(req),
        props: {
            session: masking_email,
            list: defines.mydata,
            phone: phone,
            name: name
        }
    }
})