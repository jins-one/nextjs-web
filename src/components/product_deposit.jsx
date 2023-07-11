import Image from 'next/image';
import styles from '@/styles/components/product_deposit.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';
import AlertDialogNew2 from './alertDialog';
import ValidText from "@/components/isValid";
import { useEffect, useRef, useState } from "react";
import defines from '@/defines/defines';

import numberFormat from '@/functions/numberFormat';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';
import apiFetch2 from '@/functions/apiFetch2';
import { debounce } from 'lodash';


export const DepositModal = ({ onModal, closeModal, my_eth, data }) => {
    const modalRef = useRef();
    const checkRef = useRef(null);

    const [alertModal, setAlertModal] = useState(false);
    const [allStepComplete, setAllStepComplete] = useState(false);

    const [f, setF] = useState(false);
    const [amount, setAmount] = useState('');
    const [isValid, setIsValid] = useState(true);

    const [txt, setText] = useState('');
    const [img, setImg] = useState('');

    const [seq, setSeq] = useState(0);
    const [check, setCheck] = useState(false);


    useEffect(() => {
        if (onModal) {
            modalRef.current.close();
            modalRef.current.showModal();
            document.querySelector('body').classList.add('scrollLock');
        } else {
            modalRef.current.close();
            document.querySelector('body').classList.remove('scrollLock');
        }
    }, [onModal]);

    function closeAlert(boolean) {
        if (allStepComplete) {
            setAlertModal(boolean);
            closeModal(false);
            closeRefresh();
        } else {
            setAlertModal(boolean);
            closeRefresh();
        }
    }

    function closeRefresh() {
        setSeq(0);
        setF(false);
        setAmount('');
        setAllStepComplete(false);
        setText('');
        setImg('');
        setCheck(false);
    }

    function checkNumberValid(e) {
        let value = e.target.value;
        let formatValue = numberFormat(value, false, true, true, 2);
        setAmount(formatValue);

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

        //입력값이 예치 가능한지 확인
        if (Number(num) > Number(my_eth) || isNaN(num) || Number(num) == 0 || num[num.length - 1] == '.') {
            setIsValid(false);
        } else {
            setIsValid(true);
        }
    }


    /**
     * 예치 확인으로 넘어가기
     */
    function goDepositFnc() {
        setF(true);

        if (isValid) {
            setSeq(1);

        } else {
            setText('가능한 예치 수량을 초과하였습니다.\n확인 후 다시 입력하여 주시기 바랍니다.');
            setImg('alert');
            setAlertModal(true);

        }
    }

    /**
     * 예치 완료
     */
    async function checkDepositFunc() {

        let api_url =  '/api/fetch/deposit';
        let obj = {
            method: 'POST',
            body: JSON.stringify({
                name: data.name,
                amount: amount
            })
        }
        let result = await apiFetch2(api_url, obj);

        if (result.success) {
            setText('예치신청이 완료되었습니다.');
            setImg('logo')
            setAlertModal(true);
            setAllStepComplete(true);
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


    return (
        <>
            <AlertDialogNew2 onModal={alertModal} closeModal={closeAlert} parentComplete={allStepComplete} img={img} text={txt} />
            <dialog ref={modalRef} className={styles.modal} onCancel={() => { closeRefresh(); closeModal(false); }}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { closeModal(false); closeRefresh() }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>


                <div className={styles.dialogContainer}>


                    <div className={styles.contentsBox}>

                        <div className={styles.titleBox}>
                            <h1 className={styles.title}>상품 예치</h1>
                        </div>

                        <div className={styles.depositDiv}>

                            {
                                seq == 0 ? (
                                    <>
                                        <div className={styles.productInfo3}>
                                            <div className={styles.infoList}>
                                                <div className={styles.infoListTitle}>예치상품</div>
                                                <div className={styles.infoListCont}>{data.name}</div>
                                            </div>
                                            <div className={styles.infoList}>
                                                <div className={styles.infoListTitle}>예치자산</div>
                                                <div className={styles.infoListCont}>이더리움(ETH)</div>
                                            </div>
                                            <div className={styles.infoList}>
                                                <div className={styles.infoListTitle}>예치 개설일</div>
                                                <div className={styles.infoListCont}>{data.deposit_open}</div>
                                            </div>
                                            <div className={styles.infoList}>
                                                <div className={styles.infoListTitle}>예치 만기일</div>
                                                <div className={styles.infoListCont}>{data.deposit_close}</div>
                                            </div>
                                            <div className={styles.infoList}>
                                                <div className={styles.infoListTitle}>예치 이자</div>
                                                <div className={styles.infoListCont}>{data.rate}%</div>
                                            </div>

                                            <div className={styles.infoList} style={{ alignItems: 'flex-start' }}>
                                                <div className={styles.infoListTitle}>상품 설명</div>
                                                <div className={styles.infoListCont}>
                                                    {
                                                        data.character.map((p, index) => (
                                                            <div className={styles.expCont} key={index}>
                                                                <Image src={imagePack.component.iconCheckPurple} alt='iconCheckPurple' style={{ marginRight: '0.375rem', marginTop: '0.25rem' }} />
                                                                {p}
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </div>


                                        <div className={styles.goDeposit}>
                                            <div>
                                                <div className={styles.goDepositTitle}>예치하실 수량</div>
                                                <div className={styles.goDepositCont} style={{ position: 'relative' }}>
                                                    <input type={'text'} value={amount} onChange={checkNumberValid} placeholder="0(ETH)" style={{ border: (f && !isValid) ? '2px solid #FF0000' : !amount ? '2px solid #d4d4d4' : '2px solid #808080', background: amount ? '#f6f7f9' : 'white' }} />
                                                    {
                                                        amount && <Image src={imagePack.component.iconX_w} alt='iconX_w' className={styles.inputEmpty} onClick={() => setAmount('')} />
                                                    }

                                                </div>
                                            </div>
                                            <div>
                                                <div className={styles.goDepositTitle}></div>
                                                <div className={styles.goDepositCont}>
                                                    {(f && !isValid) && <div style={{ width: '100%', textAlign: 'right' }}><ValidText valueType={'deposit'} /></div>}
                                                    <div className={styles.depositPossible}>예치가능한 수량 : {my_eth.replace(defines.regex.comma, ",")} <span>ETH</span></div>
                                                </div>
                                            </div>

                                        </div>



                                        <div className={styles.btnDiv}>
                                            <div className={styles.cancelBtn} onClick={() => { closeModal(false); closeRefresh(); }}>취소</div>
                                            {
                                                amount && amount != '0' ?
                                                    <div className={styles.authBtn} onClick={goDepositFnc}>확인</div>
                                                    :
                                                    <div className={styles.authBtn} style={{ background: '#b2b2b2' }}>확인</div>
                                            }

                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.verification}>예치 내용</div>
                                        <div className={styles.exptBox}>
                                            <div className={styles.exptBoxItem}>
                                                <div>
                                                    예치하실 수량
                                                </div>
                                                <div>
                                                    <span className={styles.amount}>{amount}</span>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#b2b2b2', marginLeft: '0.25rem' }} >ETH</span>
                                                    {/* <span className={styles.approximateSign}>≈</span> */}
                                                    {/* <span className={styles.price}>251,500,000</span>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#b2b2b2', marginLeft:'0.25rem' }}>KRW</span> */}
                                                </div>
                                            </div>
                                            <div className={styles.exptBoxItem}>
                                                <div>
                                                </div>
                                                <div className={styles.exptReturn}>
                                                    <span>예상 수익</span>
                                                    <span>16 ETH</span>
                                                </div>
                                            </div>
                                            <div className={styles.exptBoxItem}>
                                                <div>
                                                </div>
                                                <div>
                                                    *예치금과 수익은 종료 후 이더리움으로 지급됩니다.
                                                </div>
                                            </div>

                                        </div>

                                        <div className={styles.verification}>예치전 확인 사항(필수)</div>

                                        <div className={styles.infoList} style={{ alignItems: 'flex-start', marginTop: '0.75rem', borderBottom: '2px solid #b2b2b2', paddingBottom: '2.5rem' }}>
                                            <div className={styles.infoListTitle}>상품 설명</div>
                                            <div className={styles.infoListCont}>
                                                {
                                                    data.character.map((p, index) => (
                                                        <div className={styles.expCont} key={index}>
                                                            <Image src={imagePack.component.iconCheckPurple} alt='iconCheckPurple' style={{ marginRight: '0.375rem', marginTop: '0.25rem' }} />
                                                            {p}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>

                                        <div className={styles.checkDiv}>
                                            <label htmlFor='checkbox' className={styles.checkBox}>
                                                <input type='checkbox' id='checkbox' onChange={() => { setCheck(checkRef.current.checked) }} ref={checkRef} />
                                                (필수)위 내용을 확인하였습니다.
                                            </label>
                                        </div>


                                        <div className={styles.btnDiv}>
                                            <div className={styles.cancelBtn} onClick={() => { closeModal(false); closeRefresh(); }}>취소</div>
                                            {
                                                check ?
                                                    <div className={styles.authBtn} onClick={debounce(checkDepositFunc, 500)}>확인</div>
                                                    :
                                                    <div className={styles.authBtn} style={{ background: '#b2b2b2', cursor: 'inherit' }}>확인</div>
                                            }

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