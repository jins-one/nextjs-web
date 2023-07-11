import styles from '@/styles/pages/modify_myinfo.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkSessionRedirect from '@/functions/checkSessionRedirect';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';

import defines from '@/defines/defines';
import { PrivacyPolicyModal } from '@/components/privacyPolicy';
import AlertDialogNew2 from '@/components/alertDialog';
import ValidText from '@/components/isValid';
import apiFetch from '@/functions/apiFetch';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';
import maskingEmail from '@/functions/emailMasking';
import configs from '@/configs/configs';


export default function modifyMyInfo({ session, ...props }) {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);

    }, [])

    let router = useRouter();

    let mydata = props.data;

    const [f, setF] = useState(false);


    const checkRef = useRef(null);
    const [check, setCheck] = useState(false);

    const [alertModal, setAlertModal] = useState(false);
    const [img, setImg] = useState('logo');
    const [text, setText] = useState('');
    const [allStepComplete, setAllStepComplete] = useState(false);

    const [showModal, setshowModal] = useState(false);
    const [marketing, setMarketing] = useState(props.marketing);
    const [radio, setRadio] = useState(mydata.management_service);

    const [form, setForm] = useState({});


    const [modify, setModify] = useState(false);
    const [authStep, setAuthStep] = useState(false);

    useEffect(() => {
        if (router.query.auth) {
            setModify(true);
            setAuthStep(true);
        }
    }, [router.isReady])

    useEffect(() => {
        if (mydata.home_address) {
            setForm({
                home: mydata.home_address.split(')')[1].split(',')[0],
                home_detail: mydata.home_address.split(',')[1],
                home_zcode: mydata.home_address.substr(1, 5),

                c_address: mydata.work_address.split(')')[1].split(',')[0],
                c_address_detail: mydata.work_address.split(',')[1],
                c_zcode: mydata.work_address.substr(1, 5),
                c_num1: mydata.work_phone_num.split('-')[0],
                c_num2: mydata.work_phone_num.split('-')[1],
                c_num3: mydata.work_phone_num.split('-')[2],
                department: mydata.work_department_name,
                position: mydata.work_position,
                purpose: mydata.transaction_purpose,
                source: mydata.funds_source,

                detail: mydata.work_info,

                wallets: props.wallets
            })
        }

        if (marketing == 1) {
            checkRef.current.checked = true;
            setCheck(true);
        } else {
            checkRef.current.checked = false;
            setCheck(false);
        }
    }, [])



    async function consentCheck(check) {

        // 마케팅수신 동의 api
        let api_url = '/api/fetch/marketing';
        let body_data = {
            marketing: check
        }
        let result = await apiFetch(api_url, 'POST', body_data);

        if (result.success) {

            setCheck(check);
            if (check) {
                setMarketing(1)
            } else {
                setMarketing(0)
            }

        } else {
            if(result.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                router.push('/');
            }

        }

    }

    function findAddress(type) {
        if (type == 'home') {
            doroOpen(type);
        } else if (type == 'company') {
            doroOpen(type);
        }
    }

    function doroOpen(type) {
        new daum.Postcode({
            oncomplete: function (data) {

                if (data.userSelectedType == 'J') {

                    if (type == 'home') {
                        setForm({ ...form, home: data.jibunAddress, home_zcode: data.zonecode });
                    } else {
                        setForm({ ...form, c_address: data.jibunAddress, c_zcode: data.zonecode });
                    }

                } else if (data.userSelectedType == 'R') {

                    if (type == 'home') {
                        setForm({ ...form, home: data.roadAddress, home_zcode: data.zonecode });
                    } else {
                        setForm({ ...form, c_address: data.roadAddress, c_zcode: data.zonecode });
                    }
                }

            }
        }).open();

    }

    function handleRadio2(e) {
        setRadio(e.target.value);
    }


    function viewModal() {
        setshowModal(true);
    }


    /**
     * 정보 수정 취소
     */
    function cancelModifyInfo() {
        setModify(false);
    }

    /**
     * 정보 수정
     */
    async function modifyInfo() {

        setF(true);
        if (form.home && form.home_zcode && form.c_address && form.c_zcode && form.c_num1 && form.c_num2 && form.c_num3
            && form.department && form.position && form.purpose !== 'default' && form.source !== 'default' && form.detail && radio) {

            //정보 저장
            let api_url = '/api/fetch/members-info';
            let body_data = {
                home: form.home,
                home_detail: form.home_detail,
                home_zcode: form.home_zcode,

                c_address: form.c_address,
                c_address_detail: form.c_address_detail,
                c_zcode: form.c_zcode,
                c_num1: form.c_num1,
                c_num2: form.c_num2,
                c_num3: form.c_num3,
                department: form.department,
                position: form.position,
                purpose: form.purpose,
                source: form.source,
                detail: form.job_detail,
                total_service: radio
            }
            let method = 'POST';
            let result = await apiFetch(api_url, method, body_data);

            if (result.success) {
                setAllStepComplete(true);
                setText('필수정보 수정이 완료되었습니다.');
                setImg('logo')
                setAlertModal(true);

                setModify(false);

            } else {

            }

        }
    }

    async function closeAlert(boolean) {
        setAlertModal(boolean);
    }

    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />
            <PrivacyPolicyModal onModal={showModal} closeModal={setshowModal} contents={defines.cs_list.conditions.identification.contents} />

            <Header login={session} name={props.user_info.name}/>
            <Container>
                <section className={styles.section}>
                    <div className={styles.modifyContainer} style={{ paddingBlock: '5.625rem' }}>

                        <div className={styles.myPageName}>
                            안녕하세요<br />
                            <span>{props.user_info.name}님</span>
                        </div>

                        <div className={styles.infoDiv}>
                            <div className={styles.infoTitle}>
                                <div>개인정보 관리</div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>

                                <div className={styles.infoBox}>
                                    <div style={{ borderBottom: '2px solid #f6f7f9' }}>
                                        <div className={styles.infoBoxTitle}>
                                            이름
                                        </div>
                                        <div className={styles.infoBoxCont} style={{ display: 'flex', alignItems: 'center' }}>
                                            {props.user_info.name}
                                        </div>
                                    </div>
                                    <div >
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} >
                                                휴대폰 번호
                                            </div>
                                            <div className={styles.infoBoxCont} style={{ display: 'flex', alignItems: 'center' }}>
                                                {props.user_info.phone_num}
                                            </div>
                                        </div>
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} >
                                                이메일
                                            </div>
                                            <div className={styles.infoBoxCont} style={{ display: 'flex', alignItems: 'center' }}>
                                                {session}
                                            </div>
                                        </div>

                                    </div>
                                    <div >
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} >
                                                생년월일
                                            </div>
                                            <div className={styles.infoBoxCont} style={{ display: 'flex', alignItems: 'center' }}>
                                                {props.user_info.birthDate}
                                            </div>
                                        </div>
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} >
                                                개인정보 처리
                                            </div>
                                            <div className={`${styles.infoBoxCont} ${styles.PersonalInformation}`} style={{ display: 'flex', alignItems: 'center' }}>
                                                <div>
                                                    <div>동의함</div>
                                                    <div>{props.essential_at} 동의됨</div>
                                                </div>
                                                <div className={styles.viewConditions} onClick={viewModal}>약관보기</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} >
                                                비밀번호
                                            </div>
                                            <div className={`${styles.modiPw} ${styles.infoBoxCont}`} style={{ display: 'flex', alignItems: 'center' }}>
                                                ********
                                                <Link href='/mypage/modinfo/passwd'><div className={styles.pwChangeBtn}>변경</div></Link>
                                            </div>
                                        </div>
                                        <div className={styles.bothLine} >
                                            <div className={styles.infoBoxTitle} >
                                                출금 비밀번호
                                            </div>
                                            <div className={`${styles.modiPw} ${styles.infoBoxCont}`} style={{ display: 'flex', alignItems: 'center' }}>
                                                {
                                                    form.wallets ?
                                                        <>
                                                            ********
                                                            <Link href='/mypage/modinfo/withdrawal'><div className={styles.pwChangeBtn}>변경</div></Link>
                                                        </>
                                                        :
                                                        <div style={{ marginLeft: '0' }} onClick={() => {
                                                            if (props.user_info.cert_level < 1) {
                                                                setText('휴대폰 인증을 먼저 수행해주세요.');
                                                                setImg('alert');
                                                                setAlertModal(true);
                                                            } else {
                                                                router.push('/mypage/modinfo/withdrawal-regist')
                                                            }
                                                        }}><div className={styles.pwChangeBtn}>등록</div></div>
                                                }

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.consentBox}>
                                <label htmlFor='checkbox' className={styles.checkBox}>
                                    <input type={'checkbox'} id='checkbox' onChange={() => { consentCheck(checkRef.current.checked) }} ref={checkRef} />
                                    <span>{marketing === 1 ? '동의함' : '미동의'}</span>
                                </label>
                                <div className={styles.eventDesc}>이벤트, 혜택정보 E-Mail 및 문자메세지 수신 동의</div>
                            </div>
                            {
                                check && <div className={styles.consentDate}>{props.marketing_at} 동의됨</div>
                            }

                        </div>

                        {/* <div className={styles.bar}></div> */}

                        <div className={styles.infoDiv} id='target'>
                            <div className={`${styles.essential} ${styles.infoTitle}`} status={modify.toString()}>
                                <div>필수정보 관리</div>
                                {
                                    props.stack == 4 ? (!modify ? <div onClick={() => setModify(true)}>정보수정</div> : <></>) : <span className={styles.warnEssensionInfo}>* 고객 의무인증을 수행해주세요.</span>
                                    // (props.stack==4 && !modify) ? <div onClick={() => setModify(true)}>정보수정</div> : <></>
                                }

                            </div>

                            <div>
                                <div className={styles.authTitle}>자택정보</div>
                                <div className={styles.infoBox}>
                                    <div>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                            자택주소
                                        </div>
                                        <div className={styles.infoBoxCont} status={modify.toString()}>
                                            {
                                                !modify ?
                                                    props.stack == 4 && `(${form.home_zcode}) ${form.home}, ${form.home_detail}`
                                                    :
                                                    <>
                                                        <div className={styles.addressModi}>
                                                            <input type='text' value={form.home_zcode} disabled style={{ width: '16.25rem', border: (f && !form.home_zcode) ? '2px solid #FF0000' : '1px solid #B2B2B2' }} />
                                                            <div className={styles.btn} onClick={() => findAddress('home')} style={{ marginLeft: '0.75rem' }}>우편번호</div>
                                                        </div>
                                                        <div className={styles.addressModi} >
                                                            <input type='text' value={form.home} disabled style={{ width: '30rem', border: (f && !form.home) ? '2px solid #FF0000' : '1px solid #B2B2B2' }} />
                                                        </div>
                                                        <div className={styles.addressModi}>
                                                            <div className={styles.inputBox}>
                                                                <input type='text' value={form.home_detail} onChange={(e) => { setForm({ ...form, home_detail: e.target.value }); }} />
                                                                {form.home_detail && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, home_detail: '' })} />}
                                                            </div>
                                                        </div>

                                                    </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modiEssentialInfo} >
                                <div className={styles.authTitle}>직장정보</div>
                                <div className={styles.infoBox}>
                                    <div style={{ borderBottom: '2px solid #f6f7f9' }}>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                            직장주소
                                        </div>
                                        <div className={styles.infoBoxCont} status={modify.toString()}>
                                            {
                                                !modify ?
                                                    props.stack == 4 && `(${form.c_zcode}) ${form.c_address}, ${form.c_address_detail}`
                                                    :
                                                    <>
                                                        <div className={styles.addressModi}>
                                                            <input type='text' value={form.c_zcode} disabled style={{ width: '16.25rem', border: (f && !form.c_zcode) ? '2px solid #FF0000' : '1px solid #B2B2B2' }} />
                                                            <div className={styles.btn} onClick={() => findAddress('company')} style={{ marginLeft: '0.75rem' }}>우편번호</div>
                                                        </div>
                                                        <div className={styles.addressModi} >
                                                            <input type='text' value={form.c_address} disabled style={{ width: '30rem', border: (f && !form.c_address) ? '2px solid #FF0000' : '1px solid #B2B2B2' }} />
                                                        </div>

                                                        <div className={styles.addressModi} >
                                                            <div className={styles.inputBox}>
                                                                <input type='text' value={form.c_address_detail} onChange={(e) => setForm({ ...form, c_address_detail: e.target.value })} />
                                                                {form.c_address_detail && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, c_address_detail: '' })} />}
                                                            </div>
                                                        </div>


                                                    </>
                                            }

                                        </div>
                                    </div>
                                    <div >
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                                직장 번호
                                            </div>
                                            <div className={styles.infoBoxCont} status={modify.toString()}>
                                                {
                                                    !modify ?
                                                        props.stack == 4 && `${form.c_num1}-${form.c_num2}-${form.c_num3}`
                                                        :
                                                        <>
                                                            <div className={styles.addressModi} type='phone'>
                                                                <input value={form.c_num1} onChange={(e) => setForm({ ...form, c_num1: e.target.value })} style={{ width: '4rem', padding: '0', textAlign: 'center', border: (f && !form.c_num1) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}
                                                                    maxLength={3} type='number'
                                                                    onInput={(e) => {
                                                                        // if (e.target.value.length > e.target.maxLength)
                                                                        //     e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                                    }} />
                                                                <span>―</span>
                                                                <input value={form.c_num2} onChange={(e) => setForm({ ...form, c_num2: e.target.value })} style={{ width: '4rem', padding: '0', textAlign: 'center', border: (f && !form.c_num2) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}
                                                                    maxLength={4} type='number'
                                                                    onInput={(e) => {
                                                                        // if (e.target.value.length > e.target.maxLength)
                                                                        //     e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                                    }} />
                                                                <span>―</span>
                                                                <input value={form.c_num3} onChange={(e) => setForm({ ...form, c_num3: e.target.value })} style={{ width: '4rem', padding: '0', textAlign: 'center', border: (f && !form.c_num3) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}
                                                                    maxLength={4} type='number'
                                                                    onInput={(e) => {
                                                                        // if (e.target.value.length > e.target.maxLength)
                                                                        //     e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                                    }} />
                                                            </div>

                                                        </>
                                                }
                                            </div>
                                        </div>
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                                부서명
                                            </div>
                                            <div className={styles.infoBoxCont} status={modify.toString()}>
                                                {
                                                    !modify ?
                                                        props.stack == 4 && `${form.department}`
                                                        :
                                                        <>
                                                            <div className={styles.addressModi}>
                                                                <div className={styles.inputBox} style={{ width: '15.625rem', border: (f && !form.department) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                                    <input type='text' value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                                                                    {form.department && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, department: '' })} />}
                                                                </div>

                                                            </div>

                                                        </>
                                                }
                                            </div>
                                        </div>

                                    </div>
                                    <div>
                                        <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                            <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                                직위
                                            </div>
                                            <div className={styles.infoBoxCont} status={modify.toString()}>
                                                {
                                                    !modify ?
                                                        props.stack == 4 && `${form.position}`
                                                        :
                                                        <>
                                                            <div className={styles.addressModi}>
                                                                <div className={styles.inputBox} style={{ width: '15.625rem', border: (f && !form.position) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                                    <input type='text' value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
                                                                    {form.position && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, position: '' })} />}
                                                                </div>

                                                            </div>

                                                        </>
                                                }
                                            </div>
                                        </div>
                                        <div className={styles.bothLine} >
                                            <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                                상세
                                            </div>
                                            <div className={styles.infoBoxCont} status={modify.toString()}>
                                                {
                                                    !modify ?
                                                        props.stack == 4 && `${form.detail}`
                                                        :
                                                        <>
                                                            <div className={styles.addressModi}>
                                                                <div className={styles.inputBox} style={{ width: '15.625rem', border: (f && !form.detail) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                                    <input type='text' value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} />
                                                                    {form.detail && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, detail: '' })} />}
                                                                </div>
                                                            </div>
                                                        </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modiEssentialInfo}>
                                <div className={styles.authTitle}>거래목적 및 자금출처</div>
                                <div className={styles.infoBox}>
                                    <div style={{ borderBottom: modify ? '1px solid #f6f7f9' : '1px solid #808080' }}>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                            거래목적
                                        </div>
                                        <div className={styles.infoBoxCont} status={modify.toString()}>
                                            {
                                                !modify ?
                                                    props.stack == 4 && `${form.purpose}`
                                                    :
                                                    <>
                                                        <div className={styles.addressModi} style={{ marginBottom: '0' }}>
                                                            <select name='purpose' value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required style={{ border: (f && form.purpose == 'default') ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                                <option value='default' disabled>거래목적</option>
                                                                <option value='저축 및 투자'>저축 및 투자</option>
                                                                <option value='급여 및 생활비'>급여 및 생활비</option>
                                                                <option value='대출원리금 상환 결제'>대출원리금 상환 결제</option>
                                                                <option value='사업상 거래'>사업상 거래</option>
                                                                <option value='기타'>기타</option>
                                                            </select>

                                                        </div>

                                                    </>
                                            }

                                        </div>

                                    </div>

                                    <div>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                            자금출처
                                        </div>
                                        <div className={styles.infoBoxCont} status={modify.toString()}>
                                            {
                                                !modify ?
                                                    props.stack == 4 && `${form.source}`
                                                    :
                                                    <>
                                                        <div className={styles.addressModi} style={{ marginBottom: '0' }}>
                                                            <select name='source' value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={{ border: (f && form.source == 'default') ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                                <option value='default' disabled>자금출처</option>
                                                                <option value='근로 및 연금소득'>근로 및 연금소득</option>
                                                                <option value='퇴직소득'>퇴직소득</option>
                                                                <option value='사업소득'>사업소득</option>
                                                                <option value='부동산 임대소득'>부동산 임대소득</option>
                                                                <option value='부동산 양도소득'>부동산 양도소득</option>
                                                                <option value='금융소득(이자 및 배당)'>금융소득(이자 및 배당)</option>
                                                                <option value='상속/증여'>상속/증여</option>
                                                                <option value='일시 재산양도로 인한 소득'>일시 재산양도로 인한 소득</option>
                                                                <option value='기타'>기타</option>
                                                            </select>

                                                        </div>

                                                    </>
                                            }

                                        </div>

                                    </div>
                                    {
                                        modify && (
                                            <>
                                                <div style={{ borderTop: '1px solid #808080' }}>
                                                    <div className={styles.infoBoxTitle} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                                        종합관리 서비스 유/무
                                                    </div>
                                                    <div className={styles.infoBoxCont} style={{ paddingBlock: !modify ? '2rem' : '1rem' }}>
                                                        <div className={styles.serviceDiv}>
                                                            <div className={styles.serviceText}>본인은 금융회사 등으로부터 '종합관리 서비스'를 받고 있습니까?</div>
                                                            {(f && !radio) && <ValidText valueType={'essential'} />}
                                                            <div className={styles.radioBtnDiv2}>
                                                                <label><input type='radio' name='service' value={1} onChange={handleRadio2} checked={radio == 1} />예</label>
                                                                <label><input type='radio' name='service' value={0} onChange={handleRadio2} checked={radio == 0} />아니오</label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>

                                            </>

                                        )
                                    }

                                </div>

                                {
                                    modify && (
                                        <div className={styles.appBtnDiv}>
                                            <div className={styles.cancelBtn} style={{ width: '13.75rem' }} onClick={() => cancelModifyInfo()}>취소</div>
                                            <div className={styles.okBtn} onClick={() => modifyInfo()}>{authStep ? '저장' : '변경'}</div>
                                        </div>
                                    )
                                }

                            </div>

                        </div>

                        {
                            !modify && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--size-30)', width: '100%' }}>
                                    <Link href='/account/withdrawal'><div className={styles.membershipWithdrawalBtn}>회원탈퇴</div></Link>
                                </div>
                            )
                        }


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

    let stack;
    let user_info;
    let kyc_info;
    let essential_at;
    let marketing;
    let marketing_at;
    let wallets;

    if (session) {
        masking_email = await maskingEmail(session.email);

        stack = session.cert_level; //고객의무인증 중 필수정보 입력 완료 여부

        let email = session.email;
        let token = session.token;

        const data = await MemberInquiry(email, token);
        if (data.hasOwnProperty('redirect')) {
            req.session.destroy();
            return data.redirect;
        }

        if (data.success) {
            let info = data.data.members;
            user_info = {
                phone_num: info.phone_num?info.phone_num.split('-')[0]+' - **** - ' + info.phone_num.split('-')[2]:info.phone_num,
                name: info.name,
                birthDate: info.birthDate,
                cert_level: info.cert_level
            },
            
            kyc_info = data.data.kyc;

            essential_at = dateFormat(data.data.agreements.requirement_1_at.split('T')[0]);
            marketing = data.data.agreements.option_1;
            marketing_at = dateFormat(data.data.agreements.option_1_at.split('T')[0]);
            wallets = data.data.wallets?true:false
        } else {
            kyc_info = null;
        }
    }

    function dateFormat(date) {
        return date.split('-')[0] + '년 ' + date.split('-')[1] + '월 ' + date.split('-')[2] + '일';
    }

    return {
        ...checkSessionRedirect(req),
        props: {
            session: masking_email,
            user_info: user_info,
            data: kyc_info,
            stack: stack,
            essential_at: essential_at,
            marketing: marketing,
            marketing_at: marketing_at,
            wallets: wallets
        }
    }
})