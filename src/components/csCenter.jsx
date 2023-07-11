import styles from '@/styles/components/cs_center.module.css';
import Image from 'next/image';
import Link from 'next/link';

import imagePack from '@/styles/image-module';

import Container from '@/components/conatiner';


export default function CScenter(props) {

    return (

        <div className={styles.contactDiv}>
            <Container>
                <div className={styles.csComponent} >
                    <div style={{ display: 'flex', flexDirection:'column' }}>
                        <div className={styles.contactTitle}>
                            궁금한 점이 해결되지 않으셨나요?<br />
                            저희에게 문의해주세요
                        </div>
                        <div className={styles.contactBox}>
                            <Image src={imagePack.cs.contactImg2} className={styles.contactImg} alt='contactImg' />
                            <div className={styles.contactContents}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>전화상담 문의</div>
                                    <div style={{ marginBlock: '0.25rem', fontSize: '2.625rem', fontWeight: '800', lineHeight: '1.2' }}>1555-9999</div>
                                    <div style={{ fontSize: '0.875rem', color: '#B2B2B2', lineHeight: '1.4' }}>평일 09:00 - 18:00 / 점심시간, 공휴일, 주말 상담불가 <br />(점심시간 12:00-13:00)</div>
                                </div>
                                <div>
                                    <div className={styles.contactChat}>
                                        <Image src={imagePack.cs.iconKakao} alt='iconKakao' />
                                        <div className={styles.chatTitle}>카카오톡 챗봇 상담</div>
                                        <div className={styles.chatDesc}>(평일 09:00 - 18:00 / 공휴일, 주말 연결 불가)</div>
                                        <div className={styles.chatGo}>챗봇 상담하기 <Image src={imagePack.component.iconNext} alt='iconNext' style={{ marginLeft: '0.719rem' }} /></div>
                                    </div>
                                    <div className={styles.contactChat}>
                                        <Image src={imagePack.cs.iconContact} alt='iconContact' />
                                        <div className={styles.chatTitle}>1:1 문의</div>
                                        <div className={styles.chatDesc}>순차적으로 답변드립니다.</div>
                                        <div className={styles.chatGo}><Link href={'/cs/inquiry'}>1:1 문의하기 <Image src={imagePack.component.iconNext} alt='iconNext' style={{ marginLeft: '0.719rem' }} /></Link></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </Container>
        </div>
    )

}