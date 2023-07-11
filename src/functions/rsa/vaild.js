import fs from 'fs';
import crypto from 'crypto'

const pubKey = fs.readFileSync('public/keys/public.pem','utf8');
const priKey = fs.readFileSync('public/keys/private.pem','utf8');


export function encodeRSA(text){
    const buffer = Buffer.from(text);
    const encrypted = crypto.publicEncrypt(pubKey, buffer);
    return encrypted.toString("hex");
}

export function decodeRSA(text){
    const buffer = Buffer.from(text, "hex");
    const decrypted = crypto.privateDecrypt(priKey, buffer);
    return decrypted.toString("utf8");
}