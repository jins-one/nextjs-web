import styles from '../../styles/pages/deposit.module.css';
import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import { AssetsDeposit } from '@/components/assetsDeposit';
import defines from '@/defines/defines';
import DepositProduct from '@/components/depositProduct';
import AlertDialogNew2 from '@/components/alertDialog';
import numberFormat from '@/functions/numberFormat';
import apiFetch from '@/functions/apiFetch';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';
import apiFetch2 from '@/functions/apiFetch2';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';

import { debounce } from 'lodash';

/**
 * 상품(예치) 페이지
 */
export default function Deposit({session, ...props}) {
    const router = useRouter();

    let data = props.data;

    const [depositModal, setDepositModal] = useState(false);
    const [alertModal, setAlertModal] = useState(false);

    const [filter, setFilter] = useState(false);
    const [filter2, setFilter2] = useState(false);

    const [balance, setBalance] = useState(props.balance);

    const depositMoneyRef = useRef();

    function filterOpen() {
        setFilter(!filter);
    }
    function filterOpen2() {
        setFilter2(!filter2);
    }

    function consentCheck(e) {

    }
    function consentCheck2(e) {

    }

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj, session)=>{
        setResValue(await apiFetch2(url, obj, session));
    })
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        if(resValue.hasOwnProperty('success')){
            if (resValue.success) {
                setTimeout(() => {
                    setBalance(resValue.data);
                    depositMoneyRef.current.classList.remove(styles.clicked);
                }, 1000)
    
            } else if (resValue.redirect) {
                const data = async ()=>{return await apiFetch2(configs.frontUrl +'/api/logout', { method: 'POST' }, session);}
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
    },[resValue])


    async function clickRefresh() {
        
        depositMoneyRef.current.classList.add(styles.clicked);

        let api_url =  '/api/fetch/coin-balance';
        apiDebounce(api_url, {method:'GET'}, session);
    }

    function alertCloseAndGologin(b) {
        setAlertModal(b);
        router.replace('/login')
    }

    function goCS() {
        router.push('/cs/qna?type=deposit')
    }

    return (
        <>
            <Header login={session} name={props.name}/>

            <Container>
                <AssetsDeposit onModal={depositModal} closeModal={setDepositModal} />
                <AlertDialogNew2 onModal={alertModal} closeModal={alertCloseAndGologin} text={'로그인 후 이용해주세요.'} img={'alert'} />
                <section className={styles.depositSection}>
                    <div className={`sectionContainer ${styles.productContainer}`}>


                        <div className={styles.mainBox}>
                            <div>
                                <div className={styles.subTitle}>블링크로 쉽게 가상자산 관리하기</div>
                                <div className={styles.mainTitle}>
                                    예금보다 높은 수익률<br /> 예치로 수익을 쌓으세요
                                </div>

                            </div>
                            <div className={styles.balanceDiv}>
                                <div className={styles.balanceBox}>
                                    {/* <div><span><span>김밤돌</span>님의 현재 예치 가능한 금액</span><Image src={imagePack.component.iconRotateWhite} alt='iconRotate' className={styles.iconRotate} /></div> */}
                                    <div>
                                        <div>{session && (<><span>{props.name}</span> 님의</>)} 현재 예치 가능한 금액</div>
                                        {session && <div className={`${styles.iconRotate}`} onClick={clickRefresh} ref={depositMoneyRef} ></div>}
                                    </div>
                                    <div><Image src={imagePack.component.iconEthWhite} alt='iconEthWhite' />
                                        {
                                            session ? numberFormat(balance.toString(), false, true, true) : <span>로그인 후 확인하실수 있습니다.</span>
                                        }
                                    </div>
                                </div>
                                <div className={styles.depositBox}>
                                    <div>더 많은 금액을<br />예치하고 싶다면?</div>
                                    <div onClick={() => { session ? setDepositModal(true) : setAlertModal(true) }}>입금하기</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.productDiv}>
                            <div>
                                <div className={styles.productHeader} />
                                <div style={{ marginRight: '1.875rem' }}>
                                    {/* <div className={styles.filterBox}>
                                            <div>
                                                <span>필터</span>
                                                <Image src={imagePack.component.iconRotateBlack} alt='iconRotate' className={styles.iconRotate} />
                                            </div>
                                            <div className={styles.bar} />
                                            <div className={styles.filterType} style={{marginTop:'0.75rem'}}>
                                                <div>
                                                    <span>자산유형</span>
                                                    {
                                                        filter ? (<Image src={imagePack.component.iconTop} alt='iconTop' className={styles.iconUpDwon} onClick={filterOpen} />)
                                                            :
                                                            (<Image src={imagePack.component.iconDown} alt='iconDown' className={styles.iconUpDwon} onClick={filterOpen} />)
                                                    }

                                                </div>
                                                <div>
                                                    {
                                                        filter && (
                                                            <label htmlFor='checkbox' className={styles.checkBox}>
                                                                <input type={'checkbox'} id='checkbox' onChange={consentCheck} />
                                                                이더리움(ETH)
                                                            </label>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <div className={styles.filterType} style={{marginTop:'1.5rem'}}>
                                                <div>
                                                    <span>예치기간</span>
                                                    {
                                                        filter2 ? (<Image src={imagePack.component.iconTop} alt='iconTop' className={styles.iconUpDwon} onClick={filterOpen2} />)
                                                            :
                                                            (<Image src={imagePack.component.iconDown} alt='iconDown' className={styles.iconUpDwon} onClick={filterOpen2} />)
                                                    }

                                                </div>
                                                <div>
                                                    {
                                                        filter2 && (
                                                            <label htmlFor='checkbox2' className={styles.checkBox}>
                                                                <input type={'checkbox'} id='checkbox2' onChange={consentCheck2} />
                                                                1주일
                                                            </label>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div> */}

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
                            <div>
                                <div className={styles.productHeader}>
                                    총 <span>{data.length}개</span>의 상품이 있습니다.
                                </div>
                                <div className={styles.depositDiv}>

                                    {data.map((item, idx) => (
                                        <div key={idx}>
                                            <DepositProduct data={item} />
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.adBox} onClick={() => { }}></div>
                                {/* <Image src={imagePack.deposit.imgDepositUsage} alt='imgDepositUsage' className={styles.adBox} onClick={()=>{}}/> */}
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
    let data = defines.deposit.data; //api 붙이면 빈배열로 변경

    let user_name = null;
    let balance = 0;

    let masking_email='';
    if (session) {

        let email = session.email;
        let token = session.token;
        
        const user_result = await MemberInquiry(email, token);
        if(user_result.hasOwnProperty('redirect')){
            req.session.destroy();
            // return user_result.redirect;
            
        } else {
            masking_email = await maskingEmail(email);
            user_name = user_result.data.members.name;
            balance = user_result.data.accounts.balance;
        }

        
        // const product_result = await apiFetch(configs.products_get_inquiry, 'GET');

        // if (product_result.success) {
        //     data = product_result.list;
        // } else {
        //     data = [];
        // }
        
    }

    return {
        props: {
            session: masking_email,
            data: data,
            balance: balance,
            name: user_name
        },
    }
})