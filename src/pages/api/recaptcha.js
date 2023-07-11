import configs from "@/configs/configs";
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";

import getConfig from "next/config";

async function getSession(req, res) {
    // checkNomalApi(req);

    let body = JSON.parse(req.body);
    let token = body.token;

    let api_url = "https://www.google.com/recaptcha/api/siteverify?secret="+configs.recaptcha_secretkey+"&response="+token;

    let recaptcha_res = await fetch(api_url, {
        method: 'POST'
    })

    let recaptcha_result = await recaptcha_res.json();
    
    console.log(recaptcha_result)
    
    if(recaptcha_result.success) {
        let score = recaptcha_result.score;
        
        const { serverRuntimeConfig } = getConfig();
        const { reCaptchaList } = serverRuntimeConfig;

        let random = String(Math.floor(Math.random() * 1000000)).padStart(6, "0"); //랜덤 값
        let today = new Date();
        let timestamp = today.getTime();

        reCaptchaList.set(random, {score, timestamp});
        console.log(reCaptchaList)

        if(score > 0.5) {
            return res.json({success: true, ok: true, data:random});
        } else {

            return res.json({success: true, ok: false, data:random});
        }
    } else {
        return res.json({success: false});
    }

}

export default withSessionRoute(getSession);