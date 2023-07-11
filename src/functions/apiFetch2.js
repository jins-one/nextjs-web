import configs from "@/configs/configs";
import insertLogs from "./logs";


/**
 * fetch 함수
 * @param {*} url
 * @param {*} method 
 * @param {*} body body data
 */
export default async function apiFetch2(url, obj, email) {
    let method = obj.method;
   
    if(url.includes(configs.apiAddress)){
        insertLogs(configs.frontUrl, email, method, url);
    } 

    let res;
    try {
        res = await fetch(url, obj);
    } catch (err) {
        return { success: false };
    }

    let result = await res.json();

    if(url.includes(configs.apiAddress)){
        insertLogs(configs.frontUrl, email, method, res.url, res.status);
    }

    if (result.success) {
        if (result.pwRedirect) {
            result.redirectUrl = {
                permanent: false,
                destination: "/account/passwd",
            }
        }
    } else {
        if (result.code == 11013) {
            result.redirectUrl = {
                redirect: {
                    permanent: false,
                    destination: "/login?session=no",
                },

            }
        }
    }
    return result;
}
