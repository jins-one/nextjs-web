import checkNomalApi from "@/functions/checkNomalApi";
import saveImage from "@/functions/images/saveImage";
import NextCors from "nextjs-cors";

/**
 * 이미지 저장
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


    if (req.method === 'POST') { //이미지 저장
        
        saveImage(req, res, (err) => {

            if (err) {
                console.log(err)
                return res.status(500).json({ error: err.message });
            } else {

                if (req.fileValidationError) {
                    return res.json({ success: false, msg: req.fileValidationError });
                } else {
                    return res.status(200).json({ success: true });
                }

            }

        });

    }  
    else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}


export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    }
}