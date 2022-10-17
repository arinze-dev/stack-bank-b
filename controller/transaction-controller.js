const express = require("express");
const mongoose = require("mongoose");
const { credit } = require("../models/credit");
const { debit } = require("../models/debit");
const { UserModel } = require("../models/user");
const { AccountDetails } = require("../models/accountDetail");
const crypto = require("crypto");

const pretransferController = async function (req, res) {
  console.log("good");
  const Receiver = await UserModel.findOne({
    accountnumber: req.body.accountnumber,
  });

  if (!Receiver)
    return res.status(400).send({ meassage: "Account Number doesn't Exist" });

  res.status(200).send({
    firstname: Receiver.firstname,
    lastname: Receiver.lastname,
    accountnumber: Receiver.accountnumber,
  });
  return;
};

const transfercontroller = async (req, res) => {
  const session = await mongoose.startSession();

  await session.startTransaction();

  try {
    const transacID = crypto.randomBytes(32).toString("hex");
    console.log(typeof transacID);
    const { id } = req.UserData;

    const { accountnumber, message, amount } = req.body;

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
        .status(403)
        .send({ message: "transaction feild", errMsg: errorMsg });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(200).send("successful transfer");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).send({ msg: "internet error", err: error });
  }
};

async function loanController(req, res) {
  try {
    const UserId = req.UserData.id;
    const amount = req.body.amount;

    const LoanOwner = await UserModel.findById(UserId);

    const LoanOwerAccouDe = await AccountDetails.findOne({
      userId: LoanOwner._id,
    });

    if (LoanOwerAccouDe.totalDeposit < Number(amount)) {
      return res
        .status(400)
        .send("YOUR loan should not be greater than your total deposit");
    }

    if (Number(amount) < 1) {
      return res.status(401).send("your amount can not be negative number");
    }

    // "your loan request is being procssed"

    // await setTimeout( async() => {

    const loanAprove = await AccountDetails.updateOne(
      { userId: UserId },
      { $inc: { balance: +amount } },
      { new: true }
    );

    const transacID = crypto.randomBytes(25).toString("hex");

    const transactionsDetail = {
      enum: "loan",
      type: "loan",
      amount: amount,
      transactionID: transacID,
      senderName: "Stack bank",
      receiverName: LoanOwner.firstname,
      balanceBefore: Number(LoanOwerAccouDe.balance),
      balanceAfter: Number(LoanOwerAccouDe.balance) + Number(amount),
      message: "This the loan that your requested for",
    };

    const transactionDone = await UserModel.updateOne(
      { _id: UserId },
      { $push: { transactionsDetails: [transactionsDetail] } },
      { new: true, upsert: true }
    ).exec();

    // mailsender(
    //   LoanOwner.email,
    //   'Approved Load',
    //   `dear ${LoanOwner.firstname}`,
    //   `Your loan have being approved`,
    //   `The Amount is:${amount}`
    // );

    return res.status(200).send("your loan is successfull approved");
  } catch (error) {
    res.status(400).send(error);
  }
}

async function AirtimeController(req, res) {
  try {
    const UserId = req.UserData.id;
    const { amount, receiverNumber } = req.body;

    const AirtimeSender = await UserModel.findById(UserId);

    const AirtimeSenderDet = await AccountDetails.findOne({ userId: UserId });

    if (AirtimeSenderDet.balance < Number(amount)) {
      return res
        .status(400)
        .send("YOUR loan should not be greater than your total deposit");
    }

    if (Number(amount) < 1) {
      return res.status(401).send("your amount can not be negative number");
    }

    const loanAprove = await AccountDetails.updateOne(
      { _id: UserId },
      { balance: -amount },
      { new: true }
    );

    const transacID = crypto.randomBytes(32).toString("base64");

    const transactionsDetail = {
      enum: "airtime",
      type: "airtime",
      amount: amount,
      transactionID: transacID,
      senderName: AirtimeSender.firstname,
      receiverName: receiverNumber,
      balanceBefore: Number(AirtimeSenderDet.balance),
      balanceAfter: Number(AirtimeSenderDet.balance) - Number(amount),
      message: "You bought Airtime",
    };

    const transactionDone = await UserModel.updateOne(
      { _id: AirtimeSender._id },
      { $push: { transactionsDetails: [transactionsDetail] } },
      { new: true, upsert: true }
    ).exec();

    //  SendMSG(`airtime is send to you by ${AirtimeSender.firstname}`,receiverNumber)
    return res.status(200).send("Success Bought Airtime");
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  pretransferController,
  transfercontroller,
  loanController,
  AirtimeController,
};
