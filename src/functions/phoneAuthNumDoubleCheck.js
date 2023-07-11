import getConfig from "next/config";

/**
 * 휴대폰 인증 더블체크
 * @param {*} to 
 * @param {*} code 
 * @returns 
 */
export default async function phoneAuthNumDoubleCheck(to, code) {
    const { serverRuntimeConfig } = getConfig();
    const { phoneAuthMap } = serverRuntimeConfig;

    let current = new Date();
    let current_timestamp = current.getTime();
    let diffTime;

    phoneAuthMap.forEach((v, k, map) => {
        diffTime = (current_timestamp - phoneAuthMap.get(k).timestamp) / (1000 * 60);

        if(diffTime > 10) { //유효시간 만료
            phoneAuthMap.delete(k);
        }
    });

    let phoneAuthData = phoneAuthMap.get(to);

    if(phoneAuthData) {
        if(phoneAuthData.code == code) {
            phoneAuthMap.delete(to);
            return true;
        } else {
            phoneAuthMap.delete(to);
            return false;
        }
    } else {
        return false;
    }
}