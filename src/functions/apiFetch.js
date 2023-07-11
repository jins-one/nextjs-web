import insertLogs from "./logs";

/**
 * fetch 함수
 * @param {*} url
 * @param {*} method 
 * @param {*} body body data
 */
export default async function apiFetch(url, method, body) {
    
    let user_email = '';

    let res;
    try {
        res = await fetch(url, {
            method: method,
            body: JSON.stringify(body)
        })
    } catch (err) {
        return false;
    }
    
    let result = await res.json();

    // if(result.user_email) {
    //     user_email = await maskingEmail(result.user_email);
    // } else if(body && body.email){
    //     user_email = await maskingEmail(body.email);
    // } else {

    // }
    
    // let client_ip = await getIPAddress();
    // await insertLogs(client_ip, user_email, method, res.url, res.status);
    
    if (result.success) {
        return result;
    } else {
        return false;
    }

}


/**
 * 클라이언트 ip주소 찾기
 * @returns 
 */
async function getIPAddress() {

    let res;
    try {
        res = await fetch('https://ifconfig.me/all.json').then(response => response.json());
    } catch (err) {
        return false;
    }

    return res.ip_addr;
};


/**
 * 이메일 마스킹
 * @param {*} email 
 * @returns 
 */
async function maskingEmail(email) {
    let len = email.split('@')[0].length;
    let front;
    if(len > 4) {
        front = email.split('@')[0].length - 4;
    } else {
        front = email.split('@')[0].length - 2;
    }

    return email.replace(new RegExp('.(?=.{0,' + front + '}@)', 'g'), '*');
}