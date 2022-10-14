const express = require("express");
const mongoose = require("mongoose");
const {credit} = require("../models/credit");
const {debit} = require("../models/debit");
const { UserModel } = require("../models/user");
const {AccountDetails} = require("../models/accountDetail")
const crypto = require("crypto");

const transfercontroller = async (req, res) => {
  const session = await mongoose.startSession();

  await session.startTransaction();

  try {
    const transacID = crypto.randomBytes(32).toString("hex");
    console.log(typeof transacID);
    const { id } = req.UserData;

    const { accountnumber, message, amount } = req.body;

    console.log(amount)

    const transactionStatus = await Promise.all([
      debit(amount, message, accountnumber, id, transacID, session),
      credit(amount, message, accountnumber, id, transacID, session),
    ]);

    const trancactFailed = transactionStatus.filter(
      (transac) => transac.status !== true
    );

    if (trancactFailed.length) {
      const errorMsg = trancactFailed.map((err) => err.message);
      await session.abortTransaction();
      //  return res.send(errorMsg)
      return res
        .status(200)
        .send({ message: "transaction feild", errMsg: errorMsg });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(200).send("successful transfer");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).send({msg:"internet error",err:error});
  }
};
module.exports = {
  transfercontroller,
};

//  import axios from 'axios'
//  params = {'HTTP_CONTENT_LANGUAGE': self.language}
//  headers = {'header1': value}
//  axios.post(url, params, headers)
//  Is this correct? Or should I do:

//  axios.post(url, params: params, headers: headers)
