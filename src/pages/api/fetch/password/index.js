import { withSessionRoute } from "@/fetchs/session"
import checkNomalApi from "@/functions/checkNomalApi";
import emailAuthNumDoubleCheck from "@/functions/emailAuthNumDoubleCheck";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }
    
    let method = req.method;
    let user_email = req.session.user?req.session.user.email:'';

    if(method=='PATCH') { //비밀번호 변경
        

        // let emailDoubleCheck = await emailAuthNumDoubleCheck(email, body.code);
        // if(emailDoubleCheck) {
            
        // } else {
        //     return res.json({success:false, code:1011});
        // }


    }

    return res.json({ success: true, user_email: user_email  });
}
export default withSessionRoute(handler)