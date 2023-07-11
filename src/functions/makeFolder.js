import fs from "fs";

/**
 * 해당 폴더가 없을 때 폴더를 만드는 함수
 * @param {*} dir 폴더 경로
 */
export default async function makeFolder(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    return;
}   