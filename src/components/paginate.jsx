import Image from 'next/image';
import ReactPaginate from "react-paginate";

import imagePack from '@/styles/image-module';
import styles from '@/styles/components/paginate.module.css';

import { useState, useEffect } from 'react';


export default function Paginate(props) {

    let data = props.data;

    const limit = props.pageRangeDisplayed;
    let offset;

    function handlePageClick(e) {

        offset = (e.selected)*limit;
        let result = data.slice(offset, offset + limit);
        

        //arument로 
        props.func(result);
    }

    useEffect(()=>{

    }, [])

    return (
        <>
            <ReactPaginate
                pageCount={props.pageCount} //총 페이지 수
                pageRangeDisplayed={props.pageRangeDisplayed}  //한 페이지에 표시할 게시글의 수
                breakLabel={props.breakLabel} //페이지 수가 많을 경우 건너뛸 수 있는 버튼
                previousLabel={props.previousLabel} //이전 페이지로 가는 버튼 value
                nextLabel={props.nextLabel} //다음 페이지로 가는 버튼 value
                onPageChange={handlePageClick} //페이지 버튼을 눌렀을 때 일어나는 이벤트

                pageLinkClassName={styles.pageLink}
                pageClassName={styles.pageLi}
                containerClassName={styles.paginationUl}
                previousClassName={styles.prevBtn}
                nextClassName={styles.nextBtn}
                previousLinkClassName={styles.pageLinkBtn}
                nextLinkClassName={styles.pageLinkBtn}
                activeClassName={styles.pageActice}
            />
        </>
    )
}
