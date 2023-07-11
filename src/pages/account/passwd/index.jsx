import styles from '@/styles/pages/modify_myinfo.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import useValid from '@/functions/isValid';
import ValidText from '@/components/isValid';

import defines from '@/defines/defines';
import apiFetch from '@/functions/apiFetch';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';

export default function modifyPW({session, ...props}) {
    let router = useRouter();

    let mydata = props.list;


    const [form, setForm] = useState({
        pw: '',
        new_pw: '',
        again_pw: ''
    });
    const [isValid, setIsValid] = useState({
        pw: false,
        new_pw: false,
        again_pw: false
    });
    const [f, setF] = useState(false);


    async function modifyNumber() {

        let pw_result = useValid(form.new_pw, defines.regex.pw);
        let pw_result2 = useValid(form.new_pw, defines.regex.continue);

        let new_pw_check = pw_result & !pw_result2;
        setIsValid({ ...isValid, pw: new_pw_check });


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

        //기존 비밀번호 확인
        if (form.pw == mydata.password) {
            setIsValid((p) => { return { ...p, pw: true } });
        } else {
            setIsValid((p) => { return { ...p, pw: false } });
        }


        if (form.pw == mydata.password && form.new_pw == form.again_pw && new_pw_check) {

            let api_url =  '/api/fetch/password';
            let body_data = {
                pw: form.pw,
                new: form.new_pw,
                again: form.again_pw
            }
            let result = await apiFetch(api_url, 'PATCH', body_data);

            if (result.success) {
                router.replace('/account/passwd/result');
            } else {

            }

        }
    }


    return (
        <>

            <Header login={session} name={props.name}/>

            <Container>
                <section className={styles.section} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                    <div className={styles.pwModifyContainer}>

                        <div className={styles.title}>비밀번호 변경 안내</div>
                        <div className={styles.subTitle} style={{textAlign:'center'}}>정기적인 비밀번호 변경을 통해 개인정보를 보호하고<br className={styles.mBr}/>안전하게 서비스를 이용하세요.</div>

                        <div className={styles.modiInputDiv}>
                            <div className={styles.inputLabel}>현재 비밀번호 {(f && !isValid.pw) && <ValidText valueType={'pw'} />}</div>
                            <input type='password' onChange={(e) => setForm({ ...form, pw: e.target.value })} placeholder='현재 비밀번호를 입력하세요.' />


                            <div className={`${styles.mrTop} ${styles.inputLabel}`} style={{ marginTop: '2.875rem' }}>새로운 비밀번호 {(f && !isValid.new_pw) ? <ValidText valueType={'newpw'} /> : <></>}</div>
                            <input type='password' onChange={(e) => setForm({ ...form, new_pw: e.target.value })} placeholder='새 비밀번호를 입력하세요.' />
                            <div style={{ marginTop: '0.75rem', fontSize: '1rem', color: '#808080', fontWeight: '400', lineHeight: '1.4' }} className={styles.pwDesc}>
                                *비밀번호 입력에 관한 필수사항 특문, 영문 대소문자 몇자~몇자 <br />
                                *사용가능 특수문자 : @$!%*?#&<br />
                                *4번이상 반복되는 문자와 숫자는 사용이 불가합니다.
                            </div>

                            <div className={`${styles.mrTop} ${styles.inputLabel}`} style={{ marginTop: '2.875rem' }}>비밀번호 재입력 {(f && !isValid.again_pw) ? <ValidText valueType={'pw'} /> : <></>}</div>
                            <input type='password' onChange={(e) => setForm({ ...form, again_pw: e.target.value })} placeholder='새 비밀번호를 재입력 하세요.' style={{ marginTop: '0.75rem' }} />

                        </div>

                        <div className={styles.btnDiv}>
                            <div className={styles.cancelBtn} onClick={() => router.push('/')}>다음에</div>
                            <div className={styles.authBtn} onClick={modifyNumber} style={{ width: '27.5rem' }}>변경</div>
                        </div>

                    </div>
                </section>
            </Container>
            <Footer />
        </>
    )


}


export const getServerSideProps = withSessionSsr(async function ({ req, res }) {
    let session = req.session.user;
    let masking_email = '';
    let name = '';

    if(session) {
        masking_email = await maskingEmail(session.email);

        let user_info = await MemberInquiry(session.email, session.token);
        if(user_info.hasOwnProperty('redirect')){
            req.session.destroy();
            return user_info.redirect;
        } else {
            name = user_info.data.members.name;
        }
    }

    return {
        ...checkSessionRedirect(req),
        props: {
            session: masking_email,
            list: defines.mydata,
            name: name
        }
    }
})