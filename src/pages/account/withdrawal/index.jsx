import styles from '@/styles/pages/account.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
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
import AlertDialogNew2 from '@/components/alertDialog';

import PhoneAuth from '@/components/phone_auth';
import apiFetch from '@/functions/apiFetch';
import { withSessionSsr } from '@/fetchs/session';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';
import EmailAuth from '@/components/email_auth';
import apiFetch2 from '@/functions/apiFetch2';

const PHT = "탈퇴 동의함";

/**
 * 비밀번호 찾기
 */
export default function membershipWithdrawl({ session, ...props }) {
    let router = useRouter();
    let checkRef = useRef(null);

    let password = props.pw;
    let id = props.id;

    const [f, setF] = useState(false);
    const [alertModal, setAlertModal] = useState(false);

    const [pw, setPw] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [phoneAuth, setPhoneAuth] = useState(0);
    const [seq, setSeq] = useState(0);
    const [check, setCheck] = useState('');


    function pwCheck() {
        setF(true);

        if (password == pw) {
            setIsValid(true);
            setSeq(1);
        } else {
            setIsValid(false);
        }
    }

    async function mWithdrawl() {
        let api_url =  '/api/fetch/members-withdrawal';
        let body_data = { user_id: 1 }
        let obj = {
            method: 'PUT',
            body: JSON.stringify(body_data)
        }
        let result = await apiFetch2(api_url, obj);

        if (result.success) {
            setAlertModal(true);
        } else {
            if(result.redirect) {
                const data = await apiFetch2('/api/logout', { method: 'POST' });
                if (data.ok) {
                    router.push('/login?session=no');
                }
            } else if(result.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                router.push('/');
            }
        }

    }


    async function doneWithdrawal(boolean) {
        setAlertModal(boolean);

        const res = await fetch('/api/logout');
        const data = await res.json();

        if (data.ok) {
            router.push('/');
        }
    }

    /**
     * enter키 눌렀을 때
     * @param {*} e 
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            pwCheck();
        }
    };

    const [code, setCode] = useState('');


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={doneWithdrawal} img={'logo'} text={'회원탈퇴가 정상적으로 처리되었습니다.\n그동안 블링크를 이용해 주셔서 감사합니다.'} />

            <Header login={session} name={props.name}/>
            {
                phoneAuth == 0 ?
                    <EmailAuth setSeq={setPhoneAuth} title={'회원탈퇴'} email={props.id} setCode={setCode}/>
                    :
                    (
                        <>

                            <Container>
                                <section>
                                    <div className={styles.findEmailContainer} style={{ minHeight: 'calc(100vh - 70px - 314px)' }}>
                                        <div className={styles.accountTitle}>{seq == 0 ? '비밀번호 확인' : '회원탈퇴'}</div>
                                        <div className={styles.accountSubTitle}>{seq == 0 ? '회원 탈퇴를 위해 비밀번호를 확인합니다.' : '정말 블링크를 탈퇴하시나요?'}</div>

                                        {seq == 0 ?
                                            (
                                                <>
                                                    <div className={styles.inputBox}>

                                                        <div className={`${styles.withdrawPw} ${styles.inputDiv}`} >
                                                            <div className={styles.inputLabel2}>
                                                                아이디
                                                            </div>
                                                            <div style={{ fontSize: '1.125rem', lineHeight: '1.4', fontWeight: '400' }}>
                                                                {id}
                                                            </div>
                                                        </div>

                                                        <div className={styles.inputDiv}>
                                                            <div className={styles.inputLabel2}>
                                                                비밀번호
                                                                {(f && !isValid) && <ValidText valueType={'pw'} />}
                                                            </div>
                                                            <div className={styles.selectBox} style={{ position: 'relative' }}>
                                                                <input value={pw} type='password' onChange={(e) => setPw(e.target.value)} style={{ width: '100%', border: (f && !isValid) ? '2px solid #ff0000' : '2px solid #b2b2b2' }} placeholder='비밀번호를 입력해주세요.' onKeyDown={handleKeyPress} />
                                                                {
                                                                    pw && <Image src={imagePack.component.iconX_w} alt='iconX_w' className={styles.inputEmpty} onClick={() => setPw('')} />
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className={styles.withdrawPwDesc}>
                                                            *회원 탈퇴를 위한 본인인증으로 비밀번호를 입력해주세요.
                                                        </div>

                                                        <div className={styles.btnDiv} style={{ marginTop: 'var(--size-50)' }}>
                                                            <div className={styles.cancelBtn} onClick={() => router.back()}>취소</div>
                                                            <div className={styles.authBtn} onClick={pwCheck} style={{ width: '27.5rem' }} >확인</div>
                                                        </div>


                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={styles.inputBox}>

                                                        <div className={styles.inputDiv} style={{ width: '1080px' }}>
                                                            <div className={`${styles.beforeWithdrawal} ${styles.inputLabel2}`}>
                                                                블링크 탈퇴 전 유의사항을 확인하여 주시기 바랍니다.
                                                            </div>
                                                            <div className={styles.withdrawalWarning}>
                                                                <ul>
                                                                    <li>
                                                                        지갑에 보유자산이 남아있다면 출금 후 회원탈퇴를 진행해주세요.<br />
                                                                        <span style={{ color: '#ff0000' }}>총 보유 자산: ₩0.00※ 탈퇴를 진행하기 위해서는 보유자산이 KRW 환산 10,000원 미만이어야 합니다.</span>
                                                                    </li>
                                                                    <li>
                                                                        이용중인 서비스(렌딩, 예치, 마이닝 등)가 있을 경우 탈퇴가 불가능합니다.<br />
                                                                        <span style={{ fontWeight: '700' }}>렌딩: ₩0.00 예치: ₩ 0.00 마이닝: ₩0.00</span>
                                                                    </li>
                                                                    <li>
                                                                        회원탈퇴 시 등록된 회원님의 개인정보는 모두 삭제되며 복구되지 않습니다. 단 관계법령에 따라 보관하여야 하는 정보는 일정 기간 보관됩니다.
                                                                    </li>
                                                                    <li>
                                                                        회원탈퇴 후에는 고객님의 자산정보가 모두 파기되기 때문에 이벤트 혜택과 에어드랍을 받을 수 없습니다.
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        <div className={styles.inputDiv} style={{ marginTop: '2.188rem', width: '1080px' }}>
                                                            <div className={`${styles.beforeWithdrawal} ${styles.inputLabel2}`}>
                                                                회원탈퇴를 위해 아래 입력란에<br className={styles.mBr} /> "{PHT}"을 입력하여 주시기 바랍니다.
                                                            </div>
                                                            <div className={styles.selectBox}>
                                                                <input type={'text'} placeholder={PHT} value={check} onChange={e => setCheck(e.target.value)} style={{ width: '100%' }} />
                                                            </div>
                                                        </div>

                                                        <div className={styles.btnDiv} style={{ marginTop: '2.188rem' }}>
                                                            <div className={styles.cancelBtn} onClick={() => router.back()} style={{ width: '17rem' }}>취소</div>
                                                            {
                                                                check == PHT ? <div className={styles.authBtn} onClick={mWithdrawl} style={{ width: '48rem' }}>탈퇴</div>
                                                                    :
                                                                    <div className={styles.authBtn} style={{ width: '48rem', background: '#b2b2b2', cursor: 'inherit' }}>탈퇴</div>
                                                            }

                                                        </div>


                                                    </div>
                                                </>
                                            )
                                        }

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
    let id = '';
    let name = '';

    if (session) {
        id = session.email;
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
        props: {
            session: masking_email,
            pw: defines.mydata.password,
            id: id,
            name: name
        },
    };

});