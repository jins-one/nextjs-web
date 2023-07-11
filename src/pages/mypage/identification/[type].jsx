import styles from '@/styles/pages/identificationAuth.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';
import useValid from '@/functions/isValid';

import defines from '@/defines/defines';
import ValidText from '@/components/isValid';

import Footer from '@/components/footer';
import Header from '@/components/header';

import AlertDialogNew2 from '@/components/alertDialog';
import apiFetch from '@/functions/apiFetch';
import maskingEmail from '@/functions/emailMasking';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';



export default function IdentificationAuth({session, type, ...props}) {
    // 카카오 본인인증 연동 : https://www.kakaocert.com/partner-request

    const router = useRouter();

    const [authType, setAuthType] = useState('');
    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    
    useEffect(()=>{
        if(type=='naver') {
            setAuthType('네이버');
        } else if(type=='kakao') {
            setAuthType('카카오');
        } else {
            router.push('/404');
        }
    }, [])

    function closeAlert(boolean) {
        setAlertModal(boolean);
        router.replace('/mypage');
    }

    /**
     * 인증완료 버튼 클릭 시
     */
    async function goAuthCheck() {
        let api_url = `/api/fetch/certs/identification?type=${type}`;
        let result = await apiFetch(api_url, 'POST');

        if(result.success) {
            setText(`${authType} 인증이 완료되었습니다.`);
            setAlertModal(true);
        } else {

        }
    }


    return (

        <>
            <Header login={session} name={props.name}/>

            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'logo'} text={text} />

            <section className={styles.section}>
                <div className={styles.authContainer}>

                    <div className={styles.authTitle} >
                        {authType} 간편 인증
                    </div>
                    <div className={styles.authText}>
                        등록하신 휴대폰 번호로 {authType} 인증 요청을 발송합니다.<br/>
                        간편인증은 해당 인증서와 앱 설치 후 진행이 가능합니다.
                    </div>

                    <div className={styles.authBtn} onClick={goAuthCheck}>
                        {authType} 인증 하기
                    </div>

                    <div className={styles.subText}>
                        <div>*{authType} 인증이 정상적으로 진행되지 않을 경우 해당 인증서를 재발급 후 이용 가능합니다.</div>
                        <div>*휴대폰 알림 설정을 사용하지 않으신다면 직접 해당 앱에서 접속하여 인증을 진행해주세요.</div>
                    </div>

                </div>
            </section>

            <Footer />
        </>

    )
}


export const getServerSideProps = withSessionSsr( async function (context) {
    const req = context.req;
    const type = context.query.type;

    let session = req.session.user;
    let masking_email = '';
    let name='';
    if(session) {
        masking_email = await maskingEmail(session.email);

        const data = await MemberInquiry(session.email, session.token);
        name = data.data.members.name;
        if(data.hasOwnProperty('redirect')){
            req.session.destroy();
            return data.redirect;
        }
    }
    

    return {
        ...checkSessionRedirect(req),
        props: {
            session: masking_email,
            type: type,
            name: name
        }
    }    
})