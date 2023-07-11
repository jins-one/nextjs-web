import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import styles from '@/styles/pages/deposit_detail.module.css';
import imagePack from '@/styles/image-module';
import Image from 'next/image';
import Link from 'next/link';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import defines from "@/defines/defines";
import ValidText from "@/components/isValid";
import { DepositModal } from "@/components/product_deposit";
import AlertDialogNew2 from "@/components/alertDialog";
import apiFetch from "@/functions/apiFetch";
import apiFetch2 from "@/functions/apiFetch2";
import maskingEmail from "@/functions/emailMasking";
import configs from '@/configs/configs';
import { MemberInquiry } from "@/fetchs/members/get/userid/inquiry";


import { debounce } from "lodash";


export default function DepositDetail({session, ...props}) {

    const router = useRouter();

    let data = props.data;

    const [showDeposit, setShowDeposit] = useState(false);
    const [alertModal, setAlerModal] = useState(false);
    const [my_eth, setMyEth] = useState(0);

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj, session)=>{
        setResValue(await apiFetch2(url, obj, session));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        if(resValue.hasOwnProperty('success')){
            if (resValue.success) {
                setMyEth(resValue.data);
                setShowDeposit(true);
            } else if (resValue.redirect) {
                const data = async ()=>{return await apiFetch2(configs.frontUrl +'/api/logout', { method: 'POST' }, session)};
                if (data.ok) {
                    router.push('/login?session=no');
                }
            } else if(resValue.code==1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                router.push('/');
            } else {
                alert('오류가 발생했습니다. 다시 시도해 주세요.');
                router.reload();
            }
        }
    },[resValue]);

    //예치하기
    async function goDepositFnc() {
        let api_url =  '/api/fetch/coin-balance';
        let obj = {
            method: 'GET'
        }
        apiDebounce(api_url, obj, session);
    }


    function alertCloseAndGologin(b) {
        setAlerModal(b);
        router.replace('/login')
    }

    function goCS() {
        router.push('/cs/qna?type=deposit')
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={alertCloseAndGologin} text={'로그인 후 이용해주세요.'} img={'alert'} />
            <DepositModal onModal={showDeposit} closeModal={setShowDeposit} my_eth={my_eth.toString()} data={data} />

            <Header login={session} name={props.name}/>
            <Container >
                <section>
                    <div className={`sectionContainer ${styles.productContainer}`}>

                        <div className={styles.productDiv}>
                            <div>
                                <div className={styles.productHeader} />
                                <div style={{ marginRight: '2.5rem' }}>

                                    <div className={styles.contactBox} onClick={goCS}>
                                        <Image src={imagePack.cs.contactImg2} alt='contactImg2' className={styles.contactImg} priority/>
                                        <div className={styles.contactTitle}>
                                            궁금한게 있으신가요?
                                        </div>
                                        <div className={styles.contactDesc}>
                                            <div>자주 묻는 질문 및 1:1 채팅 상담을 통해 보다 더 자세한 서비스안내를 받으실 수 있습니다.</div>
                                            <div className={styles.goCS}><Link href={'/cs/qna?type=deposit'}>고객센터 바로가기</Link></div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                            <div className={styles.detailDiv}>
                                <div className={`${styles.productHeader} ${styles.mainTitle}`}>
                                    가상자산 예치 상품
                                </div>
                                <div className={styles.depositDiv}>
                                    <div>
                                        <div className={styles.bar}></div>
                                        정기예치
                                    </div>

                                    <div>
                                        <div className={styles.productInfo1}>
                                            <div>
                                                <span className={styles.productName}>
                                                    이더리움(ETH)
                                                </span>
                                                <span>{data.name}</span>
                                            </div>
                                            <div>
                                                <span>신청기간</span>
                                                {/* <span>2023.01.09 ~ 2023.01.20</span> */}
                                                <span>{data.application}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.productInfo2}>
                                        <div className={styles.productCircle} >
                                            <Image src={imagePack.deposit.iconCalendar} alt='iconCalendar' />
                                            <span className={styles.circleTitle}>예치기간</span>
                                            <span className={styles.circleText}>{data.period}</span>
                                        </div>
                                        <div className={styles.productCircle} >
                                            <Image src={imagePack.deposit.iconHandcoin} alt='iconHandcoin' />
                                            <span className={styles.circleTitle}>수익률</span>
                                            <span className={styles.circleText}>{data.rate}%</span>
                                        </div>
                                        <div className={styles.productCircle} >
                                            <Image src={imagePack.deposit.iconNoteedit} alt='iconNoteedit' />
                                            <span className={styles.circleTitle}>최소금액</span>
                                            <span className={styles.circleText}>{data.min}ETH</span>
                                        </div>
                                        <div className={styles.productCircle} >
                                            <Image src={imagePack.deposit.iconBell} alt='iconBell' />
                                            <span className={styles.circleTitle}>특징</span>
                                            <span>예치기간 종료 후<br />이더리움으로 지급</span>
                                        </div>
                                    </div>

                                    <div className={styles.productInfo3}>
                                        <div className={styles.infoList}>
                                            <div className={styles.infoListTitle}>예치자산</div>
                                            <div className={styles.infoListCont}>이더리움(ETH)</div>
                                        </div>
                                        <div className={styles.infoList}>
                                            <div className={styles.infoListTitle}>신청 최소수량</div>
                                            <div className={styles.infoListCont}>{data.min} ETH</div>
                                        </div>
                                        <div className={styles.infoList}>
                                            <div className={styles.infoListTitle}>신청 최대수량</div>
                                            <div className={styles.infoListCont}>{data.max} ETH</div>
                                        </div>
                                        <div className={styles.infoList}>
                                            <div className={styles.infoListTitle}>예치기간</div>
                                            <div className={styles.infoListCont}>{data.application}</div>
                                        </div>
                                        <div className={styles.infoList} style={{ alignItems: 'flex-start' }}>
                                            <div className={styles.infoListTitle}>상품 설명</div>
                                            <div className={styles.infoListCont}>
                                                {
                                                    data.character.map((p, index) => (
                                                        <div className={styles.expCont} key={index}>
                                                            <Image src={imagePack.component.iconCheckPurple} alt='iconCheckPurple' style={{ marginRight: '0.375rem', marginTop:'0.25rem' }} />
                                                            {p}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.btnDiv}>
                                        <div className={styles.cancelBtn} onClick={() => { router.back() }}>취소</div>
                                        <div className={styles.authBtn} onClick={() => { session ? goDepositFnc() : setAlerModal(true) }}>예치하기</div>
                                    </div>


                                </div>

                            </div>
                        </div>

                    </div>
                </section>
            </Container>
            <Footer />
        </>
    );
}


export const getServerSideProps = withSessionSsr(async function ({ req, res }) {
    let session = req.session.user;

    let data = {
        name: 'Ethereum_202301_12M',
        rate: '16',
        count: '500',
        period: '12개월',
        application: '상시 신청 가능',
        min: '1',
        max: '500',
        character: [
            '자유롭게 이더리움을 예치하실 수 있습니다.',
            '연이율 16% 수익을 드립니다.',
            '예치 승인 후 365일 뒤 자동 종료되며, 중도해지는 불가합니다.',
            '예치금과 수익은 종료 후 이더리움으로 지급됩니다.'
        ],
        deposit_open: '2023년 01월 01일',
        deposit_close: '2023년 01월 01일'
    } //api 붙이면 null로 변경


    let masking_email='';
    let name = '';
    if (session) {
        
        const user_result = await MemberInquiry(session.email, session.token);
        if(user_result.hasOwnProperty('redirect')){
            req.session.destroy();
            // return user_result.redirect;
        } else {
            masking_email = await maskingEmail(session.email);
            name = user_result.data.members.name;
        }

        // const product_result = await apiFetch(configs.products_get_productid_inquiry, 'GET');

        // if (product_result.success) {
        //     data = product_result.data;
        // } else {
        //     data = null;
        // }
    }

    return {
        props: {
            session: masking_email,
            data: data,
            name: name
        },
    };

})