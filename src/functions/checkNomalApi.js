import getConfig from "next/config";
import configs from "@/configs/configs";

const checkNomalApi = (req)=>{
    const clientIp = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '1.1.1.1';

    const { serverRuntimeConfig } = getConfig();
    const { nomalIpList, ipBlackList } = serverRuntimeConfig;

    const date = new Date();
    const timestamp = date.getTime();
    const sec = 1;

    // console.log('ipBlackList', ipBlackList)
    // console.log('nomalIpList', nomalIpList.get('1.1.1.1'))
    
    // 블랙리스트 확인
    if(ipBlackList.get(clientIp)){

        const time = ipBlackList.get(clientIp).timestamp;
        const today = new Date();
        const nowTime = today.getTime();
        // const nowTime = Math.trunc((today.getTime() - time) / 1000);

        if(nowTime > time+configs.clearBlackListTime){
            // 10분지남
            ipBlackList.delete(clientIp);

            nomalIpList.set(clientIp, {
                timestamp,
                count : 1,
            });

            return { success : true, code : '0001' }
        }else {
            return { success : false, code : '1001' };
        }

    }else {
        // 기존 클라 ip 존재
        if(nomalIpList.get(clientIp)){

            const time = nomalIpList.get(clientIp).timestamp;
            const count = nomalIpList.get(clientIp).count;

            // 시간체크
            const today = new Date();
            const nowTime = (today.getTime() - time) / 1000
            // const nowTime = Math.round((today.getTime() - time) / 1000);

            
            // 1초 지난경우
            if(nowTime > sec){
                nomalIpList.delete(clientIp);

                // 다시 세팅 스코프달라서 상관없음
                const date = new Date();
                const timestamp = date.getTime();

                // ip없음(처음 상태)
                nomalIpList.set(clientIp, {
                    timestamp,
                    count : 1,
                });

                return { success : true };

            }else {
                if(count > configs.blackListLimitCount){
                    // 1초안에 10번 넘게 api 쏴버림
                    nomalIpList.delete(clientIp);
                    // 블랙리스트에 타임이랑 카운트 저장
                    ipBlackList.set(clientIp,{
                        timestamp,
                        count
                    });

                    // 이번까지만 봐준다. 하지만 에러코드는 넘기기
                    return { success : true, code : '1002' };

                }else {
                    //api 카운트
                    const reCount = count+1;
                    nomalIpList.set(clientIp, {
                        timestamp : time,
                        count : reCount
                    });

                    return { success : true };
                }
            }
        }else {
            // ip없음(처음 상태)
            nomalIpList.set(clientIp, {
                timestamp,
                count : 1,
            });

            return { success : true };
        }
    }
}

export default checkNomalApi;