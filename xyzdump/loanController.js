  const express = require("express")
  const {UserModel} = require("../models/user")
  const {AccountDetails} = require("../models/accountDetail")
  const crypto = require("crypto");
  const {mailsender} = require("../models/sendMailFun")


 async function loanController(req , res) {
    try {

   const UserId = req.UserData.id;
   const amount = req.body.amount;

   const LoanOwner = await UserModel.findById(UserId);
  
   const LoanOwerAccouDe = await AccountDetails.findOne({userId:LoanOwner._id})
  
 
 if (LoanOwerAccouDe.totalDeposit < Number(amount)) { 
   return res.status(400).send("YOUR loan should not be greater than your total deposit")
  }
  
  if (Number(amount) < 1) {
    return res.status(401).send("your amount can not be negative number")
  }
  
  // "your loan request is being procssed"
  
  // await setTimeout( async() => {
        
    const loanAprove = await AccountDetails.updateOne({userId:UserId},{$inc:{balance:+amount}},{new:true});

    
    const transacID = crypto.randomBytes(25).toString("hex");

  
    
    const transactionsDetail={
      enum: "loan",
      type: "loan",
      amount: amount,
      transactionID:transacID,
      senderName: "Stack bank",
      receiverName: LoanOwner.firstname,
      balanceBefore:Number(LoanOwerAccouDe.balance),
      balanceAfter:Number(LoanOwerAccouDe.balance)+Number(amount),
     message:"This the loan that your requested for"
  }

  
  const transactionDone = await UserModel.updateOne({_id:UserId},{ $push: {transactionsDetails:[transactionsDetail]}},{new:true,upsert:true}).exec()
  


   mailsender(LoanOwner.email,"Approved Load" , `dear ${LoanOwner.firstname}`,`Your loan have being approved`, `The Amount is:${amount}`)
  

   return res.status(200).send("your loan is successfull approved");
   
 
} catch (error) {
  res.status(400).send(error)

}
};

module.exports={
    loanController
};