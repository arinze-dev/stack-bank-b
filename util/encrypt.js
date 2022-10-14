const CryptoJS = require("crypto-js");

function EncryptUserInfo (UserData) {
  let data = CryptoJS.AES.encrypt(UserData,process.env.USER_INFO_SECRET).toString();
   return data
} 

 function DecryptUserInfo(data) {
    let bytes =  CryptoJS.AES.decrypt(data,process.env.USER_INFO_SECRET);
   const UserData = bytes.toString(CryptoJS.enc.Utf8);
   return UserData
 }

 module.exports ={
    EncryptUserInfo,
    DecryptUserInfo
 }
 