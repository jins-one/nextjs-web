import Image from 'next/image';
import styles from '@/styles/components/assets_detail.module.css';

import imagePack from '@/styles/image-module';

import { useEffect, useRef, useState } from "react";
import numberFormat from '@/functions/numberFormat';
import apiFetch from '@/functions/apiFetch';
import configs from '@/configs/configs';

export const AssetsDetailModal = ({onModal, text, index, closeModal})=>{
    const modalRef = useRef();
    const [detail, setDetail] = useState({});

    useEffect(()=>{
        
        if(modalRef && modalRef.current){

            if(onModal){
                modalRef.current.close(); 
                modalRef.current.showModal();
                document.querySelector('body').classList.add('scrollLock');

                //예치상품 상세조회 api
                async function depositProductDetail() {
                    let api_url =  '/api/fetch/deposit';
                    let result = await apiFetch(api_url, 'GET');

                    if(result.success) {
                        // setDetail(result.data);
                        setDetail(text); //부모에서 전달해주는 props - text는 api 붙이고 나면 삭제
                    } else {

                    }
                }
                depositProductDetail();

            }else {
                modalRef.current.close();
                document.querySelector('body').classList.remove('scrollLock');
            }
        }

    },[onModal])

    let list = [
        '자유롭게 이더리움을 예치하실 수 있습니다.',
        '연이율 16% 수익을 드립니다.',
        '예치 승인 후 365일 뒤 자동 종료되며, 중도해지는 불가합니다.',
        '예치금과 수익은 종료 후 이더리움으로 지급됩니다.'
    ]



    return ( 
        <>
            <dialog ref={modalRef} className={styles.modal}   onCancel={()=>closeModal(index)}>

                <div className={styles.headerBox}>

                    <div className={styles.logo}>
                        <Image src={imagePack.header.logo} alt={'logo'} />
                    </div>

                    <button className={styles.closeButton} onClick={()=>{closeModal(index)}} style={{cursor:'pointer'}}>
                        <Image src={imagePack.component.iconCloseButton} alt={'closeButton'} />
                    </button>
                </div>

                

                <div className={styles.dialogContainer}>
                    <div className={styles.titleBox}>
                        <h1 className={styles.title}>상세 내역</h1>
                    </div>

                    <div className={styles.contentsBox}>

                        <div className={styles.statusBox}>
                            <div className={styles.status} type={String(text.end)}>
                                {text.end ? '진행중' : '예치종료'}
                            </div>
                        </div>

                        <div className={styles.product}>
                            <div className={styles.nameTitle}>예치상품</div>
                            <div className={styles.name}>{text.name}</div> 
                        </div>

                        <div className={styles.product}>
                            <div className={styles.nameTitle}>예치자산</div>
                            <div className={styles.name}>이더리움(ETH)</div> 
                        </div>

                        <div className={styles.product}>
                            <div className={styles.nameTitle}>예치 개설일</div>
                            <div className={styles.name}>2023년 01월 01일</div> 
                        </div>

                        <div className={styles.product}>
                            <div className={styles.nameTitle}>예치 만료일</div>
                            <div className={styles.name}>2024년 01월 01일</div> 
                        </div>

                        <div className={styles.product}>
                            <div className={styles.nameTitle}>예치이자</div>
                            <div className={styles.name}>16%</div> 
                        </div>

                        {
                            text.end ? (
                                <>
                                    <div className={styles.product} type={'inList'}>
                                        <div className={styles.nameTitle}>상품 설명</div>
                                        <ul className={styles.explan}>
                                            {/* <li>자유롭게  이더리움을 예치하실 수 있습니다.</li>
                                            <li>연이율 16% 수익을 드립니다.</li>
                                            <li>예치 승인 후 365일 뒤 자동 종료되며, 중도해지는 불가합니다.</li>
                                            <li>동일 상품 중복 예치가 가능합니다.</li> */}

                                            {
                                                list.map((p, index) => (
                                                    <li key={index}>
                                                        <Image src={imagePack.component.iconCheckPurple} alt='iconCheckPurple' style={{ marginRight: '0.375rem', marginTop:'0.25rem' }} />
                                                        {p}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>

                                    <AssetsStatusTrue data={text} />
                                </>
                            ) : (
                                <AssetsStatusFalse data={text} />
                            )
                        }


                        

                    </div>

                    <div className={styles.buttonBox}>
                        <div className={styles.close} onClick={()=>{closeModal(index)}}>닫기</div>
                        <div className={styles.done} onClick={()=>{closeModal(index)}}>확인</div>
                    </div> 

                </div>               
            </dialog>
        </>
    );
}



const AssetsStatusTrue = ({data}) =>{   
    return (
        <div className={styles.detailBox}>
            <div className={styles.detailFlexBox}>
                <div className={styles.title}>예치하신 수량</div>
                <div className={styles.explan}>
                    <div>{numberFormat((data.deposit).toString(), false, true, true)}</div>
                    <div className={styles.eth}>ETH</div>
                </div>
            </div>
            <div className={styles.detailFlexBox}>
                <div></div>
                <div className={styles.expectedReturn}>
                    <div>예상 수익</div>
                    <div>16 <span style={{marginLeft:'0.25rem'}}>ETH</span></div>
                </div>
            </div>
            <div className={styles.detailFlexBox}>
                <div></div>
                <div className={styles.desc}>
                    <div>*예치금과 수익은 종료 후 이더리움으로 지급 됩니다.</div>
                </div>
            </div>
        </div>
    )
}

const AssetsStatusFalse = ({data}) =>{   
    return (
        <div className={styles.detailBox}>
            <div className={styles.detailFlexBox}>
                <div className={styles.title}>총 수량</div>
                <div className={styles.explan}>
                    <div>{numberFormat((data.deposit).toString(), false, true, true)}</div>
                    <div className={styles.eth}>ETH</div>
                </div>
            </div>
            <div className={styles.detailFlexBox}>
                <div></div>
                <div className={styles.expectedReturn2}>
                    <div>예치수량</div>
                    <div>16 <span style={{marginLeft:'0.25rem'}}>ETH</span></div>
                </div>
            </div>
            <div className={styles.detailFlexBox}>
                <div></div>
                <div className={`${styles.mt6} ${styles.expectedReturn2}`} >
                    <div>총 수익</div>
                    <div>16 <span style={{marginLeft:'0.25rem'}}>ETH</span></div>
                </div>
            </div>
            <div className={styles.detailFlexBox} >
                <div></div>
                <div className={styles.desc}>
                    <div>*예치금과 수익은 종료 후 이더리움으로 지급 됩니다.</div>
                </div>
            </div>
        </div>
    )
}

