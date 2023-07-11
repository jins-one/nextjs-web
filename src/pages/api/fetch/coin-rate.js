import { withSessionRoute } from "@/fetchs/session"
import { CoinRateInquiry } from "@/fetchs/coins/get/rate";
import checkNomalApi from "@/functions/checkNomalApi";


async function handler(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }

    let list;

    const result = await CoinRateInquiry();
    if(result.success) {
        list = result.list;
    } else {
        list = [];
    }

    res.json({ success: result.success, list:list });
}
export default withSessionRoute(handler)