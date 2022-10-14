
const express = require("express");
const joi = require("joi");
const bcrypt = require("bcrypt");

const { UserModel } = require("../models/user");
const {ResetToken } = require("../models/tokenSchema");




 const resetPasswordController = async function (req, res)  {
    try {
      const id = req.params.id.toString();
      const Ptoken = req.params.token.toString();
  
      const user = await UserModel.findOne({ _id: id });
  
      if (!user) return res.status(401).send({ message: "invaild link" });
      console.log("transaction");
  
      let token = await ResetToken.findOne({
        userId: id,
        token: Ptoken,
      });
  
      if (!token) return res.status(400).send({ message: "invaild link" });
  
      const PasswordSchema = joi.object({
        password: joi.string().min(6).required(),
      });
  
      const { error } = PasswordSchema.validate(req.body);
  
   
  
      if (error)
        return res.status(400).send({ message: error.details[0].message });
  
      const salt = await bcrypt.genSalt(10);
  
              const hashPassword = await bcrypt.hash(req.body.password,salt);
  
      await UserModel.findOneAndUpdate({ _id: id }, { password: hashPassword });
  
               await ResetToken.findOneAndDelete({token: token.tokens})
               
      console.log("hello");
  
      res.status(200).send({ message: "success" });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  }


  module.exports={
    resetPasswordController
  }