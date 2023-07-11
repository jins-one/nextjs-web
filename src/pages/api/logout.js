import configs from "@/configs/configs";
import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkNomalApi from "@/functions/checkNomalApi";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import getConfig from "next/config";

async function getSession(req, res) {
    // let blackListCheck = checkNomalApi(req);
    // if (!blackListCheck.success && blackListCheck.code == '1001') {
    //     return res.json({ success: false, code: 1001 });
    // }

    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);

    // const { serverRuntimeConfig } = getConfig();
    // const { loginSession } = serverRuntimeConfig;

    // loginSession.delete(req.session.user.email);
    req.session.destroy();

    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
    return res.json({ ok: true });

}

export default withSessionRoute(getSession);