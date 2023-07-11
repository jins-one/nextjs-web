import { useState, useEffect } from "react";
import { ResponsiveRadialBar } from '@nivo/radial-bar';
import { ResponsivePie } from '@nivo/pie';
import numberFormat from "@/functions/numberFormat";

import styles from '@/styles/pages/assets.module.css';

export default function DepositChart({ data }) {
    //깊은복사
    const newTodos = JSON.parse(JSON.stringify(data));
    const [realData, setRealData] = useState(() => {
        return JSON.parse(JSON.stringify(data));
    });

    const [color, setColor] = useState('#8F00FF');
    const [type, setType] = useState('총 예치자산');
    const [value, setValue] = useState(
        () => {
            let a = 0;
            for (let i = 0; i < realData.length; i++) {
                a += realData[i].value;
            }
            return numberFormat(a.toString(), false, true, true);
        }
    )

    // 예치 중인 상품이 한개도 없음을 확인
    const [totalZero, setTotalZero] = useState(() => {
        let a = 0;
        for (let i = 0; i < realData.length; i++) {
            a += realData[i].value;
        }
        if (a === 0) {
            return true;
        } else {
            return false;
        }
    });

    // 모바일인지 확인
    const [mobile, setMobile] = useState(false);

    useEffect(() => {
        let mWidth = window.matchMedia("screen and (max-width: 1250px)");
        if (mWidth.matches) {
            setMobile(true);
        } else {
            setMobile(false);
        }
    }, []);

    useEffect(() => {

        setRealData((p) => {
            let arr = [...p];
            for (let i = 0; i < arr.length; i++) {
                arr[i].value = 0;
            }
            return arr;
        });

        setTimeout(() => {
            setRealData((p) => {
                let arr = [...p];

                for (let i = 0; i < arr.length; i++) {
                    if (totalZero) {
                        arr[i].value = 1;
                    } else {
                        arr[i].value = newTodos[i].value;
                    }
                }

                return arr;
            });
        }, 300);

    }, []);

    return (
        <>
            <div className={styles.chartRatioText}>
                {/* <Image src={imagePack.header.logo} alt={'logo'} /> */}
                <div style={{ color: color }}>{type}</div>
                <div>
                    <span>{value}</span>
                    <span>ETH</span>
                </div>
            </div>

            <ResponsivePie
                data={realData}
                margin={{ top: !mobile?10:0, right: !mobile?10:0, bottom: !mobile?10:0, left: !mobile?10:0 }}
                startAngle={90}
                endAngle={-360}
                animate={true}
                innerRadius={0.9}
                cornerRadius={45}
                // activeInnerRadiusOffset={2}
                // activeOuterRadiusOffset={2}

                colors={['#8F00FF', '#FF9AC4', '#B0D0FF', '#F8D43F', '#F99370']}
                enableArcLinkLabels={false}
                enableArcLabels={false}

                onMouseEnter={(n, e) => {

                    if (!mobile) {
                        let opacity_color;
                        if (n.color == '#8F00FF') {
                            opacity_color = 'rgba(143, 0, 255, 0.5)';
                        } else if (n.color == '#FF9AC4') {
                            opacity_color = 'rgba(255,154,196,0.7)';
                        } else if (n.color == '#B0D0FF') {
                            opacity_color = 'rgba(176,208,255,0.8)'
                        } else if (n.color == '#F8D43F') {
                            opacity_color = 'rgba(248,212,63,0.7)'
                        } else if (n.color == '#F99370') {
                            opacity_color = 'rgba(249, 147, 112, 0.7)'
                        }

                        e.target.style.cursor = 'pointer';
                        e.target.style.filter = `drop-shadow(0px 4px 10px ${opacity_color})`
                        e.target.style.transition = 'filter .4s';
                    }

                    setType(n.id);
                    setValue(() => {
                        if (totalZero) {
                            return 0;
                        } else {
                            return numberFormat(n.value.toString(), false, true, true)
                        }
                    });
                    setColor(n.color);
                }}

                onMouseLeave={(n, e) => {
                    if (!mobile) {
                        e.target.style.filter = 'none'
                    }

                    setType('총 예치자산');
                    setValue(() => {
                        let a = 0;
                        for (let i = 0; i < realData.length; i++) {
                            if (totalZero) {
                                a = 0;
                            } else {
                                a += realData[i].value;
                            }
                        }
                        return numberFormat(a.toString(), false, true, true);
                    });
                    setColor('#8F00FF');
                }}

                tooltip={(item) => {
                    return (
                        <>
                        </>
                    )
                }}

            />

        </>
    );
}