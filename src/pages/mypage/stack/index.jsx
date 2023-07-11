import styles from '@/styles/pages/popup.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';

import Footer from '@/components/footer';
import Header from '@/components/header';
import PhoneNumberAuth from '@/components/phone';
import AccountAuth from '@/components/account';
import IdCardAuth from '@/components/idcard';
import InfoInput from '@/components/info';
import InfoInput2 from '@/components/info copy';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';
import AlertDialogNew2 from '@/components/alertDialog';
import maskingEmail from '@/functions/emailMasking';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';


const txt = '비정상적인 접근입니다.';
const storage = globalThis?.sessionStorage;
export default function AuthStack({ session, stack, access, ...props }) {
    const router = useRouter();

    const [seq, setSeq] = useState(0);
    const [done, setDone] = useState(false);
    const [alertModal, setAlertModal] = useState(false);

    async function test() {
        const res = await fetch('/api/authStackUpdate', {
            method: 'POST',
        })
        const data = await res.json();

        if (data.success) {
            setDone(false);
            router.replace('/mypage');
        } else if(data.code==1001) {
            alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
            router.push('/');
        } else {
            alert('오류가 발생했습니다. 다시 시도해 주세요.');
            router.reload();
        }
    }

    useEffect(() => {
        if (done) {
            test();
        }
    }, [done])


    function closeAlert(boolean) {
        setAlertModal(boolean);
        router.back();
    }


    //새로고침 감지
    const handleReload = (e) => {
        storage.setItem("auth", true);
    }
    useEffect(() => {
        if(access) {
            window.addEventListener('beforeunload', handleReload);
        }
        
        return () => {
            if(storage.getItem("auth")){
                storage.removeItem("auth");
            } else {
                storage.removeItem("access");
            }
            window.removeEventListener('beforeunload', handleReload);
        }
    }, [])

    useEffect(() => {
        if (access) {
            storePathValue();
        }

        if (!storage.getItem("access")) {
            setAlertModal(true);
        }

    }, [access])

    async function storePathValue() {
        if (!storage) { return; }

        storage.setItem("access", true);
    }

    

    return (

        <>
            <Header login={session} name={props.name}/>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'alert'} text={txt} />

            <section className={styles.popupSection} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>

                <Image src={imagePack.header.logo} alt='logo' style={{ width: '142px', height: 'auto', marginTop: 'var(--size-90)' }} />
                <div className={styles.title}>
                    {
                        (stack||stack==0) ? (
                            stack == 0 ?
                                '휴대폰 인증' :
                                stack == 1 ?
                                    '계좌인증' :
                                    stack == 2 ?
                                        '신분증 인증' :
                                        stack == 3 ?
                                            '필수정보 입력' : <></>
                        ) : <></>
                    }
                </div>

                {
                    (stack||stack==0) ? (
                        stack == 0 ?
                            <PhoneNumberAuth func={setSeq} setDone={setDone} email={session}/> :
                            stack == 1 ?
                                <AccountAuth func={setSeq} setDone={setDone} email={session}/> :
                                stack == 2 ?
                                    <IdCardAuth func={setSeq} setDone={setDone} email={session}/> :
                                    stack == 3 ?
                                        <InfoInput func={setSeq} setDone={setDone} email={session}/> :
                                        // <InfoInput2 func={setSeq} setDone={setDone} /> :
                                        <></>
                    ) : <></>
                }

            </section>

            <Footer />
        </>

    )
}


export const getServerSideProps = withSessionSsr(async function (context) {
    let session = context.req.session.user;
    let stack; //진행예정중인 인증단계
    let email;
    let masking_email = ''
    let name='';

    let access = context.query.access;
    if (access) {
        access = true;
    } else {
        access = false;
    }

    if (session) {
        stack = session.cert_level;
        email = session.email;
        masking_email = await maskingEmail(session.email);

        let user_info = await MemberInquiry(email, session.token);
        name = user_info.data.members.name;
        if(user_info.hasOwnProperty('redirect')){
            context.req.session.destroy();
            return user_info.redirect;
        }
    }


    return {
        ...checkSessionRedirect(context.req),
        props: {
            session: masking_email,
            stack: stack,
            access: access,
            name: name
        }
    }
})