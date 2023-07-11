import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";

async function handler(req, res) {
    //blackList TODO
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let method = req.method;
    let type = req.query.type;
    let user_email = req.session.user?req.session.user.email:'';

    if(method=='POST') {
        console.log(type)
        
        return res.json({success:true, user_email: user_email });
    } else {
        return res.json({success:true, user_email: user_email });
    }
}

export default withSessionRoute(handler);