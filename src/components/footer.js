import Image from 'next/image';
import Link from 'next/link';

import React from 'react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import ERDDrwo from '../../public/pdfs/ERDdrawio.pdf'

/**
 * style import
*/
import styles from '@/styles/components/footer.module.css';

/**
 * images import
*/
import imagePack from '@/styles/image-module';

export default function Footer() {

    const [pdfBlob, setPdfBlob] = useState(null)

    useEffect(() => {
        // fetch(ERDDrwo)
        //     .then(response => response.blob())
        //     .then(blob => setPdfBlob(blob));
    }, []);

    /**
     * pdf 파일 다운로드 함수
     * @param {*} name pdf 파일 이름
     */
    const downLoadPdf = (name = "인증서") => {
        // const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        // const url = URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = name + '.pdf'; // 다운로드 파일 이름
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // URL.revokeObjectURL(url);
    };


    return (
        <>

            <footer className={styles.footerBox}>

                <div className={styles.topBox}>
                    <ul className={styles.footerCateBox}>
                        <li>
                            <Link href={'/cs/conditions?type=privacy'} className={styles.bold}>개인정보 처리방침</Link>
                        </li>
                        <li>
                            <Link href={'/cs/conditions?type=service'}>서비스이용약관</Link>
                        </li>
                        <li>
                            <Link href={'#;'}>투자유의사항</Link>
                        </li>
                    </ul>
                    <div className={styles.iconLinkBox}>
                        <Link href={'#;'}>
                            <Image src={imagePack.footer.iconInsta} alt="iconInsta" style={{ marginLeft: '0px' }} />
                        </Link>
                        <Link href={'#;'}>
                            <Image src={imagePack.footer.iconFabook} alt="iconFabook" />
                        </Link>
                        <Link href={'#;'}>
                            <Image src={imagePack.footer.iconBlog} alt="iconBlog" />
                        </Link>
                        <Link href={'#;'}>
                            <Image src={imagePack.footer.iconChat} alt="iconChat" />
                        </Link>
                        <Link href={'#;'}>
                            <Image src={imagePack.footer.iconYoutube} alt="iconYoutube" />
                        </Link>
                        <Link href={'#;'}>
                            <Image src={imagePack.footer.iconNews} alt="iconNews" />
                        </Link>

                    </div>
                </div>


                <div className={styles.bottomBox}>
                    <div>
                        <div className={styles.footerInfo}>
                            <div className={styles.csCenter}>
                                <span>고객센터</span> 1555-9999
                            </div>
                            <div>운영시간 평일 09:00 - 18:00</div>
                            <div>(13:00 ~ 14:00 점심시간 / 주말 및 공휴일 휴무)</div>
                            <div>Copyright 2023.Blink All Rights Reserved</div>
                        </div>
                        <div className={styles.footerInfo}>
                            <div className={styles.tipping}>(주)티핑포인트</div>
                            <div className={styles.dirRow}>
                                <div>
                                    CEO&nbsp;&nbsp;Tyra Lee(이경아)
                                </div>
                                <div className={styles.bar} />
                                <div>
                                    사업자번호 : 809-86-02414
                                </div>
                            </div>
                            <div className={styles.dirRow}>
                                <div>
                                    TEL&nbsp;&nbsp;02-566-3778
                                </div>
                                <div className={styles.bar} />
                                <div>
                                    E-MAIL&nbsp;&nbsp;contact@tp-point.com
                                </div>
                            </div>
                            <div>
                                서울특별시 강남구 역삼동 652-2, 3F (봉은사로 222)
                            </div>

                        </div>
                    </div>

                    {/* <div className={styles.footerContact}>

                        <Image src={imagePack.footer.imgISMSWhite} alt='imgISMS' className={styles.isms} onClick={() => downLoadPdf()} priority />

                        <div className={styles.hoverIsms}>
                            인증범위 : 가상자산 예치 서비스운영<br />
                            유효기간 : 23.07.01 ~ 26.06.30
                        </div>

                    </div> */}
                </div>
            </footer>
        </>
    );
}