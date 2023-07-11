import path from "path";
import fs from "fs";
import makeFolder from "@/functions/makeFolder";
import NextCors from "nextjs-cors";
import checkNomalApi from "@/functions/checkNomalApi";

/**
 * 이미지 수정, 삭제
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export default async function handler(req, res) {
    // checkNomalApi(req);

    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });
    
    
    const url_params = req.query.idx; //게시물 idx
    const img_type = req.body.img_type; //게시물 타입(공지사항, 블링크소식, 1:1문의 등)


    if (req.method === 'POST') { //이미지 temp파일에서 게시물 idx 폴더로 옮기기
        const img_arr = req.body.img_arr;


        let folder = path.join(__dirname, '../../../../../', `public/images/editor/${img_type}/${url_params}`);
        await makeFolder(folder);

        img_arr.map(f => {
            replaceImages(img_type, url_params, f);
        })

        return res.json({ sucess: true });


    } else if (req.method === 'PUT') { //이미지 수정
        const img_arr = req.body.img_arr;

        //새로운 이미지가 있는지 확인
        if (img_arr.length == 0) { //이미지가 없다면 해당 폴더도 삭제
            try {
                await deleteFolder(img_type, url_params);
            } catch (err) {
                return res.json({ sucess: false });
            }

        } else {
            let new_arr;
            try {
                new_arr = await deleteImages(img_type, url_params, img_arr);

                //새로운 이미지를 temp파일에서 옮기기
                new_arr.map(async (f) => {
                    await replaceImages(img_type, url_params, f);
                })
            } catch (err) {
                return res.json({ success: false });
            }

        }

        return res.json({ sucess: true });


    } else if (req.method === 'PATCH') { //이미지 삭제

        //게시물 삭제로 인한 이미지 영구 삭제 (폴더까지 삭제)
        try {
            await deleteFolder(img_type, url_params);
        } catch (err) {
            return res.json({ sucess: false });
        }

        return res.json({ sucess: true });

    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}



/**
 * 폴더와 이미지 삭제
 * @param {*} type 게시물 타입
 * @param {*} idx 게시물 idx
 * @returns 
 */
function deleteFolder(type, idx) {
    return new Promise((resolve, reject) => {

        const file_path = path.join(__dirname, '../../../../../', `public/images/editor/${type}/${idx}`);

        if (fs.existsSync(file_path)) {
            try {
                fs.rmSync(file_path, { recursive: true });
            } catch (err) {
                reject(err);
            }
        }
        resolve(true);
    });
}


/**
 * 폴더 하위 이미지 삭제
 * @param {*} type 게시물 타입
 * @param {*} idx 게시물 idx 
 * @param {*} arr 수정된 게시물의 이미지 이름 배열
 * @returns 
 */
function deleteImages(type, idx, arr) {
    return new Promise((resolve, reject) => {

        let new_arr = arr;

        try {
            const folder_path = path.join(__dirname, '../../../../../', `public/images/editor/${type}/${idx}`);

            let filelist = fs.readdirSync(folder_path);

            if (filelist.length !== 0) {

                for (let j = 0; j < filelist.length; j++) { //기존 이미지
                    //기존이미지랑 새로운 arr과 비교해서 중복되는거 제외하고 삭제하기

                    for (let i = 0; i < new_arr.length; i++) {

                        if (filelist[j] == new_arr[i]) {
                            new_arr.splice(i, 1);
                            filelist.splice(j, 1);
                            i--;
                            j--;

                            break;
                        }

                    }
                }

                if (filelist.length !== 0) {
                    filelist.map(f => {
                        let file_path = path.join(folder_path, `/${f}`);

                        try {
                            fs.unlinkSync(file_path);
                        } catch (err) {
                            reject(err)
                        }
                    })
                }
            }

        } catch (err) {
            reject(err);
        }

        resolve(new_arr);

    });
}


/**
 * temp파일에서 새로운 폴더로 이미지 이동
 * @param {*} type
 * @param {*} idx 
 * @returns 
 */
function replaceImages(type, idx, img_name) {
    return new Promise((resolve, reject) => {
        let old_path = path.join(__dirname, '../../../../../', `public/images/editor/temp/${img_name}`);
        let new_path = path.join(__dirname, '../../../../../', `public/images/editor/${type}/${idx}/${img_name}`);

        let exist = fs.existsSync(old_path);
        if (exist) {
            try {
                fs.renameSync(old_path, new_path);
            } catch (err) {
                console.log(err)
                reject(err);
            }
        } 

        resolve(true);
    })
}