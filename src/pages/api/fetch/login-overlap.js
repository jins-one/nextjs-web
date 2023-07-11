import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkNomalApi from "@/functions/checkNomalApi";
import getConfig from "next/config";

async function handler(req, res) {
    checkNomalApi(req);
  
    let body = JSON.parse(req.body);

    const { serverRuntimeConfig } = getConfig();
    const { loginSession } = serverRuntimeConfig;

    if(loginSession.get(body.email)){
        loginSession.delete(body.email);
        req.session.destroy(()=>{
            req.session.user;
        });

        return res.json({success : true});
    }else {
        return res.json({ success : false });
    }
}

export default withSessionRoute(handler);