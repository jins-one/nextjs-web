import Image from 'next/image';
import styles from '@/styles/components/assets_widthdraw.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';
import AlertDialogNew2 from './alertDialog';
import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/router';
import numberFormat from '@/functions/numberFormat';
import PasswordPresentor from '@/functions/password-presentor';
import ValidText from './isValid';
import apiFetch from '@/functions/apiFetch';
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';
import { debounce } from 'lodash';


const ETH_TEXT = 'ETH';

const successText = '출금 신청이 완료 되었습니다.\n승인까지 1~3일 소요 될 수 있습니다.';
const waitText = '출금 신청이 진행중입니다.\n창을 종료하지 마시고 유지하여 주시기 바랍니다.';

export const AssetsWidthdrawModal = ({ session, onModal, closeModal, ...props }) => {
    const modalRef = useRef();
    const router = useRouter();

    const inputRef = useRef([]);


    //왼쪽 input 창
    const srcInput = useRef();

    // 휴대폰 인증번호 input
    const phoneCodeInput = useRef();


    //email code err text를 띄울 때 사용
    const [emailCodeErr, setEmailCodeErr] = useState(false);
    //otp code err text를 띄울 때 사용
    const [otpCodeErr, setOtpCodeErr] = useState(false);

    //출금 주소 등록을 권유하는 모달
    const [alertModal, setAlertModal] = useState(false);

    const [txt, setTxt] = useState('');
    const [img, setImg] = useState('logo');
    const [onBtn, setOnBtn] = useState(false);


    //api가 성공하면 true
    const [phoneSuccess, setPhoneSuccess] = useState(false);
    const [passwdSuccess, setPasswdSuccess] = useState(false);

    const [sendBtnPush, setSendBtnPush] = useState(false);

    // 출금가능수량
    const maxEth = 10000;
    // 현재 입력된값
    const [srcInputValue, setSrcInputValue] = useState(0);


    const passwordPresentor = new PasswordPresentor(); // 인스턴스 생성
    const [seq, setSeq] = useState(0);
    const [form, setForm] = useState({
        value1: '',
        value2: '',
        value3: '',
        value4: '',
        value5: '',
        value6: '',
        value7: '',
        value8: '',
    });

    // input onChange
    const handleInputChange = (e) => {
        passwordPresentor.handleInputChange(e, form, setForm);
    };

    // value 입력 시, 다음 Index로 focus 이동
    const handleNextFocus = () => {
        passwordPresentor.handleNextFocus(inputRef);
    };

    // value 삭제
    const handleDeleteEvent = (e) => {
        passwordPresentor.handleDeleteEvent(e, inputRef, form, setForm);
    };

    // 랜덤한 value 클릭 시, 비어있는 index에 focus 지정
    const emptyIndexFocus = () => {
        passwordPresentor.emptyIndexFocus(inputRef);
    };

    useEffect(() => {
        if (phoneSuccess) {
            inputRef.current[0].focus(); // 마운트 > 첫 번째 value에 focus
            handleNextFocus(); // 각각의 value에 값을 입력 시, 다음 value 로 focus 이동
        }
    }, [form]); // dependency 에 form 를 넣음으로써, form의 값이 변경될 때마다 리렌더링
    useEffect(() => { }, [seq]);



    const [num, setNum] = useState('');
    const [min, setMin] = useState('03');
    const [sec, setSec] = useState('00');
    const time = useRef(180);
    const timerId = useRef(null);

    const [auth, setAuth] = useState(false);
    const [phoneCheck, setPhoneCheck] = useState(false);
    const [f, setF] = useState(false);
    const [pwValid, setPWValid] = useState(false);

    const [walletInfo, setWalletInfo] = useState({});

    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
            document.querySelector('body').classList.add('scrollLock');

            //지갑정보 조회 api
            async function walletInfo() {
                let api_url = '/api/fetch/wallets';
                let obj = {
                    method: 'GET',
                }
                let result = await apiFetch2(api_url, obj, session);

                if (result.success) {
                    setWalletInfo(result.data);
                } else if (result.redirect) {
                    closeModal(false)
                    const data = await apiFetch2(configs.frontUrl + '/api/logout', { method: 'POST' }, session);
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
            walletInfo();

        } else {
            modalRef.current.close();
            document.querySelector('body').classList.remove('scrollLock');
        }
    }, [onModal]);

    useEffect(() => {
        window.modalClose = () => {
            closeModal(false)
        }

        return (() => { delete window.modalClose })
    }, [])


    function transValue(e) {
        let value = e.target.value;
        let formatValue = numberFormat(value, false, true, true, 4);
        srcInput.current.value = formatValue;

        let idx = formatValue.indexOf('.');
        let num = formatValue;

        if (idx < 0) { //정수
            num = num.replace(/[,]/g, '');
        } else if (idx > 0) { //소수점 포함
            let integer = formatValue.substr(0, formatValue.indexOf('.')) //정수
            let tmpStr = formatValue.substr(formatValue.indexOf('.') + 1); //소수점

            num = integer.replace(/[,]/g, '') + '.' + tmpStr;
        } else if (idx == 0) {

        }

        setSrcInputValue(Number(num));
    }


    function closeAlert(boolean, go) {
        setAlertModal(boolean);
        setOnBtn(false);

        if (go) {
            closeModal(false);
            closeRefresh2();
            if (phoneSuccess) {
                if (props.account) {
                    router.push('/mypage/modinfo/withdrawal')
                } else {
                    router.push('/mypage/modinfo/withdrawal-regist');
                }
            } else {
                router.push('/mypage');
            }
        }

        if (phoneSuccess && passwdSuccess) {
            closeModal(false);
            closeRefresh2();
        }
    }

    //휴대폰 인증 완료 시 초기화
    function closeRefresh() {
        srcInput.current.value = '';
        phoneCodeInput.current.value = '';
        srcCloseButtonRef.current.style.opacity = 0;
    }

    //모달 닫기
    function closeRefresh2() {
        if (!phoneSuccess) {
            srcInput.current.value = '';
            phoneCodeInput.current.value = '';
            srcCloseButtonRef.current.style.opacity = 0;
        }

        setPhoneSuccess(false);
        setPasswdSuccess(false);

        setSendBtnPush(false);
        setEmailCodeErr(false);
        setOtpCodeErr(false);

        setSrcInputValue(0);
        setNum('');
        setAuth(false);
        setPhoneCheck(false);
        setSeq(0);
        setForm({
            value1: '',
            value2: '',
            value3: '',
            value4: '',
            value5: '',
            value6: '',
            value7: '',
            value8: ''
        })
        setF(false);
    }


    const srcCloseButtonRef = useRef(null);
    const [srcUnitColor, setSrcUnitColor] = useState('var(--textColorGray1)');
    const changeSrcInput = () => {
        if (srcInput && srcInput.current) {
            if (srcInput.current.value !== '') {
                srcCloseButtonRef.current.style.opacity = 1;
                srcCloseButtonRef.current.style.cursor = 'pointer';
                setSrcUnitColor('var(--textColor1)');
            } else {
                srcCloseButtonRef.current.style.opacity = 0;
                setSrcUnitColor('var(--textColorGray1)');
            }
            // setSrcInputValue(srcInput.current.value);
        }
    }

    const clickSrcInputCloseButton = () => {
        if (srcInput && srcInput.current) {
            srcInput.current.value = '';
            setSrcInputValue(0);
            // dstntInput.current.value = '';
            changeSrcInput();
        }
    }

    /**
     * 확인 버튼 클릭 (인증번호 확인)
     */
    async function phoneAuthDone() {
        let test
        if (!phoneCheck) {
            test = await checkPhoneOTP();
        }

        if (srcInputValue && test && srcInputValue <= props.balance) {
            closeRefresh();
            setPhoneSuccess(true);

            // if (!walletInfo.passwd) {
            //     setTxt('출금 비밀번호를 등록해주세요.\n페이지를 이동하시겠습니까?');
            //     setImg('alert');
            //     setOnBtn(true);
            //     setAlertModal(true);
            // }

        } else {
            if (!auth) {
                setTxt('휴대폰 인증을 완료해주세요.');
                setImg('alert');
                setAlertModal(true);
            } else {
                if (!phoneCheck) {

                    setTxt('인증번호가 올바르지 않습니다.');
                    setImg('alert');
                    setAlertModal(true);
                }
            }

            if (!srcInputValue) {
                setTxt('출금하려는 금액을 입력해주세요.');
                setImg('alert');
                setAlertModal(true);
            }


            if (srcInputValue > props.balance) {
                setTxt('출금 가능한 금액이 아닙니다.');
                setImg('alert');
                setAlertModal(true);
            }
        }
    }

    async function checkPhoneOTP() {

        const result = await fetch('/api/fetch/check-phone-otp', {
            method: "POST",
            body: JSON.stringify({
                type: 'assets',
                authNum: phoneCodeInput.current.value,
            })
        });

        const rJson = await result.json();

        //인증번호 확인
        if (rJson.success) {
            clearInterval(timerId.current);
            setPhoneCheck(true);
            return true;

        } else {
            setPhoneCheck(false);
            return false;
        }
    }


    //출금 비밀번호 확인
    async function assetsWithdrawlDone() {
        setF(true);

        let w_pw = form.value1.toString() + form.value2.toString() + form.value3.toString() + form.value4.toString() + form.value5.toString() + form.value6.toString() + form.value7.toString() + form.value8.toString();

        if (props.account && w_pw == props.account) {

            //출금신청 api
            let api_url = '/api/fetch/eth-withdrawal';
            let result = await apiFetch2(api_url, {method:'POST'});

            if (result.success) {
                setPWValid(true);
                setTxt(successText);
                setImg('logo');
                setAlertModal(true);
                setPasswdSuccess(true);
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

        } else {
            setPWValid(false);
        }
    }


    function goChangeAccount() {
        setTxt('확인 버튼 클릭 시 페이지가 이동됩니다.\n이동하시겠습니까?');
        setImg('alert');
        setOnBtn(true);
        setAlertModal(true);
    }

    function inputFocus(ref = {}) {
        ref.current.focus()
    }




    useEffect(() => {
        // 만약 타임 아웃이 발생했을 경우
        if (time.current <= 0) {

            setNum('');
            clearInterval(timerId.current);

            fetch('/api/fetch/delete-phone-otp', {
                method: "POST",
                body: JSON.stringify({
                    type: 'assets'
                })
            })
                .then(async (res) => {
                    const sendResult = await res.json();

                    if (sendResult.success) {
                        setTxt('인증번호가 만료되었습니다. 인증번호를 재발송 해주세요.');
                        setImg('alert');
                        setAlertModal(true);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
    }, [sec]);

    useEffect(() => {
        return () => {
            clearInterval(timerId.current);
            delete window.modalClose;
        }
    }, [])


    /**
     * 인증번호 보내기
     * @returns 
     */
    async function authNumberSend() {
        setSendBtnPush(true);

        setAuth(true);

        clearInterval(timerId.current);
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


        await fetch('/api/fetch/authnum-send', {
            method: "POST",
            body: JSON.stringify({
                type: 'assets'
            })
        })
            .then(async (res) => {
                // console.log(res);
                const sendResult = await res.json();
                if (sendResult.success) {
                    setTxt('가입된 휴대폰 번호로 인증번호가\n발송되었습니다.');
                    setImg('logo');
                    setAlertModal(true);

                    return () => clearInterval(timerId.current);
                } else {
                    if (resValueAuthnum.code == 1001) {
                        alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.');
                        router.push('/')
                    } else {
                        setTxt('오류가 발생했습니다. 잠시후 다시 시도해주세요.');
                        setImg('alert')
                        setAlertModal(true);
                        if (!alertModal) {
                            history.push('/~');
                        }
                    }

                }
            })
            .catch(err => {
                // console.log(err);
            })



        return () => clearInterval(timerId.current);
    }





    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} img={img} text={txt} parentComplete={phoneSuccess && passwdSuccess} onBtn={onBtn} />
            <dialog ref={modalRef} className={styles.modal} onCancel={() => { setAlertModal(false); closeModal(false); closeRefresh2(); }}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { closeModal(false); closeRefresh2(); }} style={{ cursor: 'pointer' }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>

                <div className={styles.dialogContainer}>

                    <div className={styles.contentsBox}>

                        <div className={styles.titleBox}>
                            <h1 className={styles.title}>출금신청</h1>
                        </div>

                        <div>
                            {
                                !phoneSuccess ? (
                                    <>
                                        {/* 지갑 box */}
                                        <div className={styles.walletAccountDiv}>
                                            <div className={styles.walletText}>
                                                등록된 지갑
                                            </div>
                                            <div className={styles.walletDesc}>
                                                <div>{'walletInfo.nickname'}</div>
                                                <div>{'walletInfo.withdrawal_eth_addr'}</div>
                                                <div className={styles.pf}>
                                                    <span className={styles.infoText}>출금 가능 수량 : {Number(props.balance).toLocaleString('ko-kr')} ETH</span>
                                                </div>
                                            </div>

                                        </div>
                                        {/* 지갑 box end */}

                                        <div className={`${styles.completeBtns} ${styles.mt12} ${styles.wBr}`}>
                                            <div className={styles.completeInfo}>
                                                출금지갑을 변경하고 싶으신가요?<div className={`${styles.pf} `} style={{ cursor: 'pointer' }} onClick={() => goChangeAccount()}>출금지갑변경</div>
                                            </div>
                                        </div>


                                        {/* 출금 신청 수량 입력 input box start */}
                                        <div className={`${styles.inputsArea} ${styles.mt50}`}>
                                            <div>
                                                {/* radio check box start */}
                                                <div className={styles.radioBoxFlex}>
                                                    <div className={styles.boxTitle}>출금하실 금액</div>
                                                    {
                                                        srcInputValue <= props.balance ?
                                                            (<></>) :
                                                            (<span className={`${styles.infoText} ${styles.warn}`}>*출금가능금액이 아닙니다.</span>)
                                                    }
                                                </div>
                                                {/* radio check box end */}

                                                {/* input start */}
                                                <div className={`${styles.priceInputBox} ${styles.mt12} ${srcInputValue <= props.balance ? '' : styles.warn}`} onClick={() => inputFocus(srcInput)}>
                                                    <div className={styles.priceInnerBox} >
                                                        <input ref={srcInput} type={'text'} onChange={(e) => { transValue(e); changeSrcInput(); }} placeholder='0' />
                                                        <span style={{ color: srcUnitColor }} >{ETH_TEXT}</span>
                                                    </div>

                                                    <Image ref={srcCloseButtonRef} onClick={clickSrcInputCloseButton} className={styles.closeButton} src={imagePack.component.iconCloseButton} alt='iconCloseButton' />

                                                </div>
                                                {/* input end */}
                                            </div>

                                            <div>

                                            </div>
                                        </div>
                                        {/* 출금 신청 수량 입력 input box end */}

                                        <div className={`${styles.priceInputOtherText} ${styles.mt12}`}>
                                            <p className={styles.pf}>
                                                {/* <span className={styles.infoText}>출금 가능 수량 : {Number(maxEth).toLocaleString('ko-kr')} ETH</span> */}
                                                예상 출금 수수료 : <span style={{ marginLeft: '0.25rem' }}>{0} ETH</span>
                                            </p>
                                            <p className={`${styles.gr} ${styles.mt6}`}>
                                                *출금 수수료는 실제 트랜젝션이 발생되는 시점의 네트워크 상황에 따라 변동 될 수 있습니다.
                                            </p>
                                        </div>

                                        {/* 휴대폰번호 인증 start */}
                                        <div className={`${styles.product} ${styles.mt46}`}>
                                            <p className={styles.boxTitle}>휴대폰번호 인증</p>
                                            {sendBtnPush && emailCodeErr ? <p className={styles.warringText}>*휴대폰번호 인증번호를 다시 확인하여 주시기 바랍니다.</p> : <></>}
                                        </div>

                                        <div className={`inputAuthNumber ${styles.emailContainer} ${styles.mt12}`}>
                                            <div style={{ position: 'relative', width: 'fit-contents', height: 'fit-contents' }}>
                                                <input ref={phoneCodeInput} className={styles.emailInput} maxLength={6} placeholder='인증번호 6자리를 입력해주세요' type='number'
                                                    disabled={!auth ? true : (phoneCheck ? true : false)}
                                                    onInput={(e) => {
                                                        if (e.target.value.length > e.target.maxLength)
                                                            e.target.value = e.target.value.slice(0, e.target.maxLength);
                                                    }} />
                                                {
                                                    sendBtnPush && <div style={{ width: 'fit-content', position: 'absolute', right: '1.5rem', top: '0.75rem' }} >{min} : {sec}</div>
                                                }
                                            </div>

                                            {
                                                phoneCheck ? (
                                                    <button className={styles.emailSendDone}>
                                                        인증완료
                                                    </button>
                                                ) : (
                                                    <button className={styles.emailSend} onClick={debounce(authNumberSend, 500) } >
                                                        {sendBtnPush ? '재전송' : '인증번호 전송'}
                                                    </button>
                                                )
                                            }


                                            <div className={styles.guideText}>
                                                <h1 className={styles.title}>인증번호가 오지 않았나요?</h1>
                                                <p className={styles.content}>
                                                    02-3454-0136 번호가 스팸 문자로 등록되어 있는 것은 아닌지 확인해 주세요.<br className={styles.wBr} /> 스팸 문자로 등록되어 있지 않다면, 다시 한 번 '재전송'버튼을 눌러주세요.
                                                </p>
                                            </div>

                                        </div>

                                        {/* 휴대폰번호 인증 end */}

                                        <div className={`${styles.buttonBox} ${styles.mt50}`}>
                                            <div className={styles.close} onClick={() => { closeModal(false); closeRefresh2(); }}>취소</div>
                                            <div className={styles.done} onClick={debounce(phoneAuthDone,500) }>확인</div>
                                        </div>

                                    </>
                                ) : (
                                    <>
                                        <div className={styles.withdrawalBox}>
                                            <div>
                                                출금하실 수량
                                            </div>
                                            <div>
                                                <div className={styles.amount}>
                                                    {numberFormat(srcInputValue.toString(), false, true, true)}
                                                </div>
                                                <div className={styles.withdrawalWarningDesc}>
                                                    *<span className={styles.wBr}>*</span>출금 수수료는 실제 트랜젝션이 발생되는 시점의 네트워크 상황에 따라 변동 될 수 있습니다.
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`${styles.wPassword} ${styles.mt46}`}>
                                            <div className={styles.boxTitle}>출금 비밀번호 {(f && !pwValid) && <ValidText valueType={'pw'} />}</div>
                                            <div>
                                                <div className={styles.secureInput}>

                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value1}
                                                        name="value1"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[0] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value2}
                                                        name="value2"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[1] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value3}
                                                        name="value3"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[2] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value4}
                                                        name="value4"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[3] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value5}
                                                        name="value5"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[4] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value6}
                                                        name="value6"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[5] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value7}
                                                        name="value7"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[6] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                    <input
                                                        type="password"
                                                        placeholder='*'
                                                        value={form.value8}
                                                        name="value8"
                                                        pattern="\d*"
                                                        inputMode="numeric"
                                                        ref={(el) => (inputRef.current[7] = el)}
                                                        onClick={emptyIndexFocus}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleDeleteEvent}
                                                    />
                                                </div>
                                            </div>

                                            <div className={styles.wPwRemember}>
                                                <span>출금비밀번호를 잊으셨나요?</span>
                                                <span onClick={() => goChangeAccount()}>
                                                    비밀번호 등록/변경하기 <Image src={imagePack.component.iconRightPurple} alt='iconRightPurple' className={styles.wBr} />
                                                </span>
                                            </div>

                                            <div className={`${styles.buttonBox} ${styles.mt50}`}>
                                                <div className={styles.close} onClick={() => { closeModal(false); closeRefresh2(); }}>취소</div>
                                                <div className={styles.done} onClick={() => { debounce(assetsWithdrawlDone, 500) }}>확인</div>
                                            </div>

                                        </div>
                                    </>
                                )
                            }

                        </div>



                    </div>


                </div>



            </dialog>

        </>
    );
}