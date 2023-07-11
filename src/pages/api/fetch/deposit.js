import { withSessionRoute } from "@/fetchs/session"
import { DepositInvestment } from "@/fetchs/investments/post/deposit";
import checkNomalApi from "@/functions/checkNomalApi";
import insertLogs from "@/functions/logs";
import maskingEmail from "@/functions/emailMasking";
import configs from "@/configs/configs";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let method = req.method;
    
    let masking_email = await maskingEmail(req.session.user.email);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip")?req.headers["cf-connecting-ip"]:'';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url);

    if(method=='GET') {
        
        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);
        return res.json({success:true});

    } else if(method=='POST') {

        let body = JSON.parse(req.body);
        // let body = req.body;

        let name = body.name;
        let amount = body.amount;
        
        let _data = {
            name: name,
            amount: amount
        }
    
        const result = await DepositInvestment(_data);
    
        insertLogs(client_ip, masking_email, req.method, configs.frontUrl+req.url, res.statusCode);
        return res.json({ success: result.success });
    }

}
export default withSessionRoute(handler)