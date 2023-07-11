import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
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
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';
import { debounce } from 'lodash';

/**
 * 회원가입
 */
export default function SignIn(props) {
    let router = useRouter();

    const [f, setF] = useState(false);


    const [maxDay, setMaxDay] = useState(0);
    const [year, setYear] = useState(1900);

    const [form, setForm] = useState({
        email: '',
        national: 'local',
        name: '',
        telecom: 'skt',
        phone1: '',
        phone2: '',
        phone3: '',
        num: '',
        pw: '',
        pw_again: '',
        year: 'default',
        month: 'default',
        date: 'default',
    })

    const [isValid, setIsValid] = useState({
        email: false,
        email_check: false,
        name: false,
        phone: false,
        phone_check: false,
        pw: false,
        birth: false
    })


    //이름 regex확인
    function inputName(e) {
        setForm({ ...form, name: e.target.value });

        let name_result = useValid(e.target.value, defines.regex.nochar);
        setIsValid({ ...isValid, name: name_result });
    }

    //비밀번호 regex확인
    function inputPw(e) {
        setForm({ ...form, pw: e.target.value });

        let pw_result = useValid(e.target.value, defines.regex.pw);
        let pw_result2 = useValid(e.target.value, defines.regex.continue);
        setIsValid({ ...isValid, pw: pw_result && !pw_result2 });
    }

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj, email)=>{
        setResValue(await apiFetch2(url, obj, email));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        if(resValue.hasOwnProperty('success')){
            if (resValue.success) {
                router.replace('/signin/result');
            } else if (resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.')
                router.push('/')
            } else if(resValue.code == 1011) {
                alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                router.reload();
            } else {
                alert(resValue.msg);
            }
        } 
    },[resValue]);


    async function goNextStep() {
        setF(true);

        // if (isValid.name && isValid.phone && isValid.phone_check && isValid.pw && form.pw == form.pw_again && isValid.birth && form.pw) {
        if (isValid.name && isValid.pw && form.pw == form.pw_again && isValid.birth && form.pw) {
            //회원가입 api

            let api_url = '/api/fetch/signin';
            let obj = {
                method: 'POST',
                body: JSON.stringify({
                    email: props.email,
                    pw: form.pw,
                    name: form.name,
                    year: form.year,
                    month: form.month,
                    date: form.date,
                    requirement_1: props.requirement_1,
                    requirement_2: props.requirement_2,
                    // option_1: props.option_1

                    code: props.code
                })
            }

            let masking_email = await maskingEmail(props.email);
            apiDebounce(api_url, obj, masking_email);
        }
    }


    useEffect(() => {
        if (form.year != 'default' && form.month != 'default' && form.date != 'default') {
            setIsValid({ ...isValid, birth: true });
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



    return (
        <>
            <section>
                <div className={styles.findEmailContainer} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                    <div className={styles.accountTitle}>회원가입</div>
                    <div className={styles.accountSubTitle}>정보입력</div>

                    <div className={styles.inputBox}>

                        <div className={styles.warningText} >*별(*)표시는 필수입력사항입니다.</div>

                        <div className={styles.infoBox}>
                            <div style={{ borderBottom: '2px solid #EEEFEF' }}>
                                <div className={styles.infoBoxTitle}>
                                    이름 <span>&nbsp;*</span>
                                </div>
                                <div className={styles.infoBoxCont}>

                                    <div className={styles.addressModi}>
                                        <div className={styles.iinput} >
                                            <input type='text' value={form.name} onChange={inputName} style={{ width: '16.25rem', border: (f && (!isValid.name || !form.name)) ? '2px solid #ff0000' : '2px solid #b2b2b2' }} placeholder='성함을 입력해주세요' />
                                            {
                                                form.name && (
                                                    <Image src={imagePack.component.iconX_w} alt='iconX_w' className={styles.inputInheritBtn} onClick={() => setForm({ ...form, name: '' })} />
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        (f && (!isValid.name || !form.name)) && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <ValidText valueType={'name'} />
                                            </div>
                                        )
                                    }

                                </div>
                            </div>


                            <div style={{ borderBottom: '2px solid #EEEFEF' }}>
                                <div className={styles.infoBoxTitle}>
                                    비밀번호 <span>&nbsp;*</span>
                                </div>
                                <div className={styles.infoBoxCont}>

                                    <div className={styles.addressModi}>
                                        <div className={styles.iinput} >
                                            <input type='password' value={form.pw} onChange={inputPw} style={{ width: '27.5rem', border: (f && !isValid.pw) ? '2px solid #ff0000' : '2px solid #b2b2b2' }} placeholder='비밀번호를 입력해 주세요.' />
                                            {
                                                form.pw && (
                                                    <Image src={imagePack.component.iconX_w} alt='iconX_w' className={styles.inputInheritBtn} onClick={() => setForm({ ...form, pw: '' })} />
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        (f && (!isValid.pw || !form.pw)) && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <ValidText valueType={'newpw'} />
                                            </div>
                                        )
                                    }
                                    <div className={styles.descText}>
                                        *대문자,소문자,숫자 포함 n ~ nn자<br />
                                        *사용가능 특수문자 : @$!%*?#&<br />
                                        *4번이상 반복되는 문자와 숫자는 사용이 불가합니다.
                                    </div>

                                </div>
                            </div>

                            <div style={{ borderBottom: '2px solid #EEEFEF' }}>
                                <div className={styles.infoBoxTitle}>
                                    비밀번호<br className={styles.mBr} /> 확인 <span>&nbsp;*</span>
                                </div>
                                <div className={styles.infoBoxCont}>

                                    <div className={styles.addressModi}>
                                        <div className={styles.iinput} >
                                            <input type='password' value={form.pw_again} onChange={(e) => setForm({ ...form, pw_again: e.target.value })}
                                                style={{ width: '27.5rem', border: (f && form.pw_again != form.pw) ? '2px solid #ff0000' : '2px solid #b2b2b2' }} placeholder='한번 더 입력해 주세요.' />
                                            {
                                                form.pw_again && (
                                                    <Image src={imagePack.component.iconX_w} alt='iconX_w' className={styles.inputInheritBtn} onClick={() => setForm({ ...form, pw_again: '' })} />
                                                )
                                            }
                                        </div>

                                    </div>
                                    {
                                        (f && form.pw_again != form.pw) && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <ValidText valueType={'pw'} />
                                            </div>
                                        )
                                    }

                                </div>
                            </div>


                            <div>
                                <div className={styles.infoBoxTitle}>
                                    생년월일 <span>&nbsp;*</span>
                                </div>
                                <div className={styles.infoBoxCont}>

                                    <div className={styles.addressModi}>
                                        <div className={`${styles.selectBox} ${styles.birthSelect}`}>
                                            <select name='year' value={form.year} onChange={(e) => { setForm({ ...form, year: e.target.value }); }} required style={{ border: (f && !isValid.birth) ? '2px solid #ff0000' : '2px solid #b2b2b2' }}  >
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
                                                <select name='month' value={form.month} onChange={(e) => { setForm({ ...form, month: e.target.value }); }} required style={{ border: (f && !isValid.birth) ? '2px solid #ff0000' : '2px solid #b2b2b2' }}>
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
                                                <select name='date' value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required style={{ border: (f && !isValid.birth) ? '2px solid #ff0000' : '2px solid #b2b2b2' }}>
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

                                        {/* <input type='date' value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} style={{ width: '16.5rem', border: (f && !form.birth)?'2px solid #ff0000':'2px solid #b2b2b2'  }} placeholder='YYYY ― MM ― DD' /> */}
                                    </div>
                                    {
                                        (f && !isValid.birth) && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <ValidText valueType={'birth'} />
                                            </div>
                                        )
                                    }

                                </div>
                            </div>

                        </div>

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <div className={styles.btnDiv} style={{ width: '38.75rem' }}>
                                <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                                <div className={styles.authBtn} onClick={goNextStep} style={{ width: '27.5rem' }}>다음</div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </>
    )

}

