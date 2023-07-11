import crypto from "crypto";

export default async function cryptoNumber(number){
    
    const salt = String(process.env.NUMBER_SALT).toString("base64");
    const iterations = Number(process.env.CRYTO_NUMBER_ITERATIONS);

    return new Promise((resolve, reject)=>{
        resolve(crypto.createHash('sha512').update(number).digest('base64'));
    });
}