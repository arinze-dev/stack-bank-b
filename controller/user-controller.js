const express = require('express');
const { UserModel } = require('../models/user');
const { AccountDetails } = require('../models/accountDetail');
const bcrypt = require('bcrypt');
const { generateAccoNum } = require('../models/generateAccounNumber');
const {ResetToken } = require("../models/tokenSchema");
const { RegisterValidation,loginValidation } = require("../models/validation");
const crypto = require("crypto");
const jwt = require("jsonwebtoken")
const { object } = require("joi");
const joi = require("joi")
const {DecryptUserInfo,EncryptUserInfo} = require('../util/encrypt')


/**
 * @desc This function handles the user register
 * @param {*} req 
 * @param {*} res
 * @returns
 */





const registerControllerPost = async (req, res) => {
  try {
    console.log("log register");
    const { error } = RegisterValidation(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const emailExist = await UserModel.findOne({ email: req.body.email });

    if (emailExist) return res.status(400).send('Email already exist😒😒');

    const phoneNoExist = await UserModel.findOne({ phone: req.body.phone });

    if (phoneNoExist) return res.status(400).send('Number already exist☑️☑️');

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
      emailToken: crypto.randomBytes(64).toString('hex'),
      isVerfied: false,
    });
    const savedUser = await user.save(async (err, user) => {
      if (err) return err;
      AccountDetails.create(
        {
          userId: user._id,
          balance: 75000,
          totalDeposit: 75000,
        },
        async function (err, userDoc) {
          if (err) return err;
          await UserModel.findOneAndUpdate(
            { _id: user._id },
            { accountDetails: userDoc._id }
          );
          return 'success';
        }
      );
      res.status(200).send({ message: 'user registeration successful' });
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * @desc This function handles the user forgot password
 * @param {*} req
 * @param {*} res
 * @returns
 */
const forgotPasswordController = async function (req, res) {
  try {
    const emailSchema = joi.object({
      email: joi.string().email().required(),
    });

    const { error } = emailSchema.validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });



    const user = await UserModel.findOne({ email: req.body.email });
    
    if (!user) return res.status(400).send({ message: 'User does not exist' });


    let token = await ResetToken.findOne({ userId: user._id });

    if (!token) {
      token = await new ResetToken({
        userId: user._id,
        token: crypto.randomBytes(20).toString('hex'),
      }).save();
    }

    

    const link = `${process.env.BASE_URL}/api/user/reset-password/${user._id}/${token.token}`;


    //how the params on the mailsender emailTo,   subject,   message
    
  
    mailsender(req.body.email, 'Reset your password', link)
      .then((result) =>
        res.status(200).send({
          message:
            'password reset link sent have being send to your email account',
          result,
        })
      ).catch((error) =>
        res.status(400).send({ message: 'connect to internet', error: error })
      );
      
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

/**
 * @desc This function handles the user login
 * @param {*} req
 * @param {*} res
 * @returns
 */
const logIncontroller = async function (req, res) {
  try {

     console.log("hello");

    const loginData = {
      email: req.body.email,
      password: req.body.password,
    };
    const { error } = loginValidation(loginData);

    if (error) return res.status(400).send(error.details);

    const User = await UserModel.findOne({ email: loginData.email });

    if (!User) return res.status(400).send('wrong email try angin');

    const correctPassword = await bcrypt.compare(
      loginData.password,
      User.password
    );

    
    if (!correctPassword)
    return res.status(400).send('wrong password try angin');

    console.log(User.id);
    
    const token = jwt.sign({ _id: User.id }, process.env.TOKEN_SECRET, { expiresIn:'2d'});
        
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

/**
 * @desc This function handles the user reset password
 * @param {*} req
 * @param {*} res
 * @returns
 */
const resetPasswordController = async function (req, res) {
  try {
    const id = req.params.id.toString();
    const Ptoken = req.params.token.toString();

    const user = await UserModel.findOne({ _id: id });

    if (!user) return res.status(401).send({ message: 'invaild link' });
    console.log('transaction');

    let token = await ResetToken.findOne({
      userId: id,
      token: Ptoken,
    });

    if (!token) return res.status(400).send({ message: 'invaild link' });

    const PasswordSchema = joi.object({
      password: joi.string().min(6).required(),
    });

    const { error } = PasswordSchema.validate(req.body);

    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await UserModel.findOneAndUpdate({ _id: id }, { password: hashPassword });

    await ResetToken.findOneAndDelete({ token: token.tokens });

    console.log('hello');

    res.status(200).send({ message: 'success' });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

async function homeController(req, res) {
  try {
  
    const id = req.UserId;

    const UserDetails = await UserModel.findById(id)
      .populate('accountDetails')
      .exec();
    const mainAccountDetails = await AccountDetails.findOne({ userId: id });

    res
      .status(200)
      .send({
        firstname: UserDetails.firstname,
        lastname: UserDetails.lastname,
        accountnumber: UserDetails.accountnumber,
        phone: UserDetails.phone,
        accountDetails: UserDetails.transactionsDetails,
        balance: mainAccountDetails.balance,
        totalDeposit: mainAccountDetails.totalDeposit,
        totalWithdraw: mainAccountDetails.totalWithdraw,
      });
  } catch (error) {
    res.status(400).send('someThing went wrong');
  }
}

function logoutController(req, res) {
  const SecUSerInfo = req.header('SecUSerInfo');
  const token = req.header('token');

  token = ('token', '', { maxAge: 2 });
  SecUSerInfo = SecUSerInfo;

  res.status(200).send({ token: token, SecUSerInfo: SecUSerInfo });
}

const verifyUser = async (req, res) => {
  await UserModel.findOne({ emailToken: req.body.emailToken })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'User Not found.' });
      }
      user.isVerified = true;
      user.save((err) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
      });
    })
    .catch((e) => console.log('error', e));
};
module.exports = {
  registerControllerPost,
  forgotPasswordController,
  logIncontroller,
  resetPasswordController,
  homeController,
  logoutController,
  verifyUser,
};
