const express = require("express");
const { UserModel} = require("../models/user");
const {AccountDetails} = require("../models/accountDetail");
const { RegisterValidation } = require("../models/validation");
const bcrypt = require("bcrypt");
const { generateAccoNum } = require("../models/generateAccounNumber");
const crypto = require("crypto");
const { object } = require("joi");

const registerControllerPost = async (req, res) => {
  try {
    const { error } = RegisterValidation(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await UserModel.findOne({ email: req.body.email });

    if (emailExist) return res.status(400).send("Email already exist😒😒");

    const phoneNoExist = await UserModel.findOne({ phone: req.body.phone });

    if (phoneNoExist) return res.status(400).send("Number already exist☑️☑️");

    const salt = await bcrypt.genSalt(10);

    const harshPassword = await bcrypt.hash(req.body.password, salt);

    const AccountNumber = await generateAccoNum();

    const user = new UserModel({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: harshPassword,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      accountnumber: AccountNumber,
      emailToken: crypto.randomBytes(64).toString("hex"),
      isVerfied: false,
    });
    const savedUser = await user.save(async (err, user) => {
      if (err) return err;
      AccountDetails.create(
        {
          userId: user._id,
          balance: 75000,
          totalDeposit:75000
        },
        async function (err, userDoc) {
          if (err) return err;
          await UserModel.findOneAndUpdate(
            { _id: user._id },
            { accountDetails: userDoc._id }
          );
          return "success";
        }
      );
      res.status(200).send({ message: "user is successful create" });
    });
  } catch (err) {
    res.status(400).send(err);
  }
};


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

module.exports = {
  registerControllerPost,
  forgotPasswordController
};
