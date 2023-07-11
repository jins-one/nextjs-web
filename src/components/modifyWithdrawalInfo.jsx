import styles from '@/styles/components/modify_withdrawal_info.module.css';
import styles2 from '@/styles/pages/modify_myinfo.module.css';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import useValid from '@/functions/isValid';
import ValidText from '@/components/isValid';
import AlertDialogNew2 from '@/components/alertDialog';

import defines from '@/defines/defines';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';

import apiFetch2 from '@/functions/apiFetch2'
import { debounce } from 'lodash';

export default function ModifyWithdrawalInfo({ onModal, closeModal, data, ...props }) {
    const modalRef = useRef();


    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();

            if (data) {
                setForm({ ...form, nickname: data.nickname, source: data.source, receiver: data.receiver, address: data.address });
                if (useValid(data.receiver, defines.regex.kranden)) {
                    setIsValid((p) => { return { ...p, receiver: true } });
                }
            }

        } else {
            modalRef.current.close();
        }
    }, [onModal]);


    const [seq, setSeq] = useState(0);

    const [text, setText] = useState('');
    const [img, setImg] = useState('logo');

    const [allStepComplete, setAllStepComplete] = useState(false);
    const [alertModal, setAlertModal] = useState(false);


    const [authNum, setAuthNum] = useState('');
    const [min, setMin] = useState('03');
    const [sec, setSec] = useState('00');
    const time = useRef(180);
    const timerId = useRef(null);

    const [auth, setAuth] = useState(false);

    const [form, setForm] = useState({
        nickname: '',
        source: '1',
        receiver: '',
        address: '',
        phone1: props.phone ? props.phone.split('-')[0] : '',
        phone2: props.phone ? '****' : '',
        phone3: props.phone ? props.phone.split('-')[2] : '',
        num: '',
        mPhone: props.phone ? (props.phone.replace(/-/g, '')) : '',
    });

    const [isValid, setIsValid] = useState({
        nickname: false,
        source: false,
        receiver: false,
        address: false,
        phone: false,
        num: false
    })

    const [f, setF] = useState(false);
    const [f2, setF2] = useState(false);
    const [f3, setF3] = useState(false);

    // 모바일인지 확인
    const [mobile, setMobile] = useState(false);

    // 입력된 전화번호
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    }, []);



    // 인증번호 확인 debounce //
    const [resValue, setResValue] = useState({});
    const fetchUseCallback = useCallback(async (url, obj) => {
        setResValue(await apiFetch2(url, obj));
    });
    const apiDebounce = debounce(fetchUseCallback, 500);

    useEffect(() => {
        if (resValue.hasOwnProperty('success')) {
            if (resValue.success) {
                clearInterval(timerId.current);
                setIsValid({ ...isValid, num: true });
                setText('휴대폰 인증이 완료되었습니다.');
                setImg('logo')
                setAlertModal(true);
                setSeq(1);

            } else {
                if (resValue.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    if (resValue.code == 3001) {
                        setText('인증번호가 유효하지 않습니다.\n인증번호 재발급 후 다시 시도해주세요.');
                    } else if (resValue.code == 3002) {
                        setText('인증번호가 올바르지 않습니다.');
                    } else {
                        setText('오류가 발생했습니다. 다시 시도해 주세요.');
                    }
                    setImg('alert');
                    setAlertModal(true);
                    setIsValid({ ...isValid, num: false });
                }
            }
        }
    }, [resValue]);
    // 인증번호 확인 debounce //

    async function checkPhoneAuth() {
        setF3(true);

        apiDebounce('/api/fetch/check-phone-otp', {
            method: "POST",
            body: JSON.stringify({
                // to,
                type: 'assets',
                authNum: form.num,
            })
        });
    }




    async function modifyAddress() {
        setF(true);

        if (form.nickname && isValid.receiver && form.address && isValid.num) {

            //출금주소 등록 api.. 등록이랑 수정 구분..?
            let api_url = '/api/fetch/wallets';
            let method = data ? 'PUT' : 'POST';  //put: 수정, post: 등록
            let body_data = {
                nickname: form.nickname,
                source: form.source,
                receiver: form.receiver,
                address: form.address,

                // code: form.num
            }
            let result = await apiFetch(api_url, method, body_data);

            if (result.success) {
                setAllStepComplete(form.nickname && isValid.receiver && form.address);
                setText('출금주소가 변경되었습니다.');
                setImg('logo')
                setAlertModal(true);

                props.func(form.nickname);

                props.myDetailCls()
            } else {

            }

        }

    }

    function receiverNameCheck(e) {
        setForm({ ...form, receiver: e.target.value });

        let checkReceiver = useValid(e.target.value, defines.regex.kranden);//true면 성공
        if (checkReceiver) {
            setIsValid((p) => { return { ...p, receiver: true } });
        } else {
            setIsValid((p) => { return { ...p, receiver: false } });
        }
    }

    function initialState() {
        setForm({
            ...form,
            nickname: '',
            source: '1',
            receiver: '',
            address: '',
            num: '',
        });
        setIsValid({
            nickname: false,
            source: false,
            receiver: false,
            address: false,
            num: false,
            phone: false
        })
        setF(false);
        setF2(false);
        setF3(false);
        setAllStepComplete(false);
        setText('');
        setImg('logo');
        setSeq(0);
        setAuth(false);
        setAuthNum('');
    }

    function closeAlert(boolean) {
        if (allStepComplete) {
            setAlertModal(boolean);
            initialState();
            closeModal(false);
        } else {
            setAlertModal(boolean);
        }
    }


    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {

            setAuthNum('');
            clearInterval(timerId.current);
            // dispatch event

            // const to = props.phone.replace(/-/g, '');
            fetch('/api/fetch/delete-phone-otp', {
                method: "POST",
                body: JSON.stringify({
                    // "to": to
                    type: 'assets'
                })
            })
                .then(async (res) => {
                    const sendResult = await res.json();

                    if (sendResult.success) {
                        setText('인증번호가 만료되었습니다. 인증번호를 재발송 해주세요.');
                        setImg('logo');
                        setAlertModal(true);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }


    }, [sec]);

    useEffect(() => {
        return () => clearInterval(timerId.current);
    }, [])



    // 인증번호 보내기 debounce //
    const [resValueAuthnum, setResValueAuthnum] = useState({});
    const fetchUseCallbackAuthnum = useCallback(async (url, obj) => {
        setResValueAuthnum(await apiFetch2(url, obj));
    });
    const apiDebounceAuthnum = debounce(fetchUseCallbackAuthnum, 500);

    useEffect(() => {
        if (resValueAuthnum.hasOwnProperty('success')) {
            if (resValueAuthnum.success) {
                setText('입력하신 휴대번호로 인증번호가 발송되었습니다.\n인증번호 6자리를 입력해 주세요');
                setImg('logo');
                setAlertModal(true);

                return () => clearInterval(timerId.current);
            } else {
                if (resValueAuthnum.code == 1001) {
                    alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                    router.push('/');
                } else {
                    setText('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                    setImg('alert');
                    setAlertModal(true);
                    if (!alertModal) {
                        history.push('/~');
                    }
                }
            }
        }
    }, [resValueAuthnum]);
    // 인증번호 보내기 debounce //


    /**
     * 인증번호 보내기
     * @returns 
     */
    async function authNumSend() {
        setF(true);

        // let phone_result;

        // if (mobile) {
        //     phone_result = useValid(form.mPhone, defines.regex.phone);
        // } else {
        //     phone_result = useValid(form.phone1 + form.phone2 + form.phone3, defines.regex.phone);
        // }

        // if (phone_result) { //휴대폰 번호가 올바르다면 인증번호 보내기
        // setIsValid({ ...isValid, phone: phone_result });
        setAuth(true);

        clearInterval(timerId.current);
        setForm({ ...form, num: '' });
        setMin('03');
        setSec('00');
        time.current = 180;

        timerId.current = setInterval(() => {
            time.current -= 1;

            setMin('0' + String(parseInt(time.current / 60)));
            let seconds = time.current % 60;
            if (seconds < 10) {
                setSec('0' + String(seconds));
            } else {
                setSec(String(seconds));
            }

        }, 1000);

        // const to = props.phone.replace(/-/g, '');
        apiDebounceAuthnum('/api/fetch/authnum-send', {
            method: "POST",
            body: JSON.stringify({
                // "to" : to
                type: 'assets'
            })
        })
        // } else {
        //     setIsValid({ ...isValid, phone: phone_result });
        // }
    }


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={text} />


            <dialog ref={modalRef} className={styles.modal} onCancel={() => { closeModal(false); initialState(); }}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { closeModal(false); initialState(); }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>


                <div className={styles.dialogContainer}>

                    <div className={styles.titleBox}>
                        <h1 className={styles.title}>출금정보 변경</h1>
                        <div className={styles.subTitle}>
                            {
                                seq == 0 ? '휴대폰 인증이 필요합니다.' : '등록할 출금지갑의 정보를 입력하세요.'
                            }
                        </div>
                    </div>

                    <div className={styles.contentsBox}>

                        {
                            seq == 0 ?
                                <>
                                    <div className={styles2.modiInputDiv} style={{ marginTop: '0' }}>
                                        <div className={styles2.inputLabel}>휴대폰번호  {(f2 && !isValid.phone) && <ValidText valueType={'phone'} />}</div>
                                        <div className={styles2.selectBox}>
                                            {/* <select className={styles2.telecom} name='telecom' value={form.telecom} onChange={(e) => setForm({ ...form, telecom: e.target.value })} style={{ width: '7.5rem' }} disabled={!isValid.phone ? false : true}>
                                                <option value='skt'>SKT</option>
                                                <option value='kt'>KT</option>
                                                <option value='u'>U+</option>
                                            </select> */}

                                            <div className={styles2.phoneAuthDiv}>
                                                <div className={styles2.wBr}>
                                                    <input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} style={{ width: '5rem', paddingInline: '0', textAlign: 'center' }} type='text'
                                                        disabled />
                                                    <span className={styles2.wBr}>&nbsp;―&nbsp;</span>
                                                    <input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} style={{ width: '6.25rem', paddingInline: '0', textAlign: 'center' }} type='text'
                                                        disabled />
                                                    <span className={styles2.wBr}>&nbsp;―&nbsp;</span>
                                                    <input value={form.phone3} onChange={(e) => setForm({ ...form, phone3: e.target.value })} style={{ width: '6.25rem', paddingInline: '0', textAlign: 'center' }} type='text'
                                                        disabled />
                                                </div>
                                                <div className={styles2.mBr} style={{ marginRight: '1rem' }}>
                                                    <input value={form.mPhone} onChange={(e) => setForm({ ...form, mPhone: e.target.value })} style={{ width: '13rem', paddingInline: '1.5rem', textAlign: 'left' }} type='text'
                                                        disabled />
                                                </div>
                                                {
                                                    !isValid.num ? <div className={`${styles2.phone} ${styles2.authBtn}`} style={{ width: '16.2rem' }} onClick={debounce(authNumSend, 500)}>{auth ? '재전송' : '인증번호 전송'}</div>
                                                        :
                                                        <div className={styles2.authDoneBtn} style={{ width: mobile ? '6rem' : '16.2rem' }} >인증완료</div>
                                                }
                                            </div>
                                        </div>

                                    </div>

                                    <div className={styles2.modiInputDiv} style={{ marginTop: mobile ? '0.688rem' : '2.875rem' }}>
                                        <div className={styles2.inputLabel}>인증번호 {(f3 && !isValid.num) && <ValidText valueType={'num'} />}</div>
                                        <div className={`inputAuthNumber ${styles2.selectBox}`} style={{ position: 'relative' }}>
                                            <input value={form.num} onChange={(e) => setForm({ ...form, num: e.target.value })} style={{ width: '100%', paddingInline: '1.5rem' }} maxLength={6} placeholder='인증번호 6자리를 입력해주세요' type='number'
                                                disabled={auth ? false : true}
                                                onInput={(e) => {
                                                    if (e.target.value.length > e.target.maxLength)
                                                        e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                }} />
                                            {
                                                auth && <div style={{ width: 'fit-content', position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }} >{min} : {sec}</div>
                                            }

                                        </div>

                                        <div className={styles2.alertDiv}>
                                            <div>
                                                <Image src={imagePack.component.iconAlertPurple} alt='iconAlertPurple' style={{ marginRight: '0.75rem' }} />
                                                <span style={{ fontSize: '1rem', fontWeight: '400', color: '#808080' }}>인증번호가 오지 않았나요?</span>
                                            </div>
                                            <div>
                                                <div style={{ width: '2.25rem' }} />
                                                <span style={{ marginTop: '0.625rem', fontSize: '1rem', color: '#b2b2b2' }}>
                                                    02-3454-0136 번호가 스팸 문자로 등록되어있는 것은 아닌지 확인해주세요. <br className={styles2.wBr} /> 스팸문자로 등록되어있지 않다면, 다시한번 '인증번호 전송'을 눌러주세요.</span>
                                            </div>
                                        </div>
                                    </div>
                                </>

                                : (
                                    <div className={styles.inputDiv}>
                                        <div className={styles.modiInputDiv}>
                                            <div className={styles.inputLabel} style={{ marginTop: '0' }}>출금 주소 별명 {(f && !form.nickname) && <ValidText valueType={'essential'} />}</div>
                                            <input type='text' value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder='사용하실 출금 주소의 별명을 입력하세요.' />
                                        </div>

                                        <div className={styles.modiInputDiv}>
                                            <div className={styles.inputLabel} style={{ marginBottom: '0.375rem' }}>지갑 주소 출처 </div>
                                            <div className={styles.walletDesc}>
                                                {/* *VASP인증 취득 거래소 또는 개인만 선택 및 등록가능하며 <span>거래소 지갑을 개인적으로 선택 후 등록 시 상대 거래소에서 입금처리가 불가할 수 있습니다.</span> */}
                                                *VASP인증 취득 거래소 또는 개인만 선택 및 등록가능하며 거래소 지갑을 개인적으로 선택 후 등록 시 상대 거래소에서 입금처리가 불가할 수 있습니다.
                                            </div>
                                            <select name='source' value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ width: '30rem' }}>
                                                <option value='1'>개인</option>
                                                <option value='2'>Aprobit</option>
                                                <option value='3'>Basic Finance</option>
                                                <option value='4'>Beeblock</option>
                                                <option value='5'>bithumb</option>
                                            </select>
                                        </div>

                                        <div className={styles.modiInputDiv}>
                                            <div className={styles.inputLabel}>수취인명  {(f && !isValid.receiver) && <ValidText valueType={'nochar'} />}</div>
                                            <input type='text' value={form.receiver} onChange={receiverNameCheck} placeholder='한글 또는 영문입력(숫자, 특수문자 입력불가)' />
                                        </div>

                                        <div className={styles.modiInputDiv}>
                                            <div className={styles.inputLabel}>지갑주소 {(f && !form.address) && <ValidText valueType={'waddress'} />}</div>

                                            <input type='text' value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder='지갑 주소를 입력하세요' />
                                            <div className={styles.addressInputWarning} style={{ fontSize: '0.875rem', fontWeight: '500', color: '#808080', lineHeight: '1.2', marginTop: '0.75rem' }}>*지갑 주소 오입력시 책임은 본인에게 있습니다.</div>
                                        </div>
                                    </div>
                                )
                        }


                        <div className={styles.btnDiv}>
                            <div className={styles.cancelBtn} onClick={() => {
                                initialState();
                                closeModal(false);
                            }}>취소</div>
                            {
                                seq == 0 ? <div className={styles.authBtn} onClick={checkPhoneAuth} style={{ width: '27.5rem' }}>확인</div>
                                    :
                                    <div className={styles.authBtn} onClick={modifyAddress} style={{ width: '27.5rem' }}>확인</div>
                            }
                        </div>
                    </div>
                </div>
            </dialog>
        </>
    )
}

