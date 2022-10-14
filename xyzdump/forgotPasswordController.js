
const express = require("express")
const joi = require("joi")
const {mailsender} = require("../models/sendMailFun");
const crypto = require("crypto");
const { UserModel} = require("../models/user");
const {ResetToken} = require("../models/tokenSchema");


 const forgotPasswordController =  async function (req,res){
    try {  
      const emailSchema = joi.object({
        email:joi.string().email().required()
      });
      
      const { error} = emailSchema.validate(req.body)
      if (error) return res.status(400).send({message:error.details[0].message});
  
      console.log(error);
      
      const user = await UserModel.findOne({ email: req.body.email});
  
      
      if (!user) return res.status(400).send({message:"User does not exist"});
      
      
      let token = await ResetToken.findOne({ userId: user._id });
      
      if (!token) {
        token = await new ResetToken({
          userId: user._id,
          token:crypto.randomBytes(20).toString("hex") 
        }).save()
      }
      
      const link =`${process.env.BASE_URL}/api/reset-password/${user._id}/${token.token}`;
     
         //how the params on the mailsender emailTo,   subject,   message
         
       mailsender(req.body.email,"Reset your password",link).then(result=>
        res.status(200).send({message:"password reset link sent have being send to your email account", result})
         ).catch((error)=> 
          res.status(400).send({message:"connect to internet",error: error})
         );
  
      } catch (error) {
       res.status(500).send({message: error})
   }
   }


   module.exports={
    forgotPasswordController
   }