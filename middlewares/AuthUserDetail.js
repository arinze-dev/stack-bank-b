const {DecryptUserInfo} = require("../util/encrypt")
const {UserModel}  = require("../models/user")

 async function AuthUserDetail(req,res,next) {
  console.log(req.header("token"))
  console.log(req.header("SecUSerInfo"))
  
  
  console.log(req);
     const userDetail= DecryptUserInfo(req.header("SecUSerInfo"));
     try {
       const user = JSON.parse(userDetail)

       if (!req.UserId === user.id) throw new Error("user can transfer")

      const UserCheck = await UserModel.findOne({_id:user.id,email:user.email})
      
      if (!UserCheck) throw new Error("user do not exist")
          req.UserData = user
          next()
     } catch (error) {
         return res.status(400).send({ message:"user do not exist" ,error: error})
     }
}

module.exports ={
  AuthUserDetail
}




