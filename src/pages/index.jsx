import styles from '../styles/pages/home.module.css';
import Image from 'next/image';
import Link from 'next/link';

import imagePack from '@/styles/image-module';
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";

import { useEffect, useRef, useState } from 'react';

import { NextRequest } from 'next/server';

import Container from '@/components/conatiner';
import ProductCard from '@/components/productCard';
import Header from '@/components/header.js';
import Footer from '@/components/footer.js';
import CoinRate from '@/components/coinRate';
import cs_list from '@/defines/defines';

import ERDDrwo from '../../public/pdfs/ERDdrawio.pdf'

import { Swiper, SwiperSlide } from "swiper/react";

import { Autoplay, EffectFade, Navigation, Pagination, Thumbs } from 'swiper';

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";


import { movingTextAnime, movingArrowY, introImageSize, textTranslateY, opacityAni, backgroundColorChangeAnime } from '@/functions/anim/anime-module';

import AOS from 'aos';
import 'aos/dist/aos.css';
import numberFormat from '@/functions/numberFormat';
import configs from '@/configs/configs';
import apiFetch from '@/functions/apiFetch';
import maskingEmail from '@/functions/emailMasking';
import { MemberInquiry } from '@/fetchs/members/get/userid/inquiry';
import apiFetch2 from '@/functions/apiFetch2';


const startInterval = (callback) => {
  callback();
  return setInterval(callback, 1000 * 60 * 60 * 12);
};



/**
 * 메인 페이지
 */
export default function Home({ session, ...props }) {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('');

  const persentRef = useRef();
  const ethRef = useRef();

  // animejs Ref
  const testRef = useRef();
  const mainBannerArrow = useRef();

  const introBoxRef = useRef();

  //수익률 계산기가 정삭적으로 끝났는지 확인하는 함수
  const [calcSucc, setCalcSucc] = useState(false);

  // 더많은상품보기버튼
  const sectionTMoreButton = useRef(null);

  let notice_list = props.notice_list;
  let media_list = props.media_list;

  const depositData = cs_list.deposit.data;

  const [pdfBlob, setPdfBlob] = useState(null)

  const [mobile, setMobile] = useState(false);

  const [coinRateArr, setCoinRateArr] = useState([]);



  useEffect(() => {
    let mWidth = window.matchMedia("screen and (max-width: 1250px)");
    if (mWidth.matches) {
      setMobile(true);
    } else {
      setMobile(false);
    }

    // fetch(ERDDrwo)
    //   .then(response => response.blob())
    //   .then(blob => setPdfBlob(blob));


    //코인 시세 api
    let coinRateApi = startInterval(async () => {
      let api_url = '/api/fetch/coin-rate';
      let obj = {
        method: 'GET',
      }
      let result = await apiFetch2(api_url, obj);

      let arr = [];
      if (result.success) {
        arr = result.list;
      } else {
        if (result.code == 1001) {
          alert('비정상적인 데이터 요청이 있었습니다. 나중에 다시 시도해주세요.')
        }
        arr = [];
      }

      setCoinRateArr(arr);
    });

    return () => clearInterval(coinRateApi);

  }, []);


  // const handleClick = (name = "인증서") => {
    // const blob = new Blob([pdfBlob], { type: 'application/pdf' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = name + '.pdf'; // 다운로드 파일 이름
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // URL.revokeObjectURL(url);
  // };

  function handleAmount(e) {
    const newValue = e.target.value;
    if (newValue < 0) {
      setAmount('');
    }
    else {
      setAmount(newValue);
    }
  }
  function handlePeriod(e) {
    const newValue = e.target.value;

    if (newValue > 12) {
      setPeriod(12);
    }
    else if (newValue < 0) {
      setPeriod('');
    }
    else {
      setPeriod(newValue);
    }
  }


  function calcPrice() {
    //이건 데모임
    // amount
    // period

    let pi = -1;

    for (let item of depositData.reverse()) {
      if (Number(item.period.substring(0, 1)) <= Number(period)) {
        pi = item;
        break;
      }
    }

    if (pi == -1) {
      persentRef.current.textContent = `?%`
      ethRef.current.textContent = `?ETH`
      setCalcSucc(false);
    } else {
      const getPrice = (Number(amount) / 100) * Number(pi.rate);
      persentRef.current.textContent = `${pi.rate}%`;
      ethRef.current.textContent = `${getPrice.toFixed(2)}ETH`;
      setCalcSucc(true)
    }

    depositData.reverse()
    // (amount/12)*period

  }

  useEffect(() => {

    movingArrowY(mainBannerArrow, 30);

    // 스크롤애니메이션 활성화함수
    AOS.init();
  }, []);

  // moveleftSection 
  const moveLeftOneRef = useRef(null);
  const moveLeftTwoRef = useRef(null);

  const moveContainerMouseOver = () => {
    moveLeftOneRef.current.style.cssText = `animation-play-state: paused;`;
    moveLeftTwoRef.current.style.cssText = `animation-play-state: paused;`;
  }

  const moveContainerMouseLeave = () => {
    moveLeftOneRef.current.style.cssText = `animation-play-state: running;`;
    moveLeftTwoRef.current.style.cssText = `animation-play-state: running;`;
  }

  useEffect(() => {
    moveLeftOneRef.current.addEventListener('mouseover', moveContainerMouseOver);
    moveLeftOneRef.current.addEventListener('mouseleave', moveContainerMouseLeave);
    moveLeftTwoRef.current.addEventListener('mouseover', moveContainerMouseOver);
    moveLeftTwoRef.current.addEventListener('mouseleave', moveContainerMouseLeave);
  }, []);


  // moveleftSection 
  const [index, setIndex] = useState(0);

  return (
    <>
      <Header login={session} name={props.name} />

      {/* --- main banner section --- */}
      <section className={styles.mainBannerSection}>
        <div className={styles.bgDiv}>
          <div>
            <div className={styles.titleBox}>
              <p className={styles.content}>
                {
                  index == 0 ?
                    <>
                      쉽고 편리한 <br />
                      예치 자산 관리
                    </> :
                    <>
                      신뢰할 수 있는<br />
                      블록체인 기반 서비스
                    </>
                }

              </p>
            </div>

            <Swiper
              navigation={true}
              pagination={true}

              breakpoints={{
                0: {
                  spaceBetween: 12,
                  direction: 'horizontal',
                  navigation: false
                },
                1250: {
                  spaceBetween: 60,
                  direction: 'vertical',
                },
              }}

              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}

              modules={[Navigation, Pagination, Autoplay]}
              className={`mainBannerSlide main ${styles.mainBannerSlide}`}

              onSlideChange={(e) => {
                setIndex(e.activeIndex)

              }}

            >
              <SwiperSlide className={styles.slide}>
                <div className={styles.mainContents}>
                  <Image src={imagePack.main.imgMainBanner1} alt='imgMainBanner1' />
                </div>


              </SwiperSlide >

              <SwiperSlide className={styles.slide}>
                <div className={styles.mainContents}>
                  <Image src={imagePack.main.imgMainBanner2} alt='imgMainBanner2' />
                </div>
              </SwiperSlide >

            </Swiper>


          </div>
        </div>
      </section>
      {/* --- End main banner section --- */}

      <Container width={"100%"} >

        {/* --- what we do section --- */}
        <section className={`sectionF ${styles.sectionF}`}>

          <div className={styles.titleBox} data-aos='fade-right' data-aos-delay="300" >
            <h1 className={styles.title}>What We Do</h1>
            <p className={styles.content}>
              저희는 개발 경험과 다양한 언어를 다를 줄 아는<br className={styles.mBr} />
              진정한 개발자들이 모여<br className={styles.wBr} /> 다양한 컴포넌트를 전문으로<br className={styles.mBr} />개발하고 있는 소프트웨어 개발 회사입니다.
            </p>
          </div>

          <div data-aos='fade-left' data-aos-delay='300'>

            <Swiper
              navigation={false}
              pagination={true}
              modules={[Navigation, Pagination, Autoplay]}

              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}

              breakpoints={{
                0: {
                  slidesPerView: 1,
                  spaceBetween: 50,
                },
                1250: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                  autoplay: false,
                },

              }}

              className={`mainBannerSlide ${styles.secIntroBox}`}
            >

              <SwiperSlide className={`${styles.slide}`}>
                <div className={styles.secIntroItem}>
                  <div className={styles.num}>01</div>
                  <Image src={imagePack.main.imgTrand} alt='imgTrand' />
                  <div className={styles.title}>트렌드 분석</div>
                  <div className={styles.contents}>고객의 니즈에 맞는<br className={styles.wBr} /> 서비스를 제공하기 위해<br />트렌드를 분석하고<br className={styles.wBr} /> 다양한 솔루션을 찾습니다.</div>
                </div>
              </SwiperSlide>
              <SwiperSlide className={`${styles.slide}`}>
                <div className={styles.secIntroItem}>
                  <div className={styles.num}>02</div>
                  <Image src={imagePack.main.imgUIUX} alt='imgUIUX' />
                  <div className={styles.title}>최적화된 UI/UX</div>
                  <div className={styles.contents}>고객의 편의성을 고려 후<br className={styles.wBr} /> UML 업무 플로우와<br />화면설계를 제작합니다.</div>
                </div>
              </SwiperSlide>
              <SwiperSlide className={`${styles.slide}`}>
                <div className={styles.secIntroItem}>
                  <div className={styles.num}>03</div>
                  <Image src={imagePack.main.imgDevelope} alt='imgDevelope' />
                  <div className={styles.title}>개발 및 지원</div>
                  <div className={styles.contents}>최고의 IT인프라를 구축하고<br className={styles.wBr} /> 플랫폼에 최적화 된<br className={styles.mBr} /> 서비스를<br className={styles.wBr} /> 개발하여 지원합니다.</div>
                </div>
              </SwiperSlide>

            </Swiper>

          </div>

        </section>
        {/* --- End what we do section --- */}
      </Container>


      <Container width={"100%"} backgroundColor={'#F6F7F9'}>

        {/* --- deposit product section --- */}
        <section className={styles.sectionT}>
          <div className={styles.leftBox} data-aos='fade-up' data-aos-duration="1200" >
            <h1 className={styles.title}>높은 수익률의<br className={styles.wBr} /> 예치상품</h1>
            <p className={styles.content}>잠들어있는 가상자산을 블링크를  통해<br /> 예치하여 수익을 얻으실 수 있습니다.</p>
            <span className={styles.moreButton} ref={sectionTMoreButton}  >
              <Link href={'/deposit'} onClick={() => {
                sectionTMoreButton.current.style.cssText = `
                  background-color : #8F00FF;
                  border : 2px solid #8F00FF;
                `;
              }}>더 많은 상품 둘러보기</Link>
            </span>
          </div>
          <div className={styles.rightBox} style={{ position: 'relative' }}>

            <Image src={imagePack.main.imgDepositMockup} alt='imgDepositMockup' className={styles.mockUpImg} />

            <div className={styles.depositCard} data-aos='fade-up' data-aos-duration="1200" data-aos-delay="300" >
              <div className={styles.fLine}>
                <div className={styles.titleBox} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Image src={imagePack.component.iconEthPurple} alt='' />
                  <div>
                    <h1 className={styles.title}>이더리움</h1>
                    <span className={styles.caption}>eth_12m_2301</span>
                  </div>
                </div>
                <button className={styles.insertButton}>예치신청</button>
              </div>

              <div className={styles.sLine}>
                <div className={styles.infoBox}>
                  <h1 className={styles.title}>예치기간</h1>
                  <span className={styles.content}>
                    12개월
                  </span>
                </div>

                <div className={styles.infoBox}>
                  <h1 className={styles.title}>연이율</h1>
                  <span className={styles.content}>
                    16%
                  </span>
                </div>

                <div className={styles.infoBox}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h1 className={`${styles.title} ${styles.wWidth}`}>최소수량</h1>
                    <span className={`${styles.content} ${styles.mFontSize}`}>
                      1 ETH
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h1 className={`${styles.title} ${styles.wWidth}`}>총 수량</h1>
                    <span className={`${styles.content} ${styles.mFontSize}`}>
                      500 ETH
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className={styles.depositCard} data-aos='fade-up' data-aos-duration="1200" data-aos-delay="500">
              <div className={styles.fLine}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Image src={imagePack.component.iconEthPurple} alt='' />
                  <div>
                    <h1 className={styles.title}>이더리움</h1>
                    <span className={styles.caption}>eth_06m_2301</span>
                  </div>
                </div>
                <button className={styles.insertButton}>예치신청</button>
                {/* <button className={styles.insertButton} type={'end'}>신청마감</button> */}
              </div>

              <div className={styles.sLine}>
                <div className={styles.infoBox}>
                  <h1 className={styles.title}>예치기간</h1>
                  <span className={styles.content}>
                    6개월
                    {/* <span>ETH</span> */}
                  </span>
                </div>

                <div className={styles.infoBox}>
                  <h1 className={styles.title}>연이율</h1>
                  <span className={styles.content}>
                    12%
                  </span>
                </div>

                <div className={styles.infoBox}>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h1 className={`${styles.title} ${styles.wWidth}`}>최소수량</h1>
                    <span className={`${styles.content} ${styles.mFontSize}`}>
                      1 ETH
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <h1 className={`${styles.title} ${styles.wWidth}`}>총 수량</h1>
                    <span className={`${styles.content} ${styles.mFontSize}`}>
                      500 ETH
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
        {/* --- End deposit product section --- */}

      </Container>

      <Container width={"100%"} backgroundColor={'#F6F7F9'}>

        {/* --- calculator section --- */}
        <section className={styles.sectionFo}>
          <div className={styles.sectionTitle}>
            수익률 계산기
          </div>
          <div className={styles.depositProductText}>
            블링크에 가상자산을 예치하여<br className={styles.mBr} /> 높은 수익률을 얻으실 수 있습니다.
          </div>
          <div className={styles.interestRateCalc}>
            <div className={styles.inputDiv}>
              <input type='number' min={0} placeholder='0' value={amount} onChange={handleAmount} />
              <span>이더리움(ETH)을 </span>
              <input type='number' min={0} max={12} placeholder='0' value={period} onChange={handlePeriod} />
              <span>개월 간 보관하면?</span>
            </div>
            <div className={styles.calcBtn} onClick={calcPrice}>수익률 계산하기</div>
          </div>

          <div className={styles.alertTextBox}>
            <div className={styles.alertText}><Image src={imagePack.component.iconAlert} className={styles.iconAlert} alt='iconAlert' /> 원하시는 정보를 입력하신 후, 예상 계산결과를 확인하세요.</div>
            <div className={styles.calcBox}>
              <div className={styles.calcText}>
                <div>고객님의 계좌속에 잠들어있는<br />이더리움(ETH)을 블링크를 통해 예치한다면 ? </div>
                <div>최대 이율<span className={`${!calcSucc ? styles.grayFt : ''}`} ref={persentRef}>?%</span> 적용시 <br className={styles.mBr} /><br className={styles.mBr} />총<span className={`${!calcSucc ? styles.grayFt : ''}`} ref={ethRef}>?ETH</span>를 모을 수 있습니다.</div>
              </div>
            </div>
          </div>
        </section>
        {/* --- End calculator section --- */}

      </Container>


      <Container width={"100%"} >

        {/* --- coin rate section --- */}
        <section className={styles.sectionSi}>

          <div className={styles.partOne} ref={moveLeftOneRef}>
            {

              coinRateArr.map((p, index) => (
                <div className={styles.priceCard} key={index}>
                  <div className={styles.fBox}>
                    {
                      p.acro == 'ETH' ?
                        <Image src={imagePack.main.iconLivePriceETH_m} alt='iconLivePriceETH_m' /> :
                        p.acro == 'BTC' ?
                          <Image src={imagePack.main.iconLivePriceBTC_m} alt='iconLivePriceBTC_m' /> :
                          p.acro == 'XRP' ?
                            <Image src={imagePack.main.iconLivePriceXRP_m} alt='iconLivePriceXRP_m' /> : <></>
                    }
                    <div className={styles.priceName}>
                      <span className={styles.name}>{p.name}</span>
                      <span className={styles.acro}>{p.acro}</span>
                    </div>
                  </div>
                  <div className={styles.priceBox}>
                    <h1 className={styles.price}>{numberFormat(p.price.toString(), true, true, true)}</h1>
                    <span className={styles.persent} type={p.vary == '-' ? 'minus' : ''}>{p.vary}{p.rate}%</span>
                  </div>
                </div>
              ))
            }

          </div>

          <div className={styles.partTwo} ref={moveLeftTwoRef}>
            {
              coinRateArr.map((p, index) => (
                <div className={styles.priceCard} key={index}>
                  <div className={styles.fBox}>
                    {
                      p.acro == 'ETH' ?
                        <Image src={imagePack.main.iconLivePriceETH_m} alt='iconLivePriceETH_m' /> :
                        p.acro == 'BTC' ?
                          <Image src={imagePack.main.iconLivePriceBTC_m} alt='iconLivePriceBTC_m' /> :
                          p.acro == 'XRP' ?
                            <Image src={imagePack.main.iconLivePriceXRP_m} alt='iconLivePriceXRP_m' /> : <></>
                    }
                    <div className={styles.priceName}>
                      <span className={styles.name}>{p.name}</span>
                      <span className={styles.acro}>{p.acro}</span>
                    </div>
                  </div>
                  <div className={styles.priceBox}>
                    <h1 className={styles.price}>{numberFormat(p.price.toString(), true, true, true)}</h1>
                    <span className={styles.persent} type={p.vary == '-' ? 'minus' : ''}>{p.vary}{p.rate}%</span>
                  </div>
                </div>
              ))
            }

          </div>

        </section>
        {/* --- End coin rate section --- */}


        {/* --- security section --- */}
        <section className={`sectionSe ${styles.sectionSe}`}>
          <h1 className={styles.title} data-aos='fade' data-aos-duration="500" data-aos-delay="300">신뢰할 수 있는 보안</h1>

          {
            mobile ? (
              <div data-aos='fade-down' data-aos-duration="1000" data-aos-delay="500">
                <Swiper
                  navigation={false}
                  spaceBetween={340}
                  pagination={true}
                  modules={[Navigation, Pagination, Autoplay]}

                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}

                  className={`mainBannerSlide ${styles.securityBox}`}
                >

                  <SwiperSlide className={`${styles.slide}`}>
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgMonitoring} alt='imgMonitoring' />
                      <div className={styles.textBox}>
                        <div className={styles.title}>Real Time Monitoring</div>
                        <div className={styles.content}>실시간으로 모든 거래, 출금 및 인증 설정을<br /> 실시간 모니터링 하여 고객의 자산을<br /> 안전하게보호합니다.</div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className={`${styles.slide}`}>
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgKey} alt='imgKey' />
                      <div className={styles.textBox}>
                        <div className={styles.title}>Advanced Data Encryption</div>
                        <div className={styles.content}>모든 거래데이터는 End-To-End 암호화를<br /> 통해 엄격하게 접근 통제하며, 스토리지 내부의<br /> KYC정보를 포함한 사용자 데이터 및 개인정보를<br /> 업계 최고 수준의 암호화로 보호합니다.</div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className={`${styles.slide}`}>
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgSecurity2} alt='imgSecurity2' />
                      <div className={styles.textBox}>
                        <div className={styles.title}>Organizational Security</div>
                        <div className={styles.content}>블링크 자산은 다중서명, TSS(Thresold<br /> Signature Scheme) 등을 포함한 보안 조치<br /> 시스템을 갖추고 있어 위험으로 부터 고객<br /> 자산의 안정과 무결성을 보장합니다.</div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className={`${styles.slide}`}>
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgColdWallet} alt='imgColdWallet' />
                      <div className={styles.textBox}>
                        <div className={styles.textBox}>
                          <div className={styles.title}>Security Cold Wallet</div>
                          <div className={styles.content}>고객의 자산 대부분은 오프라인 콜드월렛에<br /> 안전하게 분리 보관되어 보안성이 높으며,<br /> 해킹으로 인한 분실 위험이 낮습니다.</div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>

                </Swiper>
              </div>

            ) : (

              <div>
                <div className={styles.securityBox}>
                  <div className={styles.contentBoxCover} data-aos='fade-down' data-aos-duration="1000" data-aos-delay="500">
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgMonitoring} alt='imgMonitoring' />
                      <div className={styles.textBox}>
                        <div className={styles.title}>Real Time Monitoring</div>
                        <div className={styles.content}>실시간으로 모든 거래, 출금 및 인증 설정을<br />모니터링 하여 고객의 자산을 안전하게<br />보호합니다.</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.contentBoxCover} data-aos='fade-down' data-aos-duration="1000" data-aos-delay="500">
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgKey} alt='imgKey' />
                      <div className={styles.textBox}>
                        <div className={styles.title}>Advanced Data Encryption</div>
                        <div className={styles.content}>모든 거래데이터는 End-To-End 암호화를 통해 엄격하게 접근 통제하며,<br />스토리지 내부의 KYC정보를 포함한 사용자 데이터 및 개인정보를 업계<br />최고 수준의 암호화로 보호합니다.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.securityBox} style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                  <div className={styles.contentBoxCover} data-aos='fade-down' data-aos-duration="1000" data-aos-delay="300">
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgSecurity2} alt='imgSecurity2' />
                      <div className={styles.textBox}>
                        <div className={styles.title}>Organizational Security</div>
                        <div className={styles.content}>블링크 자산은 다중서명, TSS(Thresold Signature Scheme) 등을<br />포함한 보안 조치 시스템을 갖추고 있어 위험으로 부터 고객 자산의<br />안정과 무결성을 보장합니다.</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.contentBoxCover} data-aos='fade-down' data-aos-duration="1000" data-aos-delay="300">
                    <div className={styles.contentBox} >
                      <Image src={imagePack.main.imgColdWallet} alt='imgColdWallet' />
                      <div className={styles.textBox}>
                        <div className={styles.textBox}>
                          <div className={styles.title}>Security Cold Wallet</div>
                          <div className={styles.content}>고객의 자산 대부분은 오프라인 콜드월렛에<br />안전하게 분리 보관되어 보안성이 높고,<br />해킹으로 인한 분실 위험이 낮습니다.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

        </section>
        {/* --- End security section --- */}

      </Container>

      <Container width={"100%"} backgroundColor={'#F6F7F9'} borderRadius={mobile ? '0 6.25rem 0 0' : '0 26.25rem 0 0'}>

        {/* --- virtual assets manager section --- */}
        <section className={styles.sectionEi}>
          <div className={styles.textBox} data-aos="fade-up" data-aos-duration="500">
            <h1 className={styles.title}>
              쉽고 간단한<br className={styles.wBr} /> 가상자산 관리
            </h1>
            <p className={styles.content}>

              블링크에서는 출금지갑 속 가상자산 잔액,<br />
              지갑에서 바로 출금 가능한 자산 잔액,<br />
              예치중인 상품을 한눈에 확인 하실 수 있습니다.
            </p>
          </div>

          <div className={styles.phoneBox} data-aos="fade-up" data-aos-duration="500" data-aos-delay="500">

            <Image src={imagePack.main.imgDepositMockup2} alt='imgDepositMockup2' className={styles.mockUpImg} />

            <div className={styles.slideBox} >

              <Swiper
                className={styles.mySwiper2}
                allowTouchMove={false}
                spaceBetween={40}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                speed={100}
                effect={"fade"}
                fadeEffect={{ crossFade: true }}
                loop={true}
                // touchRatio={0}
                modules={[Autoplay, EffectFade]}
              >
                <SwiperSlide className={styles.slide}>
                  <div>내자산 한눈에<br />파악하기</div>
                </SwiperSlide>
                <SwiperSlide className={styles.slide}>
                  <div>높은 이율의<br />예치상품</div>
                </SwiperSlide>
                <SwiperSlide className={styles.slide}>
                  <div>안전하게 관리하는<br />내 가상자산</div>
                </SwiperSlide>
              </Swiper>


              <Swiper
                allowTouchMove={false}
                className={styles.mySwiper}
                spaceBetween={40}
                fadeEffect={{ crossFade: true }}
                effect={"fade"}
                speed={100}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                loop={true}
                touchRatio={0}
                modules={[Autoplay, EffectFade]}
              >
                <SwiperSlide className={styles.slide}>
                  <div className={`${styles.slideContents} ${styles.depositProduct}`}>
                    <div className={styles.slideContentsItem}>
                      <div>
                        <div className={styles.imgCircle}>
                          <Image src={imagePack.component.iconEthWhite} alt='iconEthWhite' />
                        </div>
                        <div className={styles.title}>총 자산</div>
                      </div>
                      <div className={styles.contents}>100 <span>ETH</span></div>
                    </div>
                    <div className={styles.slideContentsItem}>
                      <div>
                        <div className={styles.imgCircle}>
                          <Image src={imagePack.component.iconWalletWhite} alt='iconWalletWhite' />
                        </div>
                        <div className={styles.title}>출금가능 자산</div>
                      </div>
                      <div className={styles.contents}>2 <span>ETH</span></div>
                    </div>
                    <div className={styles.slideContentsItem}>
                      <div>
                        <div className={styles.imgCircle}>
                          <Image src={imagePack.main.iconChartDounut} alt='iconChartDounut' />
                        </div>
                        <div className={styles.title}>예치중인 상품</div>
                      </div>
                      <div className={styles.contents}>3 <span>건</span></div>
                    </div>

                  </div>
                </SwiperSlide>

                <SwiperSlide className={styles.slide}>
                  <div className={`${styles.slideContents} ${styles.ethCard}`}>
                    <div className={styles.slideContentsItem}>
                      <div>
                        <Image src={imagePack.main.iconEthGradation} alt='iconEthGradation' />
                        <div className={styles.title}>
                          <div>이더리움</div>
                          <div>eth_12m_2301</div>
                        </div>
                      </div>
                      <div className={styles.yearRate}>
                        <div>연이율</div>
                        <div>16 <span>%</span></div>
                      </div>
                    </div>

                    <div className={styles.progressDiv}>
                      <div className={styles.slideContentsItem}>
                        <div>예치 진행률</div>
                        <div className={styles.contents}>80%</div>
                      </div>
                      <div className={styles.rateBar}>
                        <div className={styles.rate}></div>
                      </div>
                      <div className={styles.dueDate}>만기일:20**.03.13</div>
                    </div>

                    <div className={styles.button}>예치신청</div>

                  </div>
                </SwiperSlide>

                <SwiperSlide className={styles.slide}>
                  <div className={`${styles.slideContents} ${styles.myAccount}`} style={{ justifyContent: 'inherit' }}>
                    <div className={styles.slideContentsItem}>
                      <div>
                        <Image src={imagePack.main.iconStar} alt='iconStar' />
                        <div className={styles.title}>블링크님의 계좌</div>
                      </div>
                      <div className={styles.history}>입출금내역</div>
                    </div>

                    <div>
                      100,000,000 ETH
                    </div>

                    <div className={styles.account}>
                      <div>
                        <Image src={imagePack.main.iconHandCoin} alt='iconHandCoin' />
                        <div>입금</div>
                      </div>
                      <div>
                        <Image src={imagePack.main.iconCashOut} alt='iconCashOut' />
                        <div>출금</div>
                      </div>
                      <div>
                        <Image src={imagePack.main.iconNoteFile} alt='iconNoteFile' />
                        <div>내역</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>

              </Swiper>
            </div>

          </div>
        </section>
        {/* --- End virtual assets manager section --- */}

      </Container>


      {/* <div className={styles.sectionSContainer}>

        <section className={styles.sectionS}>


          <div className={styles.textConainer}>
            <p className={styles.text1}>
              인증 라이선스
            </p>
            <p className={`${styles.text2} ${styles.mt33}`}>
              블링크는 국가에서 주관하는 정보보호 및<br className={styles.wBr} />
              개인정보<br className={styles.mBr} /> 관리체계 인증과 금융당국이<br className={styles.wBr} />
              주도하는<br className={styles.mBr} /> 가상자산사업자(VASP) 수리를<br className={styles.wBr} />
              완료 하였습니다.
            </p>
          </div>

          <div className={styles.logoContainer}>

            <div className={styles.oneLogoBox}>
              <div className={styles.logoBox}>
                <Image alt='img1' className={styles.img1} src={imagePack.main.imgISMSColor2} onClick={() => { handleClick() }} />
              </div>

              <div className={`${styles.infoText} ${styles.mt28}`}>
                <p>
                  &#60;ISMS-P&#62;<br />
                  인증범위 : 가상자산 예치 서비스운영<br />
                  유효기간 : 23.07.01 - 26.06.30
                </p>
              </div>
            </div>

            <div className={`${styles.oneLogoBox} ${styles.ml64}`}>
              <div className={styles.logoBox}>
                <Image alt='img2' className={styles.img2} src={imagePack.main.kCer} onClick={() => { handleClick() }} />
              </div>

              <div className={`${styles.infoText} ${styles.mt28}`}>
                <p>
                  &#60;가상자산사업자&#62;<br />
                  시행일자 : 23.07.01 - 26.06.30
                </p>
              </div>
            </div>

          </div>


        </section>

      </div> */}


      <Container>

        {/* --- media section --- */}
        <section className={styles.sectionFi}>
          <div className={styles.mediaDiv}>
            <div>
              <div className={styles.mediaTitle}>
                <div>공지사항</div>
                <div><Link href={'/cs/notice?type=important'}>바로가기 <Image src={imagePack.component.iconRight2} style={{ marginLeft: '0.75rem' }} alt='iconRight2' /></Link></div>
              </div>
              <div className={styles.bar} />
              <div>
                {
                  (notice_list && notice_list.length !== 0) ? notice_list.map((m, index) => (
                    <Link href={`/cs/notice/0/${m.idx}`} key={index}>
                      <div className={styles.mediaList}>
                        <div>{m.title}</div>
                        <div>{m.date}</div>
                      </div>
                    </Link>
                  )) :
                    <div className={styles.mediaList} style={{ cursor: 'inherit' }}>현재 게시중인 공지사항이 없습니다.</div>
                }
              </div>
            </div>
            <div>
              <div className={styles.mediaTitle}>
                <div>미디어</div>
                <div><Link href={'/media/blink-news'}>바로가기 <Image src={imagePack.component.iconRight2} style={{ marginLeft: '0.75rem' }} alt='iconRight2' /></Link></div>
              </div>
              <div className={styles.bar} />
              <div>
                {
                  (media_list && media_list.length !== 0) ? media_list.map((m, index) => (
                    <Link href={`/media/blink-news/${m.idx}`} key={index}>
                      <div className={styles.mediaList}>
                        <div>{m.title}</div>
                        <div>{m.date}</div>
                      </div>
                    </Link>
                  )) :
                    <div className={styles.mediaList} style={{ cursor: 'inherit' }}>현재 게시중인 블링크 소식이 없습니다.</div>
                }
              </div>
            </div>
          </div>
        </section>
        {/* --- End media section --- */}
      </Container>

      <Footer />

    </>
  )
}

export const getServerSideProps = withSessionSsr(async function ({ req, res }) {
  let session = req.session.user;
  let email = '';
  let name = '';

  if (session) {

    let user_info = await MemberInquiry(session.email, session.token);

    if (user_info.hasOwnProperty('redirect')) {
      req.session.destroy();
    } else {
      email = await maskingEmail(session.email);
      name = user_info.data.members.name;
    }
  }

  let method = 'GET';

  let notice_list = cs_list.cs_list.notice.important.slice(0, 4); //api 붙이면 빈배열로 변경
  let media_list = cs_list.cs_list.notice.important.slice(0, 4); //api 붙이면 빈배열로 변경

  // let notice_result = await apiFetch(configs.notices_get_inquiry, method);
  // let media_result = await apiFetch(configs.blinknews_get_inquiry, method);

  // if (notice_result.success) {
  //   notice_list = notice_result.list;
  // } else {
  //   console.log(notice_result);
  //   notice_list = [];
  // }

  // if(media_result.success) {
  //   media_list = media_result.list;
  // } else {
  //   console.log(media_result);
  //   media_list = [];
  // }


  return {
    props: {
      session: email,
      notice_list: notice_list,
      media_list: media_list,
      name: name
    },
  };

});