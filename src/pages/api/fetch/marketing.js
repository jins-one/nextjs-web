import { withSessionRoute, withSessionSsr } from "@/fetchs/session";
import checkNomalApi from "@/functions/checkNomalApi";


async function handler(req, res) {
    //blackList TODO
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let user_email = req.session.user?req.session.user.email:'';

    let body = JSON.parse(req.body);
    
    // let result = await ConsentMarketing(body.marketing);
    // return res.json({success:result.success});

    return res.json({success:true, user_email: user_email});
}

export default withSessionRoute(handler);