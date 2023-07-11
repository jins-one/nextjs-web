import styles from '@/styles/pages/popup.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

import imagePack from '@/styles/image-module';
import defines from '@/defines/defines';
import ValidText from '@/components/isValid';

import AlertDialogNew2 from './alertDialog';

/**
 * 필수정보 입력 팝업
 */
export default function InfoInput(props) {

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);
    }, [])

    const router = useRouter();

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    const [allStepComplete, setAllStepComplete] = useState(false);


    const [form, setForm] = useState({
        home: '',
        home_zcode: '',
        home_detail: '',
        job1: 'labor',
        job2: '1',
        c_name: '',
        c_address: '',
        c_zcode: '',
        c_address_detail: '',
        c_num1: '',
        c_num2: '',
        c_num3: '',
        department: '',
        position: '',
        purpose: 'default',
        source: 'default'
    })
    const [add, setAdd] = useState({
        home: '',
        company: ''
    })

    const [radio, setRadio] = useState('');
    const [f, setF] = useState(false);

    function handleRadio(e) {
        setRadio(e.target.value);
    }


    function allAuthCheck() {
        setF(true);

        if (radio && form.c_name && form.department && form.position && form.home && form.c_address && form.home_zcode && form.c_zcode 
            && form.c_num1 && form.c_num2 && form.c_num3 && form.source !== 'default' && form.purpose!=='default') {

            setAllStepComplete(true);
            setText('필수정보가 저장되었습니다.');
            setAlertModal(true);
        }
    }


    function findAddress(type) {
        if (type == 'home') {
            doroOpen(type);
        } else if (type == 'company') {
            doroOpen(type);
        }
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);

        if (allStepComplete) {
            props.func(4);
            props.setDone(true);
        }
    }


    function Job2() {
        let type = form.job1;

        if (type == 'labor') {
            return (
                <select name='job2' value={form.job2} style={{ width: '18.563rem' }} onChange={e => setForm({ ...form, job2: e.target.value })}>
                    <option value='1'>상세 직업 선택</option>
                    <option value='2'>{defines.labor.general}</option>
                    <option value='3'>{defines.labor.civil}</option>
                    <option value='4'>{defines.labor.educational}</option>
                    <option value='5'>{defines.labor.financial}</option>
                    <option value='6'>{defines.labor.journalism}</option>
                    <option value='7'>{defines.labor.public}</option>
                    <option value='8'>{defines.labor.specialized}</option>
                    <option value='9'>{defines.labor.virtual}</option>
                    <option value='10'>기타</option>
                </select>

            )
        } else if (type == 'selfemployed') {
            return (
                <select name='job2' value={form.job2} style={{ width: '18.563rem' }} onChange={e => setForm({ ...form, job2: e.target.value })}>
                    <option value='1' >상세 직업 선택</option>
                    <option value='2' >{defines.selfEmployed.manufacturer}</option>
                    <option value='3' >{defines.selfEmployed.wholesale_retail}</option>
                    <option value='4' >{defines.selfEmployed.construction}</option>
                    <option value='5' >{defines.selfEmployed.restaurant}</option>
                    <option value='6' >{defines.selfEmployed.convenience}</option>
                    <option value='7' >{defines.selfEmployed.travel}</option>
                    <option value='8' >{defines.selfEmployed.rental}</option>
                    <option value='9' >{defines.selfEmployed.gambling}</option>
                    <option value='10'>{defines.selfEmployed.money}</option>
                    <option value='11'>{defines.selfEmployed.pawnshop}</option>
                    <option value='12'>기타</option>
                </select>
            )
        } else if (type == 'specialized') {
            return (
                <select name='job2' value={form.job2} style={{ width: '18.563rem' }} onChange={e => setForm({ ...form, job2: e.target.value })}>
                    <option value='1' >상세 직업 선택</option>
                    <option value='2' >{defines.specialized.lawyer}</option>
                    <option value='3' >{defines.specialized.doctor}</option>
                    <option value='4' >{defines.specialized.cpa}</option>
                    <option value='5' >{defines.specialized.tax}</option>
                    <option value='6' >{defines.specialized.judicial}</option>
                    <option value='7' >{defines.specialized.controller}</option>
                    <option value='8'>기타</option>
                </select>
            )
        } else if (type == 'etc') {
            return (
                <select name='job2' value={form.job2} style={{ width: '18.563rem' }} onChange={e => setForm({ ...form, job2: e.target.value })}>
                    <option value='1' >상세 직업 선택</option>
                    <option value='2' >{defines.etc.retired}</option>
                    <option value='3' >{defines.etc.housewife}</option>
                    <option value='4' >{defines.etc.student}</option>
                    <option value='5' >{defines.etc.politician}</option>
                    <option value='6' >{defines.etc.religious}</option>
                    <option value='7' >{defines.etc.notemployed}</option>
                    <option value='8'>기타</option>
                </select>
            )
        }
    }

    function doroOpen(type) {
        new daum.Postcode({
            oncomplete: function (data) {

                if (data.userSelectedType == 'J') {

                    if (type == 'home') {
                        setForm({ ...form, home: data.jibunAddress, home_zcode: data.zonecode });
                        setAdd({ ...add, home: `(${data.zonecode}) ${data.jibunAddress} ` })
                    } else {
                        setForm({ ...form, c_address: data.jibunAddress, c_zcode: data.zonecode });
                        setAdd({ ...add, company: `(${data.zonecode}) ${data.jibunAddress} ` })
                    }

                } else if (data.userSelectedType == 'R') {

                    if (type == 'home') {
                        setForm({ ...form, home: data.roadAddress, home_zcode: data.zonecode });
                        setAdd({ ...add, home: `(${data.zonecode}) ${data.roadAddress} ` })
                    } else {
                        setForm({ ...form, c_address: data.roadAddress, c_zcode: data.zonecode });
                        setAdd({ ...add, company: `(${data.zonecode}) ${data.roadAddress} ` })
                    }
                }

            }
        }).open();

    }

    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'logo'} text={text} />

            <div className={styles.popupDiv}>


                <div className={`${styles.authenticationBox} ${styles.inputInfo2}`}>

                    <div>
                        {/* {(!isValid.home) && <ValidText valueType={'address'} />} */}
                        <div className={styles.authTitle} style={{ marginTop: '0' }}>자택주소 {(f && !form.home) && <ValidText valueType={'essential'} />}</div>

                        <div className={styles.selectBox}>
                            <input type='text' value={add.home} disabled placeholder='자택 주소를 입력하여 주세요' style={{ width: '24.75rem' }} />
                            <div className={styles.authBtn} onClick={() => findAddress('home')} style={{ width: '9.75rem' }}>주소찾기</div>
                        </div>
                        <div className={styles.selectBox}>
                            <input type='text' value={form.home_detail} onChange={e => setForm({ ...form, home_detail: e.target.value })} placeholder='상세주소를 입력하여 주세요' style={{ width: '100%' }} />
                        </div>
                    </div>

                    {/* <div>
                        <div className={styles.authTitle}>직업
                            {(f && form.job2 == '1') && <span style={{ fontSize: '0.875rem', color: '#FF0000' }}>
                                *상세직업을 선택해주세요
                            </span>}
                        </div>
                        <div className={styles.selectBox}>
                            <select name='job1' value={form.job1} onChange={e => setForm({ ...form, job1: e.target.value })} style={{ width: '15rem' }}>
                                <option value='labor'>근로자</option>
                                <option value='selfemployed'>자영업자</option>
                                <option value='specialized'>전문직</option>
                                <option value='etc'>기타</option>
                            </select>
                            <Job2 />
                        </div>
                    </div> */}

                    <div>
                        <div className={styles.authTitle}>직장명 {(f && !form.c_name) && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <input type='text' value={form.c_name} onChange={e => setForm({ ...form, c_name: e.target.value })} placeholder='직장명을 입력하여 주세요' />
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>직장 주소 {(f && !form.c_address) && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <input type='text' value={add.company} disabled readOnly placeholder='직장 주소를 입력하여 주세요' style={{ width: '24.75rem' }} />
                            <div className={styles.authBtn} onClick={() => findAddress('company')} style={{ width: '9.75rem' }}>주소찾기</div>
                        </div>
                        <div className={styles.selectBox}>
                            <input type='text' value={form.c_address_detail} onChange={e => setForm({ ...form, c_address_detail: e.target.value })} placeholder='상세주소를 입력하여 주세요' style={{ width: '100%' }} />
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>직장 번호 {(f && !form.c_address) && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <div className={styles.addressModi} type='phone'>
                                <input value={form.c_num1} onChange={(e) => setForm({ ...form, c_num1: e.target.value })} style={{ width: '5.5rem', padding: '0', textAlign: 'center' }}
                                    maxLength={3} type='number'
                                    onInput={(e) => {
                                        if (e.target.value.length > e.target.maxLength)
                                            e.target.value = e.target.value.slice(0, e.target.maxLength);
                                    }} />
                                <span style={{marginInline:'0.75rem'}}>―</span>
                                <input value={form.c_num2} onChange={(e) => setForm({ ...form, c_num2: e.target.value })} style={{ width: '5.5rem', padding: '0', textAlign: 'center' }}
                                    maxLength={4} type='number'
                                    onInput={(e) => {
                                        if (e.target.value.length > e.target.maxLength)
                                            e.target.value = e.target.value.slice(0, e.target.maxLength);
                                    }} />
                                <span style={{marginInline:'0.75rem'}}>―</span>
                                <input value={form.c_num3} onChange={(e) => setForm({ ...form, c_num3: e.target.value })} style={{ width: '5.5rem', padding: '0', textAlign: 'center' }}
                                    maxLength={4} type='number'
                                    onInput={(e) => {
                                        if (e.target.value.length > e.target.maxLength)
                                            e.target.value = e.target.value.slice(0, e.target.maxLength);
                                    }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>부서명 {(f && !form.department) && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <input type='text' value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder='부서명을 입력하여 주세요' />
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>직위 {(f && !form.position) && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <input type='text' value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder='직위를 입력하여 주세요' />
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>거래목적 {(f && form.purpose=='default') && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <select name='purpose' value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} style={{ width: '100%' }} required>
                                <option value='default' disabled>거래목적</option>
                                <option value='1'>저축 및 투자</option>
                                <option value='2'>급여 및 생활비</option>
                                <option value='3'>대출원리금 상환 결제</option>
                                <option value='4'>사업상 거래</option>
                                <option value='5'>기타</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className={styles.authTitle}>자금출처 {(f && form.source=='default') && <ValidText valueType={'essential'} />}</div>
                        <div className={styles.selectBox}>
                            <select name='source' value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={{ width: '100%' }} required>
                                <option value='default' disabled>자금출처</option>
                                <option value='1'>근로 및 연금소득</option>
                                <option value='2'>퇴직소득</option>
                                <option value='3'>사업소득</option>
                                <option value='4'>부동산 임대소득</option>
                                <option value='5'>부동산 양도소득</option>
                                <option value='6'>금융소득(이자 및 배당)</option>
                                <option value='7'>상속/증여</option>
                                <option value='8'>일시 재산양도로 인한 소득</option>
                                <option value='9'>기타</option>
                            </select>
                        </div>
                    </div>

                </div>


                <div className={styles.bar}></div>

                <div className={styles.serviceDiv}>
                    <div className={styles.serviceText}>본인은 금융회사 등으로부터 '종합관리 서비스'를<br className={styles.mBr}/> 받고 있습니까?</div>
                    {(f && !radio) && <ValidText valueType={'essential'} />}

                    <div className={styles.radioBtnDiv}>
                        <label><input type='radio' name='service' value='Y' onChange={handleRadio} />예</label>
                        <label><input type='radio' name='service' value='N' onChange={handleRadio} />아니오</label>
                    </div>
                </div>

                <div className={styles.btnDiv}>
                    <div className={styles.cancelBtn} onClick={() => { router.back(); }}>취소</div>
                    <div className={styles.authBtn} onClick={allAuthCheck} style={{ width: '27.5rem' }}>확인</div>
                </div>

            </div>

        </>
    )
}


export const getServerSideProps = async (context) => {

    return {
        props: {},
    };

};  