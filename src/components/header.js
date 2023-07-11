import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { withSessionSsr } from '@/fetchs/session';

/**
 * style import
 */
import styles from '../styles/components/header.module.css';

/**
 * images import
*/

import imagePack from '@/styles/image-module';
import apiFetch2 from '@/functions/apiFetch2';
import configs from '@/configs/configs';

import { debounce } from 'lodash';


export default function Header({login, name}) {
    const router = useRouter();
    const [type, setType] = useState(0);

    const [show, setShow] = useState(false);
    const [hoverType, setHoverType] = useState(0);

    const hambergerRef = useRef();

    const [mediaOn, setMediaOn] = useState(false);
    const [csOn, setCsOn] = useState(false);




    async function logOut() {
        // const res = await fetch('/api/logout')
        const data = await apiFetch2('/api/logout', {method:'POST'}, login)

        if (data.ok) {

            router.push('/');
        }
    }


    useEffect(() => {

        let pathname = router.pathname.split('/')[1];

        if (pathname == 'deposit') {
            setType(1);
        } else if (pathname == 'assets') {
            setType(2);
        } else if (pathname == 'media') {
            setType(3);
        } else if (pathname == 'cs') {
            setType(4);
        } else if (pathname == 'mypage') {
            setType(5);
        } else if (pathname == 'login') {
            setType(6)
        } else if (pathname == 'signin') {
            setType(7)
        }
        else {
            setType(0);
        }

    }, [router.isReady])


    // hambergerEvent
    useEffect(() => {

        const hambergerToggleAttr = () => {

            const body = document.getElementsByTagName('body')[0];

            if (hambergerRef.current.getAttribute('status') === 'on') {
                hambergerRef.current.setAttribute('status', 'off');
                body.classList.remove('stop-scrolling');
                setMediaOn(false);
                setCsOn(false);
            } else if (hambergerRef.current.getAttribute('status') === 'off') {
                hambergerRef.current.setAttribute('status', 'on');
                body.classList.add('stop-scrolling');
            }
        }

        if (hambergerRef && hambergerRef.current) {
            const body = document.getElementsByTagName('body')[0];
            hambergerRef.current.setAttribute('status', 'off');
            body.classList.remove('stop-scrolling');
            setMediaOn(false);
            setCsOn(false);
            hambergerRef.current.addEventListener('click', hambergerToggleAttr);
        }

        return () => {
            if (hambergerRef && hambergerRef.current) {
                hambergerRef.current.removeEventListener('click', hambergerToggleAttr);
            }
        }

    }, [hambergerRef.current, router]);


    function mouseHover(boolean, type) {
        setShow(boolean);
        if (type || type == 0) {
            setHoverType(type);
        }
    }


    return (
        <>
            <header className={styles.header} >

                <div className={styles.headerBox}>
                    <div className={styles.leftBox} onMouseLeave={() => mouseHover(false)}>
                        <Link href={`/`} onMouseOver={() => mouseHover(true, 0)}>
                            <Image src={imagePack.header.logo} className={styles.headerLogo} alt="headerLogo" />
                        </Link>

                        <ul className={styles.headerCateBox} style={{ marginLeft: 'var(--size-50)' }}>
                            <li onMouseOver={() => mouseHover(true, 1)}>
                                <Link href={`/deposit`} className={type == 1 ? styles.active : styles.menu}>예치</Link>
                            </li>
                            <li onMouseOver={() => mouseHover(true, 2)}>
                                <Link href={`/assets`} className={type == 2 ? styles.active : styles.menu}>자산</Link>
                            </li>
                            <li onMouseOver={() => mouseHover(true, 3)}>
                                <Link href={`/media/blink-blog`} className={type == 3 ? styles.active : styles.menu}>미디어</Link>
                                {
                                    (show && hoverType == 3) && //미디어 호버 시
                                    (
                                        <div className={styles.hoverBox} onMouseLeave={() => mouseHover(false)}>
                                            <ul className={styles.headerCateBox}>
                                                <li>
                                                    <Link href={`/media/blink-blog`} className={styles.menu}>블링크 블로그</Link>
                                                </li>
                                                <li>
                                                    <Link href={`/media/blink-news`} className={styles.menu}>블링크 소식</Link>
                                                </li>
                                                <li>
                                                    <Link href={`/media/news`} className={styles.menu}>가상화폐 뉴스</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )
                                }
                            </li>
                            <li onMouseOver={() => mouseHover(true, 4)}>
                                <Link href={`/cs/notice?type=important`} className={type == 4 ? styles.active : styles.menu}>고객센터</Link>
                                {
                                    (show && hoverType == 4) && //고객센터 호버 시
                                    (
                                        <div className={styles.hoverBox} onMouseLeave={() => mouseHover(false)}>
                                            <ul className={styles.headerCateBox}>
                                                {/* <li>
                                                    <Link href={`#;`} className={styles.menu}>서비스 문의</Link>
                                                </li> */}
                                                <li>
                                                    <Link href={`/cs/notice?type=important`} className={styles.menu}>공지사항</Link>
                                                </li>
                                                <li>
                                                    <Link href={`/cs/qna?type=deposit`} className={styles.menu}>자주묻는 질문</Link>
                                                </li>
                                                <li>
                                                    <Link href={`/cs/conditions?type=service`} className={styles.menu}>이용약관</Link>
                                                </li>
                                                <li>
                                                    <Link href={`/cs/inquiry`} className={styles.menu}>1:1문의</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    )
                                }
                            </li>
                        </ul>
                    </div>

                    <div className={styles.rightBox}>

                        <ul className={styles.headerCateBox}>
                            {
                                login ?
                                    <>
                                        <li className={styles.logout}>
                                            <div onClick={debounce(logOut, 500)} style={{ cursor: 'pointer' }} onMouseOver={() => mouseHover(true, 8)}>로그아웃</div>
                                        </li>
                                        <li>
                                            <Link href={`/mypage`} className={type == 5 ? styles.active : styles.menu} onMouseOver={() => mouseHover(true, 5)}>마이페이지</Link>
                                        </li>
                                    </>
                                    :
                                    <>
                                        <li>
                                            <Link href={`/login`} className={type == 6 ? styles.active : styles.menu} onMouseOver={() => mouseHover(true, 6)}>로그인</Link>
                                        </li>
                                        <li>
                                            <Link href={`/signin`} className={type == 7 ? styles.active : styles.menu} onMouseOver={() => mouseHover(true, 7)}>회원가입</Link>
                                        </li>
                                    </>
                            }

                        </ul>

                    </div>

                    <div className={styles.hambergerMenu}>
                        <div className={styles.hamberger} ref={hambergerRef} status='off'>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                        <div className={styles.menuBg} >
                            <div className={styles.Menu}>
                                <div className={styles.menuContainer}>

                                    <div className={styles.login}>
                                        {
                                            login ? (
                                                <div>
                                                    <Link href={'/mypage'}>안녕하세요<br /><span style={{color:'var(--defaultColor)'}}>{name}</span>님!</Link>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={styles.loginBox}>
                                                        <Link href={'/login'}>
                                                            <Image src={imagePack.component.iconLeftGray_w} alt='iconLeftGray_w' />
                                                            로그인하기
                                                        </Link>
                                                    </div>
                                                    <div className={styles.loginDesc}>가입 후 다양한 서비스를 받을 수 있습니다!</div>
                                                </>
                                            )
                                        }
                                    </div>

                                    <ul className={styles.menuList}>
                                        <li><span></span><span> <Link href={'/deposit'}>예치</Link></span></li>
                                        <li><span></span><span> <Link href={'/assets'}>자산</Link></span></li>
                                        <li className={styles.mediaOff} onClick={() => setMediaOn(!mediaOn)}>
                                            {
                                                mediaOn ?
                                                    <Image src={imagePack.component.iconTop2} alt='iconTop2' /> :
                                                    <Image src={imagePack.component.iconDown2} alt='iconDown2' />
                                            }
                                            <span>미디어</span>
                                        </li>
                                        {
                                            mediaOn && (
                                                <li className={styles.onMenu}>
                                                    <ul style={{ width: '100%' }}>
                                                        <li><Link href={`/media/blink-blog`}>블링크 블로그</Link></li>
                                                        <li><Link href={`/media/blink-news`}>블링크 소식</Link></li>
                                                        <li><Link href={`/media/news`}>가상화폐 뉴스</Link></li>
                                                    </ul>
                                                </li>
                                            )
                                        }

                                        <li className={styles.mediaOff} onClick={() => setCsOn(!csOn)}>
                                            {
                                                csOn ?
                                                    <Image src={imagePack.component.iconTop2} alt='iconTop2' /> :
                                                    <Image src={imagePack.component.iconDown2} alt='iconDown2' />
                                            }
                                            <span>고객센터</span>
                                        </li>
                                        {
                                            csOn && (
                                                <li className={styles.onMenu}>
                                                    <ul style={{ width: '100%' }}>
                                                        <li><Link href={`/cs/inquiry`}>1:1문의</Link></li>
                                                        <li><Link href={`/cs/qna?type=deposit`}>자주묻는 질문</Link></li>
                                                        <li><Link href={`/cs/notice?type=important`}>공지사항</Link></li>
                                                        <li><Link href={`/cs/conditions?type=service`}>이용약관</Link></li>
                                                    </ul>
                                                </li>
                                            )
                                        }

                                    </ul>


                                    {
                                        login && (
                                            <div className={styles.afterLogin}>
                                                <div className={styles.logOut} onClick={logOut}>로그아웃</div>
                                                <Link href={'/mypage'} className={styles.mypage}>마이페이지</Link>
                                            </div>
                                        )
                                    }
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </header>

        </>
    );
}

