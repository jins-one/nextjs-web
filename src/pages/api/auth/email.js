
import { withSessionRoute } from "@/fetchs/session";
import nodemailer from 'nodemailer'
import configs from "@/configs/configs";
import { encodeRSA } from "@/functions/rsa/vaild";
import path from "path";

import getConfig from "next/config";
import maskingEmail from "@/functions/emailMasking";
import insertLogs from "@/functions/logs";
import emailCheck from "@/fetchs/signin/post/emailCheck";
import checkNomalApi from "@/functions/checkNomalApi";
const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    auth: {
        user: configs.googleEmail.id,
        pass: configs.googleEmail.key
    }
});

/**
 * 회원가입 단계에서 이메일 인증을 하면 링크가 포함된 이메일을 보낸다.
 * 그때 사용함
 * body = {eamil}
 * @param {object} req request
 * @param {object} res response
 */
async function sendEmail(req, res) {
    let blackListCheck = checkNomalApi(req);
    if(!blackListCheck.success && blackListCheck.code=='1001') {
        return res.json({success:false, code:1001});
    }


    let body = JSON.parse(req.body);
    let emailtext;
    const { serverRuntimeConfig } = getConfig();
    const { emailAuthMap, reCaptchaList } = serverRuntimeConfig;
    let recaptcha_num = body.rc;
    let rc_data = reCaptchaList.get(recaptcha_num);

    ////reCAPTCHA data가 외부에 의해 강제로 변환되었는지 확인
    if (rc_data) {
        if (rc_data.score <= 0.5) {
            reCaptchaList.delete(recaptcha_num);
            return res.json({ success: false });
        } else {
            reCaptchaList.delete(recaptcha_num);
        }
    } else {
        return res.json({ success: false });
    }
    //

    if (body.type && body.type == 'assets') {
        emailtext = req.session.user.email;
    } else {
        emailtext = body.email;
    }

    let masking_email = await maskingEmail(emailtext);
    let client_ip = req.headers.hasOwnProperty("cf-connecting-ip") ? req.headers["cf-connecting-ip"] : '';
    insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url);


    const result = await emailCheck(body.email);
    if (result.success) {
        if (result.data.data.count == 0) {
            // 중복없음

            let random = String(Math.floor(Math.random() * 1000000)).padStart(6, "0"); //랜덤 값

            let currentTime = new Date();
            let timestamp = currentTime.getTime();

            try {
                smtpTransport.sendMail({
                    from: `blink@naver.com`,
                    to: emailtext,
                    subject: "[블링크-BLINK] 이메일 인증",
                    html: `<div style="width:100%; height:900px; text-align:center; background:#f6f7f9; padding-top:50px">
                        <div style="width:608px; height:fit-contents; background:white; margin: 0 auto;">            
                            <div style="padding-top:40px; padding-bottom:30px; background:#a967fe; text-align:left; padding-left:30px; padding-right:30px;">
                                <img src="cid:logoImg" style="margin-bottom:50px"/>
                                <div style="font-size:26px; font-weight:500; color:white">인증번호를<br/>발송해 드립니다.</div>
                            </div>
                            <div style="padding-top:76px; padding-bottom:70px; padding-left:30px; padding-right:30px; text-align:left; font-size:18px; font-weight:400; height:fit-contents;">
                                <div style="margin-bottom:90px;">
                                    블링크 이메일 인증번호를 알려드립니다.<br/>
                                    아래의 인증번호 6자리를 진행중인 화면 입력창에 입력해 주세요.<br/>
                                    인증번호는 메일이 발송 후, 5분간 유효합니다.
                                </div>
                                <div style="border-top:1px solid #8f00ff; border-bottom:1px solid #8f00ff; padding:30px;">
                                    <span style="margin-right:50px; width:130px;">인증번호</span>
                                    <span style="font-size:24px">${random}</span>
                                </div>
                            </div>
                            <div style="margin: 0 auto; padding-left:30px; padding-top:24px; padding-bottom:41px; padding-right:30px; font-size:12px; color:#808080; line-height:1.4; text-align:left; background:#eeefef">
                                <ol style="padding-left:0; line-height:1.5;">
                                    <li>메일을 요청하지 않으셨는데 메일을 받으신 경우 다른 회원이 주소를 잘못 기입하여 발송되었을 수 있습니다.</li>
                                    <li>인증시간이 만료되었을 경우, 인증번호 재발송을 진행해 주시기 바랍니다.</li>
                                    <li>더 자세한 사항은 blink@blink.com으로 문의하여 주세요.</li>
                                </ol>
                        </div>
                        </div>
                    </div>`,
                    attachments: [{
                        filename: 'email-blink-logo.png',
                        path: path.join(__dirname, '../../../../../', `public/images/logo/email-blink-logo.png`),
                        cid: 'logoImg'
                    }]
                })

                // emailCheck.push({
                //     email: emailtext,
                //     num: '123456'
                // });

                emailAuthMap.set(emailtext, { code: random, timestamp });

                insertLogs(client_ip, masking_email, req.method, configs.frontUrl + req.url, res.statusCode);
                res.status(200).json({ success: true })

            } catch (err) {
                console.log(err)
                return res.json({ success: false });
            }

        } else {
            // 중복있음
            return res.json({ success: true, data: 1 });
        }
    } else {
        return res.json({ success: false });
    }

}

export default withSessionRoute(sendEmail);
