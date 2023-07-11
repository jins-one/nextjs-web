import configs from "@/configs/configs";
import fs from "fs";
import path from "path";

/**
 * 웹 서버 로그파일 생성
 * @param {*} ip 클라이언트 ip
 * @param {*} user 유저 이메일 (일부 가려진)
 * @param {*} method 행위 (메소드, url 오브젝트 배열)
 * @param {*} url api 주소
 * @param {*} code http code
 */
export default function insertLogs(ip, user, method, url, code) {
    let current = new Date();
    let year = current.getFullYear().toString().padStart(2, '0');
    let month = (current.getMonth() + 1).toString().padStart(2, '0');
    let date = current.getDate().toString().padStart(2, '0');

    let hour = current.getHours().toString().padStart(2, '0');
    let min = current.getMinutes().toString().padStart(2, '0');
    let seconds = current.getSeconds().toString().padStart(2, '0');

    let today = `${year}-${month}-${date}`;
    let time = hour + ':' + min + ':' + seconds;


    let file_name = today + '.log';
    let log = (code?'res--':'req--') + `[${today} ${time}] (${ip}) ${method} ${url}`+ (code?`, ${code}`:'') + (user && ', ') + user;

    let dir = path.join(configs.logDir, `/${file_name}`);

    try {
        if (!fs.existsSync(dir)) {
            fs.writeFileSync(dir, log);
        } else {
            // console.log(fs.statSync(dir).size)

            log = '\n' + log;
            fs.appendFileSync(dir, log);
        }

    } catch (err) {
        console.log(err);
        return false;
    }

    return true;

}
