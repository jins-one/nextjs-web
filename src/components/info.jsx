import styles from '@/styles/pages/modify_myinfo.module.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

import imagePack from '@/styles/image-module';
import defines from '@/defines/defines';
import ValidText from '@/components/isValid';

import AlertDialogNew2 from './alertDialog';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';

import { debounce } from 'lodash';

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

    const [f, setF] = useState(false);

    const [alertModal, setAlertModal] = useState(false);
    const [text, setText] = useState('');
    const [allStepComplete, setAllStepComplete] = useState(false);


    const [radio, setRadio] = useState('');
    const [form, setForm] = useState({
        home: '',
        home_detail: '',
        home_zcode: '',

        c_name: '',
        c_address: '',
        c_address_detail: '',
        c_zcode: '',
        c_num1: '',
        c_num2: '',
        c_num3: '',
        department: '',
        position: '',
        purpose: 'default',
        source: 'default',

        detail: '',
    })



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

    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async(url, obj, email)=>{
        setResValue(await apiFetch2(url, obj, email));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(()=>{
        if(resValue.hasOwnProperty('success')){
            if (resValue.success) {
                setAllStepComplete(true);
                setText('필수정보 입력이 완료되었습니다.');
                setAlertModal(true);

            } else if (resValue.redirect) {
                const data = async ()=>{ return await apiFetch2(configs.frontUrl +'/api/logout', { method: 'POST' }, props.email); }
                if (data.ok) {
                    router.push('/login?session=no');
                }
            } else if (resValue.code == 1001) {
                alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.')
                router.push('/')
            } else {
                alert('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
            }
        }
    },[resValue]);

    /**
     * 정보 수정
     */
    async function modifyInfo() {

        setF(true);
        if (form.home && form.home_zcode && form.c_address && form.c_zcode && form.c_num1 && form.c_num2 && form.c_num3
            && form.department && form.position && form.purpose !== 'default' && form.source !== 'default' && form.detail && radio) {

            //정보 저장
            let api_url =  '/api/fetch/certs';
            let obj = {
                method: 'POST',
                body: JSON.stringify({
                    kind: 'kyc',
                    home_address: `(${form.home_zcode}) ${form.home}, ${form.home_detail}`,
                    work_address: `(${form.c_zcode}) ${form.c_address}, ${form.c_address_detail}`,
                    work_phone_num: `${form.c_num1}-${form.c_num2}-${form.c_num3}`,
                    work_department_name: form.department,
                    work_position: form.position,
                    work_info: form.detail,
                    transaction_purpose: form.purpose,
                    funds_source: form.source,
                    management_service: radio == 'Y' ? 1 : 0
                })
            }
            apiDebounce(api_url, obj, props.email);

            


        }
    }

    function cancelModifyInfo() {
        router.back();
    }

    function closeAlert(boolean) {
        setAlertModal(boolean);

        if (allStepComplete) {
            props.func(4);
            props.setDone(true);
        }
    }

    function companyNumberOnInput(e) {
        e.target.value = e.target.value.replace(/[e\+\-]/gi, "");
        if (e.target.value.length > e.target.maxLength) e.target.value = e.target.value.slice(0, e.target.maxLength);
    }

    function blockSpecialChar(e) {
        e.target.value = e.target.value.replace(defines.regex.def_nochar, "");
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={'logo'} text={text} />

            <section className={styles.section}>
                <div className={styles.modifyContainer} style={{ paddingTop: '5rem', marginTop: '1.5rem' }}>



                    <div className={styles.infoDiv} id='target' style={{ marginTop: '0' }}>

                        <div>
                            <div className={styles.authTitle}>자택정보</div>
                            <div className={styles.infoBox}>
                                <div>
                                    <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                        자택주소
                                    </div>
                                    <div className={styles.infoBoxCont} status={'true'}>

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

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modiEssentialInfo} >
                            <div className={styles.authTitle}>직장정보</div>
                            <div className={styles.infoBox}>
                                <div style={{ borderBottom: '2px solid #f6f7f9' }}>
                                    <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                        직장주소
                                    </div>
                                    <div className={styles.infoBoxCont} status={'true'}>

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


                                    </div>
                                </div>
                                <div >
                                    <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                            직장 번호
                                        </div>
                                        <div className={styles.infoBoxCont} status={'true'}>

                                            <div className={styles.addressModi} type='phone'>
                                                <input value={form.c_num1} onChange={(e) => setForm({ ...form, c_num1: e.target.value })} style={{ width: '4rem', padding: '0', textAlign: 'center', border: (f && !form.c_num1) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}
                                                    maxLength={3} type='number' onInput={companyNumberOnInput} />
                                                <span>―</span>
                                                <input value={form.c_num2} onChange={(e) => setForm({ ...form, c_num2: e.target.value })} style={{ width: '4rem', padding: '0', textAlign: 'center', border: (f && !form.c_num2) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}
                                                    maxLength={4} type='number' onInput={companyNumberOnInput} />
                                                <span>―</span>
                                                <input value={form.c_num3} onChange={(e) => setForm({ ...form, c_num3: e.target.value })} style={{ width: '4rem', padding: '0', textAlign: 'center', border: (f && !form.c_num3) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}
                                                    maxLength={4} type='number' onInput={companyNumberOnInput} />
                                            </div>

                                        </div>
                                    </div>
                                    <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                            부서명
                                        </div>
                                        <div className={styles.infoBoxCont} status={'true'}>

                                            <div className={styles.addressModi}>
                                                <div className={styles.inputBox} style={{ width: '15.625rem', border: (f && !form.department) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                    <input type='text' value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} onInput={blockSpecialChar} />
                                                    {form.department && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, department: '' })} />}
                                                </div>

                                            </div>

                                        </div>
                                    </div>

                                </div>
                                <div>
                                    <div className={styles.bothLine} style={{ borderBottom: '2px solid #f6f7f9' }}>
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                            직위
                                        </div>
                                        <div className={styles.infoBoxCont} status={'true'}>

                                            <div className={styles.addressModi}>
                                                <div className={styles.inputBox} style={{ width: '15.625rem', border: (f && !form.position) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                    <input type='text' value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} onInput={blockSpecialChar} />
                                                    {form.position && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, position: '' })} />}
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                    <div className={styles.bothLine} >
                                        <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                            상세
                                        </div>
                                        <div className={styles.infoBoxCont} status={'true'}>

                                            <div className={styles.addressModi}>
                                                <div className={styles.inputBox} style={{ width: '15.625rem', border: (f && !form.detail) ? '2px solid #FF0000' : '1px solid #B2B2B2' }}>
                                                    <input type='text' value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} onInput={blockSpecialChar} />
                                                    {form.detail && <Image src={imagePack.component.iconCloseButton} alt='iconCloseButton' onClick={() => setForm({ ...form, detail: '' })} />}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modiEssentialInfo}>
                            <div className={styles.authTitle}>거래목적 및 자금출처</div>
                            <div className={styles.infoBox}>
                                <div style={{ borderBottom: '1px solid #f6f7f9' }}>
                                    <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                        거래목적
                                    </div>
                                    <div className={styles.infoBoxCont} status={'true'}>

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


                                    </div>

                                </div>

                                <div>
                                    <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                        자금출처
                                    </div>
                                    <div className={styles.infoBoxCont} status={'true'}>

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


                                    </div>

                                </div>

                                <div style={{ borderTop: '1px solid #808080' }}>
                                    <div className={styles.infoBoxTitle} style={{ paddingBlock: '1rem' }}>
                                        종합관리 서비스 유/무
                                    </div>
                                    <div className={styles.infoBoxCont} style={{ paddingBlock: '1rem' }}>
                                        <div className={styles.serviceDiv}>
                                            <div className={styles.serviceText}>본인은 금융회사 등으로부터 '종합관리 서비스'를 받고 있습니까?</div>
                                            {(f && !radio) && <ValidText valueType={'essential'} />}
                                            <div className={styles.radioBtnDiv2}>
                                                <label><input type='radio' name='service' value='Y' onChange={handleRadio2} checked={radio == 'Y'} />예</label>
                                                <label><input type='radio' name='service' value='N' onChange={handleRadio2} checked={radio == 'N'} />아니오</label>
                                            </div>
                                        </div>
                                    </div>

                                </div>


                            </div>


                            <div className={styles.appBtnDiv}>
                                <div className={styles.cancelBtn} style={{ width: '13.75rem' }} onClick={() => cancelModifyInfo()}>취소</div>
                                <div className={styles.okBtn} onClick={() => modifyInfo()}>확인</div>
                            </div>


                        </div>

                    </div>


                </div>
            </section>

        </>
    )
}
