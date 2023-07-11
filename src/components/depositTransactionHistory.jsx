import Image from 'next/image';
import styles from '@/styles/components/assetsTransactionHistory.module.css';
import Link from 'next/link';
import imagePack from '@/styles/image-module';

import Paginate from './paginate';

import HistoryDetailAlert from './historyDetailAlert';

import { WithdrawalWait } from './withdrawalWait';

import { useEffect, useRef, useState } from "react";
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';
import { useRouter } from 'next/router';
import apiFetch2 from '@/functions/apiFetch2';

const MAX_DATE = "2077-01-01";
const MIN_DATE = "1900-01-01"
export const DepositTransactionHistory = ({ onModal, closeModal, ...props }) => {
    const modalRef = useRef();
    const router = useRouter();

    const [withdrawlWaitModal, setWithdrawlWaitModal] = useState(false)

    const [isAllChecked, setIsAllChecked] = useState(true);
    const [isDepositChecked, setIsDepositChecked] = useState(false);
    const [isWithdrawalChecked, setIsWithdrawalChecked] = useState(false);
    const [nowRadioSelect, setNowRadioSelect] = useState(1);

    const [sort, setSort] = useState('desc');

    const [type, setType] = useState('default');
    const [status, setStatus] = useState('default');
    const [dateChoice, setDateChoice] = useState({
        min: '',
        max: ''
    })

    const [detailModal, setDetailModal] = useState(false);
    const [detail, setDetail] = useState('');


    function handleAllChecked() {
        setIsAllChecked(!isAllChecked);
        setIsDepositChecked(false);
        setIsWithdrawalChecked(false);
    }

    function handleDepositChecked() {
        setIsAllChecked(false);
        setIsDepositChecked(!isDepositChecked);
        setIsWithdrawalChecked(false);
    }

    function handleWithdrawalChecked() {
        setIsAllChecked(false);
        setIsDepositChecked(false);
        setIsWithdrawalChecked(!isWithdrawalChecked);
    }

    const [historyList, setHistoryList] = useState([]);


    useEffect(() => {
        if (onModal) {
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
    useEffect(() => {
        if (onModal) {
            history();
        }
    }, [status, sort])

    //거래종류 선택 시 거래상태 초기화
    useEffect(() => {
        if (type == 'total') {
            setStatus('total');
        } else if (type == 'deposit') {
            setStatus('d_total');
        } else if (type == 'withdrawal') {
            setStatus('w_total');
        }
    }, [type])

    /**
     * 예치 내역 조회 api
     */
    async function history() {
        let api_url =  '/api/fetch/deposit-transaction-history';
        let query_params = `?type=${type == 'default' ? 'total' : type}&status=${status == 'default' ? 'total' : type}&sort=${sort}&from=${dateChoice.min}&to=${dateChoice.max}`;
        let result = await apiFetch2(api_url + query_params, {method:'GET'});

        if (result.success) {
            setHistoryList(result.list);
        } else {
            if(result.redirect) {
                const data = await apiFetch2('/api/logout', { method: 'POST' });
                if (data.ok) {
                    router.push('/login?session=no');
                }
            }
            else if(result.code == 1001) {
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

    function refreshAll() {
        setType('default');
        setStatus('default');
        setNowRadioSelect(1);

        closeModal(false);
    }


    function radiaCheckBox(e) {
        if (e.target.value == nowRadioSelect) { return; }

        if (e.target.value == 1) {
            setSort('desc');
        } else {
            setSort('asc');
        }


        setNowRadioSelect(e.target.value);
    }

    const [estimatePrice, setEstimatePrice] = useState('');
    const [withdrawalFee, setWithdrawalFee] = useState('');


    return (
        <>

            <dialog ref={modalRef} className={`${styles.modal} ${styles.deposit}`} onCancel={test}>

                <div className={styles.headerBox}>
                    <button className={styles.closeButton} onClick={() => { refreshAll() }} style={{ cursor: 'pointer' }}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>
                </div>


                <div className={styles.dialogContainer}>
                    <div className={styles.titleBox}>
                        <h1 className={styles.title}>예치 내역</h1>
                    </div>

                    <div className={styles.contentsBox}>

                        <div className={`${styles.product} ${styles.searchOptionBar} ${styles.jusfiBet}`}>

                            {/* select, 날짜, 검색 input start */}
                            <div className={styles.searchOptionBar}>

                                <select className={styles.dateSelect} value={type} onChange={(e) => setType(e.target.value)} required>
                                    <option value='default' disabled>구분</option>
                                    <option value='total'>전체</option>
                                    <option value='deposit'>예치중</option>
                                    <option value='deposit_done'>예치종료</option>
                                </select>

                                <div className={`${styles.dateScope} ${styles.ml16}`}>
                                    <input type="date" max={MAX_DATE} min={MIN_DATE} onChange={(e) => setDateChoice({ ...dateChoice, min: e.target.value })} />
                                    <span>~</span>
                                    <input type="date" max={MAX_DATE} min={MIN_DATE} onChange={(e) => setDateChoice({ ...dateChoice, max: e.target.value })} />
                                </div>

                                {/* <select className={`${styles.searchOptionBar} ${styles.textSearch} ${styles.ml16}`} value={status} onChange={(e) => setStatus(e.target.value)} required>
                                    <option value='default' disabled>거래상태</option>
                                    {
                                        type == 'deposit' ? (
                                            <>
                                                <option value='d_total'>전체</option>
                                                <option value='d_done'>입금완료</option>
                                                <option value='d_fail'>입금실패</option>
                                            </>
                                        ) :
                                            type == 'deposit_done' ? (
                                                <>
                                                    <option value='w_total'>전체</option>
                                                    <option value='w_done'>출금완료</option>
                                                    <option value='w_wait'>출금대기</option>
                                                    <option value='w_fail'>출금실패</option>
                                                </>
                                            ) : (
                                                <option value='total'>전체</option>
                                            )
                                    }
                                </select> */}

                            </div>
                            {/* select, 날짜, 검색 input end */}

                            {/* checkbox start */}
                            <div className={styles.searchOptionBar}>

                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <label className={styles.radioBoxFlex} >
                                        <input type={'radio'} name={'v'} value={1} checked={nowRadioSelect == 1} onChange={radiaCheckBox} />
                                        <span>최신순</span>
                                    </label>
                                    <label className={`${styles.radioBoxFlex} ${styles.ml24}`}>
                                        <input type={'radio'} name={'v'} value={2} checked={nowRadioSelect == 2} onChange={radiaCheckBox} />
                                        <span>과거순</span>
                                    </label>
                                </div>

                                {/* <button className={`${styles.excelBtn} ${styles.ml24}`}>Excel</button> */}
                            </div>
                            {/* checkbox end */}
                        </div>


                        <div className={`${styles.oneRowContainer} ${styles.backGray} ${styles.mt12}`}>
                            <p className={`${styles.width100} ${styles.type}`}>구분</p>
                            <p className={`${styles.width100}`}>상품종류</p>
                            <p className={`${styles.width120}`}>예치금액</p>
                            <p className={`${styles.width120}`}>이율</p>
                            <p className={`${styles.width200} ${styles.deposit}`}>신청일자</p>
                            <p className={`${styles.width200} ${styles.deposit}`}>종료일자</p>
                        </div>
                        {/* pagination start */}
                        <div>
                            {
                                (historyList && historyList.length !== 0) ? historyList.map((h, index) => (

                                    <button className={styles.rowBtn} key={index}>
                                        <div className={`${styles.oneRowContainer}`}>
                                            <p className={`${styles.width100} ${styles.type}`} type={h.type}>{h.type}</p>
                                            <p className={`${styles.width100}`}>{h.product}</p>
                                            <p className={`${styles.width120}`}>{h.price}</p>
                                            <p className={`${styles.width120}`}>{h.rate}</p>
                                            <p className={`${styles.width200} ${styles.deposit}`}>{h.s_date}</p>
                                            <p className={`${styles.width200} ${styles.deposit}`}>{h.e_date}</p>
                                        </div>
                                    </button>
                                )) : (
                                    <div style={{ textAlign: 'center', paddingTop: 'var(--size-80)', paddingBottom: 'var(--size-20)' }}>
                                        <Image src={imagePack.component.iconListNotiong} alt='iconListNotiong' />
                                        <div style={{
                                            fontSize: '1rem', fontWeight: '500', color: '#B2B2B2', marginTop: '2rem'
                                        }}
                                        >예치 내역이 없습니다.</div>
                                    </div>
                                )
                            }


                        </div>
                        {/* pagination end */}

                        {
                            props.list && (
                                <div className={`${styles.pagiBar}`}>
                                    <Paginate data={[]} func={() => { }} pageCount={5} pageRangeDisplayed={5} breakLabel={''} previousLabel={'prev'} nextLabel={'next'} />
                                </div>
                            )
                        }

                        {/* <div className={`${styles.infoBox} ${styles.mt80}`}>
                            <div className={styles.infoBoxTitleBox}>
                                <p className={styles.noti}>공지</p>
                                <span className={styles.ml12}>예치관련 안내사항</span>
                            </div>

                            <ol className={styles.mt30}>
                                <li>100만원 이상의 입금 건의 경우 연동된 거래소에서만 입금이 가능합니다. 입금 허용 리스트는 고객센터를 통해 확인하여 주시기 바랍니다.</li>
                                <li>해외 거래소에서 입금 시, 위험평가 통과VASP로부터의 입금만 가능합니다.</li>
                                <li>해당 디지털 자산은 메인넷을 통한 입금만 지원합니다.</li>
                            </ol>
                        </div> */}

                    </div>


                </div>



            </dialog>

        </>
    );
}