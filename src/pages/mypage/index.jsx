import styles from '@/styles/pages/mypage.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';
import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import defines from '@/defines/defines';

import ModifyWithdrawalInfo from '@/components/modifyWithdrawalInfo';

import MyWalletDetail from '@/components/myWalletDetail';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';

import { debounce, set, split } from 'lodash';
import AlertDialogNew2 from '@/components/alertDialog';

/**
 * 마이페이지
 */
export default function Mypage({ session, ...props }) {
    let router = useRouter();

    let mydata = props.mydata;

    const [showWidthdraw, setShowWidthdraw] = useState(false); //출금주소 변경 모달

    const [seq, setSeq] = useState([]);  //0:수행전, 1:수행예정, 2:수행완료

    const [nickname, setNickName] = useState(mydata.nickname); //출금 주소 별명
    const [walletInfo, setWalletInfo] = useState({}); //출금지갑정보

    //내 지갑 상세 페이지 모달
    const [myWalletShow, setMyWalletShow] = useState(false);


    // 모바일인지 확인
    const [mobile, setMobile] = useState(false);

    const [resValue, setResValue] = useState({});

    const [alertModal, setAlertModal] = useState(false);
    const [img, setImg] = useState('logo');
    const [text, setText] = useState('');

    const fetchUseCallback = useCallback(async (url, obj, session) => {
        setResValue(await apiFetch2(url, obj, session));
    })
    const apiDebounce = debounce(fetchUseCallback, 500);



    useEffect(() => {
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    }, []);

    // api res
    useEffect(() => {
        const fetch2Api_logout = async (url, obj, email) => {
            const data = await apiFetch2(url, obj, email);
            if (data.ok) {
                router.push('/login?session=no');
            }
        }

        // const apiDebounceRes = async () => {
        if (resValue.hasOwnProperty('success')) {
            if (resValue.success) {
                setWalletInfo(resValue.data);
                setMyWalletShow(true);
            } else if (resValue.redirect) {

                fetch2Api_logout(configs.frontUrl + '/api/logout', { method: 'POST' }, session);

                // if (resValue.hasOwnProperty('ok')) {
                //     if (resValue.ok) {
                //         router.push('/login?session=no');
                //     }
                // }
            } else if (resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                router.push('/');
            } else {
                alert('오류가 발생했습니다. 다시 시도해 주세요.');
                router.reload();
            }
        }
        // }

        // apiDebounceRes();


    }, [resValue])


    /**
     * 출금주소 변경 모달 열기
     */
    async function withdrawalAddressChange() {
        if (props.check < 1) {
            setText('휴대폰 인증을 먼저 수행해주세요.');
            setImg('alert');
            setAlertModal(true);
        } else {

            //출금지갑 상세정보 가져오는 api
            let api_url = '/api/fetch/wallets';
            let obj = {
                method: 'GET'
            }
            apiDebounce(api_url, obj, session);
        }

    }


    useEffect(() => {

        if (props.check == 4) {
            setSeq([2, 2, 2, 2]);
        } else if (props.check == 3) {
            setSeq([2, 2, 2, 1]);
        } else if (props.check == 2) {
            setSeq([2, 2, 1, 0]);
        } else if (props.check == 1) {
            setSeq([2, 1, 0, 0]);
        } else {
            setSeq([1, 0, 0, 0]);
        }

    }, []);


    /**
     * 고객의무인증 요청 컴포넌트
     * @param {*} param0 
     * @returns 
     */
    function ActiveSeqStep({ txt, step }) {
        return (
            <>
                {
                    mobile ? (
                        <div className={styles.mobileActiveSteps}>
                            <div className={styles.circle}></div>
                            <div className={styles.step}>
                                <div className={styles.stepText}>{step} step</div>
                                <div>{txt}</div>
                                <div>인증 수행이 필요합니다.</div>

                                {
                                    // seq[3]==1 ?  <div className={styles.button} onClick={() => router.push('/mypage/modinfo?auth=true#target')}>입력하기</div>
                                    // :
                                    <div className={styles.button} onClick={() => router.push('/mypage/stack?access=true', '/mypage/stack')}>인증하기</div>
                                }
                            </div>
                        </div>
                    ) : (
                        <div className={styles.activeSteps}>
                            <div>
                                <Image src={imagePack.component.iconCheck} style={{ marginRight: '0.75rem' }} alt='iconCheck' /> <span>{step} STEP</span>
                            </div>
                            <div className={styles.activeStepsText}>
                                <div>{txt}</div>
                                <div>인증 수행이 필요합니다.</div>
                                {/* <div onClick={() => setShowStackModal(true)}>인증하기</div> */}
                                {
                                    // seq[3]==1 ? <div onClick={() => router.push('/mypage/modinfo?auth=true#target')}>인증하기</div>
                                    // :
                                    <div onClick={() => router.push('/mypage/stack?access=true', '/mypage/stack')}>인증하기</div>
                                }

                            </div>
                        </div>
                    )
                }

            </>
        )
    }

    /**
     * 고객의무인증 예정 컴포넌트
     * @param {*} param0 
     * @returns 
     */
    function NoActiveSteps({ txt }) {
        return (
            <>
                {
                    mobile ? (
                        <div className={styles.mobileNoActiveSteps}>
                            <div className={styles.bar} />
                            <div className={styles.circle} />
                        </div>
                    ) : (
                        <div className={styles.noActiveSteps}>
                            <div>
                                <div className={styles.bar} />
                                <div>
                                    <div className={styles.circle} />
                                    <div className={styles.noActiveStepsText}>
                                        {txt}
                                    </div>
                                </div>

                            </div>

                        </div>
                    )
                }

            </>
        )
    }

    /**
     * 고객의무인증 완료 컴포넌트
     * @param {*} param0 
     * @returns 
     */
    function DoneSteps({ txt, step, type }) {
        return (
            <>
                {
                    mobile ? (
                        <div className={styles.mobileDoneActiveSteps}>
                            <div className={styles.circle} />
                            {
                                step != 4 &&
                                <div className={styles.bar} />
                            }
                            {
                                seq[3] == 2 &&
                                <div className={styles.text}>{txt}</div>
                            }

                        </div>
                    ) : (
                        <div className={styles.noActiveSteps}>
                            <div>
                                <div>
                                    <div className={styles.circle} style={{ background: 'var(--defaultColor)' }}>
                                        <Image src={imagePack.component.iconCheck} alt='iconCheck' />
                                    </div>
                                    <div className={styles.noActiveStepsText} style={{ color: 'black' }}>
                                        {txt}
                                    </div>
                                </div>

                                {
                                    step != 4 &&
                                    (<>
                                        {
                                            type != 'done' ?
                                                <div className={styles.bar} style={{ background: 'var(--defaultColor)' }} />
                                                :
                                                <div className={styles.bar} style={{ background: 'var(--defaultColor)', width: '16rem' }} />
                                        }
                                    </>)
                                }

                            </div>

                        </div>
                    )
                }

            </>
        )
    }


    /**
     * 출금주소변경 모달 props로 전달해줌. 수정이 완료되면 호출되며 내 지갑상세보기 모달을 닫는 용도임
     */
    function myDetailCls() {
        setMyWalletShow(false)
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={setAlertModal} img={img} text={text} />
            {/* 내 지갑 상세 보기 모달 */}
            <MyWalletDetail onModal={myWalletShow} closeModal={setMyWalletShow} changeModal={setShowWidthdraw} modify={showWidthdraw} data={walletInfo} />
            {/* 출금주소 변경 모달 */}
            <ModifyWithdrawalInfo onModal={showWidthdraw} closeModal={setShowWidthdraw} func={setNickName} myDetailCls={myDetailCls} data={walletInfo} phone={mydata.phone} />

            <Header login={session} name={mydata.name} />

            <div className={styles.bg} />

            <Container>
                <section className={styles.mypageSection}>
                    <div className={styles.mypageContainer}>

                        <div className={styles.myPageName}>
                            안녕하세요<br />
                            <span>{mydata.name}님</span>
                        </div>

                        <div className={styles.myProfileDiv}>
                            <div>
                                {/* <span>개인정보관리</span>
                                <span>최근 접속 시간 : 2023.09.09 23:59</span> */}
                            </div>
                            <div className={styles.profileBox}>
                                <div>
                                    <div className={styles.myProfile}>
                                        <span>이메일</span>
                                        <span>{session}</span>
                                    </div>
                                    <div className={styles.myProfile}>
                                        <span>이름</span>
                                        <span>{mydata.name}</span>
                                    </div>
                                    <div className={styles.myProfile}>
                                        <span>연락처</span>
                                        <span>{mydata.phone}</span>
                                    </div>
                                    <div className={styles.myProfile}>
                                        <span>마케팅 수신동의</span>
                                        <span>{mydata.marketing === 1 ? '동의함' : '미동의'}</span>
                                    </div>
                                    <div className={styles.modifyProfileBtn}><Link href={'/mypage/modinfo'}>내 정보수정 <Image src={imagePack.component.iconRight2} alt='iconRight2' style={{ marginLeft: '0.25rem' }} /></Link></div>
                                </div>
                                <div className={styles.authentication}>
                                    <div>고객 인증 확인</div>
                                    {
                                        seq[3] == 2 ? <div>고객인증 확인 완료</div> : <div style={{ color: '#B2B2B2' }}>고객인증 확인 필요</div>
                                    }
                                    <div>마지막로그인: &nbsp;{mydata.last_login}</div>
                                </div>
                                <div className={styles.withdrawalAddress}>
                                    <div>
                                        <span>등록된 출금주소</span>
                                    </div>
                                    {
                                        mydata.nickname ? <div>{nickname}</div> : <div style={{ color: '#B2B2B2' }}>출금 주소 등록 필요</div>
                                    }
                                    <div className={styles.modifyProfileBtn}><div onClick={withdrawalAddressChange}>출금주소 관리 <Image src={imagePack.component.iconRight2} alt='iconRight2' style={{ marginLeft: '0.25rem' }} /></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.mypageSection2}>
                    <div className={styles.identificationContainer}>

                        <div className={styles.authSeqDiv}>
                            {
                                seq[3] == 2 ?
                                    (<>
                                        <div className={styles.authDoneStatus}>
                                            <div className={styles.authComplelteBedge}>인증완료</div>
                                            <div className={styles.authSeqTitle}>고객 의무인증 수행 단계</div>
                                        </div>
                                        <div className={styles.authSeqSubTitle}>블링크 서비스를 이용하기 위한 인증이 모두 완료되었습니다.</div>
                                    </>) :
                                    (<>
                                        <div className={styles.authSeqTitle}>고객 의무인증 수행 단계</div>
                                        <div className={styles.authSeqSubTitle}>블링크 서비스를 이용하기 위하여 고객 인증이 필요합니다.</div>
                                    </>)
                            }

                            <div className={styles.authSeqDesc}>
                                『특정 금융거래정보의 보고 및 이용 등에 관한 법률』 제5조의2(금융회사등의 고객 확인의무) 및 동법 시행령에 따라  가상자산사업자가 금융회사 등에 포함되어 블링크 전체 고객님들의 고객확인 제도 필수 시행이 필요합니다.
                            </div>

                            <div className={styles.authSeq} style={{ height: mobile ? seq[3] == 2 ? '70px' : 'calc(var(--size-24) + 211px + var(--size-12))' : 'auto' }}>
                                {
                                    seq[3] == 2 ?
                                        (<>
                                            <DoneSteps txt={'휴대폰 인증'} type={'done'} />
                                            <DoneSteps txt={'계좌 인증'} type={'done'} />
                                            <DoneSteps txt={'신분증 인증'} type={'done'} />
                                            <DoneSteps step={4} txt={'필수정보 입력'} />
                                        </>) :
                                        (<>
                                            {
                                                seq[0] == 1 ? <ActiveSeqStep step={1} txt={'휴대폰 인증'} /> : <DoneSteps txt={'휴대폰 인증'} />
                                            }
                                            {
                                                seq[1] == 0 ? <NoActiveSteps txt='계좌 인증' /> : seq[1] == 1 ? <ActiveSeqStep step={2} txt={'계좌 인증'} /> : <DoneSteps txt={'계좌 인증'} />
                                            }
                                            {
                                                seq[2] == 0 ? <NoActiveSteps txt='신분증 인증' /> : seq[2] == 1 ? <ActiveSeqStep step={3} txt={'신분증 인증'} /> : <DoneSteps txt={'신분증 인증'} />
                                            }
                                            {
                                                seq[3] == 0 ? <NoActiveSteps txt='필수정보 입력' /> : seq[3] == 1 ? <ActiveSeqStep step={4} txt={'필수정보 입력'} /> : <></>
                                            }
                                        </>)
                                }

                            </div>

                        </div>


                        <div className={styles.authSeqDiv}>
                            <div className={styles.authSeqTitle}>본인인증 등록</div>
                            <div className={styles.authSeqSubTitle}>보다 더 안전한 자산거래를 위하여 네이버 인증, 카카오 인증을 진행해 주세요.</div>

                            <div className={styles.authSeqDesc}>
                                {/* 황금시대의 동력은 위하여 위하여서...*/}
                            </div>

                            <div className={styles.authSeq2}>

                                <div className={styles.identificationBox}>
                                    <div>
                                        <Image src={imagePack.mypage.iconNaver} alt='iconNaver' />
                                        <div >
                                            {
                                                props.naver ? (
                                                    <>
                                                        <div className={styles.identifiItem}>
                                                            <div className={styles.goIdentiAuth2}>
                                                                네이버 인증
                                                            </div>
                                                            <div className={styles.isAuth} style={{ borderColor: 'var(--defaultColor)', color: 'var(--defaultColor)' }}>
                                                                인증완료
                                                            </div>
                                                        </div>
                                                        <div className={`${styles.wView} ${styles.identiText}`}>
                                                            네이버 서비스 인증 활성화가 완료되었습니다.
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={styles.identifiItem}>
                                                            <Link href={'/mypage/identification/naver'} className={styles.goIdentiAuth}>
                                                                네이버 인증 <Image src={imagePack.component.iconRightBlack} alt='iconRightBlack' />
                                                            </Link>
                                                            <div className={styles.isAuth} style={{ borderColor: '#b2b2b2', color: '#808080' }}>
                                                                미인증
                                                            </div>
                                                        </div>
                                                        <div className={`${styles.wView} ${styles.identiText}`} >
                                                            네이버 서비스 인증 활성화가 필요합니다.
                                                        </div>
                                                    </>
                                                )
                                            }

                                        </div>
                                    </div>
                                </div>

                                <div className={styles.identificationBox}>
                                    <div>
                                        <Image src={imagePack.mypage.iconKakao2} alt='iconKakao2' />
                                        <div >
                                            {
                                                props.kakao ? (
                                                    <>
                                                        <div className={styles.identifiItem}>
                                                            <div className={styles.goIdentiAuth2}>
                                                                카카오톡 인증
                                                            </div>
                                                            <div className={styles.isAuth} style={{ borderColor: 'var(--defaultColor)', color: 'var(--defaultColor)' }}>
                                                                인증완료
                                                            </div>
                                                        </div>
                                                        <div className={`${styles.wView} ${styles.identiText}`} >
                                                            카카오 서비스 인증 활성화가 완료되었습니다.
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className={styles.identifiItem}>
                                                            <Link href={'/mypage/identification/kakao'} className={styles.goIdentiAuth}>
                                                                카카오 인증 <Image src={imagePack.component.iconRightBlack} alt='iconRightBlack' />
                                                            </Link>
                                                            <div className={styles.isAuth} style={{ borderColor: '#b2b2b2', color: '#808080' }}>
                                                                미인증
                                                            </div>
                                                        </div>
                                                        <div className={`${styles.wView} ${styles.identiText}`} >
                                                            카카오 서비스 인증 활성화가 필요합니다.
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>

                            </div>

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

    let check;
    let user_info;
    let mydata = {
        email: null,
        name: null,
        phone: null,
        last_login: null,
        marketing: null,
        nickname: null
    }

    if (session) {
        masking_email = await maskingEmail(session.email);

        check = session.cert_level;
        let email = session.email;
        let token = session.token;

        user_info = await MemberInquiry(email, token);

        if (user_info.hasOwnProperty('redirect')) {
            req.session.destroy();
            return user_info.redirect;
        }


        let members = user_info.data.members;
        let agreements = user_info.data.agreements;
        let wallets = user_info.data.wallets;

        mydata = {
            name: members.name,
            phone: members.phone_num ? members.phone_num.split('-')[0] + ' - **** - ' + members.phone_num.split('-')[2] : members.phone_num,
            last_login: dateFormat(members.last_login_at),
            marketing: agreements.option_1,
            nickname: wallets ? wallets.nickname : null,
        }
    }
    1
    function dateFormat(date) {
        return new Date(date).toLocaleString()
    }

    return {
        ...checkSessionRedirect(req),
        props: {
            session: masking_email,
            mydata: mydata,
            naver: false,
            kakao: false,
            check: check,
        }
    }
})