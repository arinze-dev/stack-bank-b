const express = require("express");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/user");
const {AccountDetails} = require("../models/accountDetail");
const { loginValidation } = require("../models/validation");
const crypto = require("crypto");
const { EncryptUserInfo } = require("../util/encrypt");

const logIncontroller = async function (req, res) {
  try {
    const loginData = {
      email: req.body.email,
      password: req.body.password,
    };
    const { error } = loginValidation(loginData);

    if (error) return res.status(400).send(error.details);

    const User = await UserModel.findOne({ email: loginData.email });

    if (!User) return res.status(400).send("wrong email try angin");

    const correctPassword = await bcrypt.compare(
      loginData.password,
      User.password
    );

    if (!correctPassword)
      return res.status(400).send("wrong password try angin");

    const token = jwt.sign({ _id: User.id }, process.env.TOKEN_SECRET,{expiresIn:'45m'});

    // await UserModel.updateOne({ email: loginData.email }, { token: token });
    const userData = {
      email: User.email,
      id: User._id,
    };


    const SecretUserInfo = EncryptUserInfo(JSON.stringify(userData));
    return res.status(200).send({
      token: token,
      name: User.lastname,
      accountnumber: User.accountnumber,
      SecUSerInfo: SecretUserInfo,
    });

  } catch (error) {
    return res.status(400).send(error);
  }
};
module.exports = {
  logIncontroller
};
