import styles from '../styles/components/assetsHistoryMobile.module.css';
import Image from 'next/image';
import Link from 'next/link';

import imagePack from '@/styles/image-module';
import { useState, useEffect, useRef } from 'react';
import { WithdrawalWait } from './withdrawalWait';
import AssetsHistory_m from './assetsHistoryMobile';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';
import { useRouter } from 'next/router';
import apiFetch2 from '@/functions/apiFetch2';
import DepositHistory_m from './depositHistoryMobile';


const MAX_DATE = "2077-01-01";
const MIN_DATE = "1900-01-01"

export default function DepositTransactionHistoryMobile({ onModal, closeModal, ...props }) {
    const router = useRouter();
    const modalRef = useRef();
    const optionRef = useRef();

    const [withdrawlWaitModal, setWithdrawlWaitModal] = useState(false);
    const [toggle, setToggle] = useState(false);

    const [dateChoice, setDateChoice] = useState({
        min: '',
        max: ''
    })
    const [statusChoice, setStatusChoice] = useState('total');
    const [sortChoice, setSortChoice] = useState('desc');

    //AssetsHistory_m 컴포넌트의 상세내역 토글 (모달을 닫을때 상세내역 토글 초기화)
    const [toggleClose, setToggleClose] = useState(false);

    const [historyList, setHistoryList] = useState([]);


    useEffect(() => {
        if (onModal) {
            setToggleClose(false);

            modalRef.current.close();
            modalRef.current.showModal();
            document.querySelector('body').classList.add('scrollLock');

            //onModal 될 때 입출금내역 불러오기
            history();

        } else {
            modalRef.current.close();
            document.querySelector('body').classList.remove('scrollLock');
        }
    }, [onModal]);


    //필터 옵션
    useEffect(()=>{
        if(onModal){
            history();
        }

    }, [statusChoice, sortChoice])

    /**
     * 예치 내역 조회 api
     */
    async function history() {
        let api_url =  '/api/fetch/deposit-transaction-history';
        let query_params = `?status=${statusChoice}&sort=${sortChoice}&from=${dateChoice.min}&to=${dateChoice.max}`;
        let result =  await apiFetch2(api_url + query_params, {method:'GET'});

        if (result.success) {
            setHistoryList(result.list);
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

    /**
     * esc를 눌렀을때 출금 관리 모달이 열려있으면 해당 모달을 닫지 않기
     */
    function test() {
        if (withdrawlWaitModal) {
            modalRef.current.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                }
            })
        } else {
            refreshAll();
        }
    }

    useEffect(() => {
        if (toggle) {
            optionRef.current.style.display = 'block';
            document.querySelector('dialog.depositAssetsTransactionHistory').classList.add('scrollLock');
        } else {
            optionRef.current.style.display = 'none';
            document.querySelector('dialog.depositAssetsTransactionHistory').classList.remove('scrollLock');
        }
    }, [toggle])

    function refreshAll() {
        setToggleClose(true);
        setToggle(false);
        setStatusChoice('total');
        setSortChoice('desc');

        closeModal(false);
    }


    function radioChange1(e) {
        console.log(1, e.target.value)
        setStatusChoice(e.target.value);
    }
    function radioChange2(e) {
        console.log(2, e.target.value)
        setSortChoice(e.target.value);
    }


    return (
        <>
            {/* <WithdrawalWait onModal={withdrawlWaitModal} closeModal={setWithdrawlWaitModal} /> */}

            <dialog ref={modalRef} className={`depositAssetsTransactionHistory ${styles.modal}`} onCancel={test}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { refreshAll() }} style={{ cursor: 'pointer' }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                </div>


                <div className={styles.dialogContainer}>
                    <div className={styles.titleBox}>
                        <h1 className={styles.title}>예치 내역</h1>
                    </div>

                    <div className={styles.filterDiv}>
                        <div onClick={() => { setToggle(!toggle) }}>
                            입금/출금・기간
                            {
                                toggle ?
                                    <Image src={imagePack.component.iconTop2} alt='iconTop2' style={{ marginLeft: '0.25rem' }} />
                                    :
                                    <Image src={imagePack.component.iconDown2} alt='iconDown2' style={{ marginLeft: '0.25rem' }} />
                            }

                        </div>
                    </div>

                    <div className={styles.contentsBox}>

                        {
                            (historyList && historyList.length !== 0) ? (
                                <div style={{ paddingTop: '17px' }} className={styles.historyListDiv}>
                                    {
                                        historyList.map((h, index) => (
                                            <DepositHistory_m modal={setWithdrawlWaitModal} close={toggleClose} data={h} key={index} />
                                        ))
                                    }
                                </div>
                            ) : (
                                <>
                                    <div style={{ textAlign: 'center', paddingTop: 'var(--size-60)', paddingBottom: 'var(--size-10)' }}>
                                        <Image src={imagePack.component.iconListNotiong} alt='iconListNotiong' />
                                        <div style={{
                                            fontSize: '1rem', fontWeight: '400', color: '#B2B2B2', marginTop: '0.75rem'
                                        }}
                                        >예치 내역이 없습니다.</div>
                                    </div>

                                </>
                            )
                        }

                        {/* <div className={styles.infoBox}>
                            <div className={styles.infoBoxTitleBox}>
                                <p className={styles.noti}>공지</p>
                                <span className={styles.title}>예치관련 안내사항</span>
                            </div>

                            <ol>
                                <li>100만원 이상의 입금 건의 경우 연동된 거래소에서만 입금이 가능합니다. 입금 허용 리스트는 고객센터를 통해 확인하여 주시기 바랍니다.</li>
                                <li>해외 거래소에서 입금 시, 위험평가 통과VASP로부터의 입금만 가능합니다.</li>
                                <li>해당 디지털 자산은 메인넷을 통한 입금만 지원합니다.</li>
                            </ol>
                        </div> */}

                    </div>

                    <div className={styles.optionContainer} ref={optionRef}>
                        <div className={styles.backdrop}></div>
                        <div style={{ zIndex: '100', background: 'white' }}>
                            <div className={styles.header}>
                                <div onClick={() => { setToggle(!toggle) }}>
                                    조회옵션
                                    <Image src={imagePack.component.iconDown} alt='iconDown' />
                                </div>
                            </div>
                            <div className={styles.options}>

                                <div className={styles.optionItem}>
                                    <div className={styles.optionTitle}>조회기간</div>
                                    <div className={`${styles.date} ${styles.optionContents}`}>
                                        <div className={styles.datePicker}>
                                            <input type="date" max={MAX_DATE} min={MIN_DATE} onChange={e => setDateChoice({ ...dateChoice, min: e.target.value })} />
                                        </div>
                                        <span>&nbsp;&nbsp;—&nbsp;&nbsp;</span>
                                        <div className={styles.datePicker}>
                                            <input type="date" max={MAX_DATE} min={MIN_DATE} onChange={e => setDateChoice({ ...dateChoice, max: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.optionItem}>
                                    <div className={styles.optionTitle}>거래상태</div>
                                    <div className={`${styles.status} ${styles.optionContents}`}>
                                        <div className={styles.deposit}>
                                            <div>
                                                <input id='dtotal' type={'radio'} name={'status'} onChange={radioChange1} value={'total'} checked={statusChoice == 'total'} />
                                                <label className={styles.statusChoice} htmlFor='dtotal'>전체</label>
                                            </div>
                                            <div>
                                                <input id='deposit' type={'radio'} name={'status'} onChange={radioChange1} value={'deposit'} checked={statusChoice == 'deposit'} />
                                                <label className={styles.statusChoice} htmlFor='deposit'>예치중</label>
                                            </div>
                                            <div>
                                                <input id='ddeposit' type={'radio'} name={'status'} onChange={radioChange1} value={'deposit_done'} checked={statusChoice == 'deposit_done'} />
                                                <label className={styles.statusChoice} htmlFor='ddeposit'>예치종료</label>
                                            </div>
                                        </div>
                                        {/* <div className={styles.withdrawal}>
                                            <div>
                                                <input id='wwait' type={'radio'} name={'status'} onChange={radioChange1} value={'w_wait'} checked={statusChoice == 'w_wait'} />
                                                <label className={styles.statusChoice} htmlFor='wwait'>출금대기</label>
                                            </div>
                                            <div>
                                                <input id='wdone' type={'radio'} name={'status'} onChange={radioChange1} value={'w_done'} checked={statusChoice == 'w_done'} />
                                                <label className={styles.statusChoice} htmlFor='wdone'>출금완료</label>
                                            </div>
                                            <div>
                                                <input id='wfail' type={'radio'} name={'status'} onChange={radioChange1} value={'w_fail'} checked={statusChoice == 'w_fail'} />
                                                <label className={styles.statusChoice} htmlFor='wfail'>출금실패</label>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className={styles.optionItem}>
                                    <div className={styles.optionTitle}>정렬순서</div>
                                    <div className={`${styles.sort} ${styles.optionContents}`}>
                                        <div>
                                            <input id='latest2' type={'radio'} name={'sort'} onChange={radioChange2} value={'desc'} checked={sortChoice == 'desc'} />
                                            <label className={styles.statusChoice} htmlFor='latest2'>최신순</label>
                                        </div>
                                        <div>
                                            <input id='past2' type={'radio'} name={'sort'} onChange={radioChange2} value={'asc'} checked={sortChoice == 'asc'} />
                                            <label className={styles.statusChoice} htmlFor='past2'>과거순</label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>



            </dialog>

        </>
    );
}