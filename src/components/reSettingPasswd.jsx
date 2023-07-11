import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import AlertDialog from '@/components/dialog';
import ValidText from '@/components/isValid';

import defines from '@/defines/defines';
import useValid from '@/functions/isValid';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

import { debounce } from 'lodash';

/**
 * 비밀번호 찾기
 */
export default function ResettingPasswd({email, name, birth, ...props}) {
    let router = useRouter();


    const [form, setForm] = useState({
        new_pw: '',
        again_pw: ''
    });
    const [isValid, setIsValid] = useState({
        new_pw: false,
        again_pw: false
    });
    const [f, setF] = useState(false);

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj, email)=>{
        setResValue(await apiFetch2(url, obj, email));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        if(resValue.hasOwnProperty('success')){
            if(resValue.success) {
                router.replace('/account/help/pwInquiry/result');
            } else {
                if(resValue.code == 1001){
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/')
                } else if(resValue.code == 11014){    
                    alert('가입되지 않은 계정입니다');
                    router.replace('/login'); 
                } else {
                    alert('오류가 발생했습니다. 다시 시도해 주세요.');
                    router.reload();
                }
            }
        }
    },[resValue]);


    async function modifyNumber() {

        let new_pw_check = useValid(form.new_pw, defines.regex.pw);

        setF(true);

        //새 비밀번호 정규식 확인
        if (new_pw_check) {
            setIsValid((p) => { return { ...p, new_pw: true } });
        } else {
            setIsValid((p) => { return { ...p, new_pw: false } });
        }

        //새로 입력한 비밀번호 재확인
        if (form.new_pw == form.again_pw) {
            setIsValid((p) => { return { ...p, again_pw: true } });
        } else {
            setIsValid((p) => { return { ...p, again_pw: false } });
        }


        if (form.new_pw == form.again_pw && new_pw_check) {

            //비밀번호 변경 위한 일회용 토큰 발급 및 비밀번호 재설정 api
            let api_url = '/api/fetch/inssued-pw-token';
            let obj = {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    birthDate: birth,
                    email: email,
                    pw: form.new_pw,

                    code: props.code
                })
            }
            let masking_email = await maskingEmail(email);
            apiDebounce(api_url, obj, masking_email);
        }
    }


    return (
        <>

            <section>
                <div className={styles.findEmailContainer} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                    <div className={styles.accountTitle}>비밀번호 재설정</div>
                    <div className={styles.accountSubTitle}>타 사이트에서 사용한 적이 없는<br className={styles.mBr} /> 안전한 비밀번호를 권장합니다.</div>

                    <div className={styles.inputBox}>

                        <div className={styles.idDiv}>
                            <span style={{ marginRight: '5rem' }}>이메일</span> <span>{email}</span>
                        </div>

                        <div className={styles.inputDiv} style={{ marginBottom: '0.75rem' }}>
                            <div className={styles.inputLabel2}>
                                새로운 비밀번호
                                {(f && !isValid.new_pw) && <ValidText valueType={'newpw'} />}
                            </div>
                            <div className={styles.selectBox}>
                                <input value={form.new_pw} type='password' onChange={(e) => setForm({ ...form, new_pw: e.target.value })} style={{ width: '100%' }} placeholder='새로운 비밀번호를 입력해 주세요.' />
                            </div>
                        </div>
                        <div className={styles.pwDesc} >
                            *대문자,소문자,숫자 포함 n ~ nn자<br />
                            *사용가능 특수문자 : @$!%*?#&<br />
                            *n번이상 반복되는 문자와 숫자는 사용이 불가합니다.
                        </div>

                        <div className={styles.inputDiv}>
                            <div className={styles.inputLabel2}>
                                비밀번호 확인
                                {(f && !isValid.again_pw) && <ValidText valueType={'pw'} />}
                            </div>
                            <div className={styles.selectBox}>
                                <input value={form.again_pw} type='password' onChange={(e) => setForm({ ...form, again_pw: e.target.value })} style={{ width: '100%' }} placeholder='한번 더 입력해 주세요.' />
                            </div>
                        </div>

                        <div className={styles.btnDiv}>
                            <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                            <div className={styles.authBtn} onClick={modifyNumber} style={{ width: '27.5rem' }}>확인</div>
                        </div>


                    </div>
                </div>
            </section>
        </>
    )

}

