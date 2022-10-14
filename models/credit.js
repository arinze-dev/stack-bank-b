const { UserModel} = require("./user")
const {mailsender} = require("./sendMailFun")
const {AccountDetails} = require("./accountDetail")


async function credit(amountt,meassage,acconumber,senderId,transacID, session) {
    const amount = Number(amountt)
   
   if (amount <1)return {
       status: false,
       statusCode:404,
       message: `you can not send negative amount`
   }

  const theReciver = await UserModel.findOne({accountnumber:acconumber})

  const theSenderCheck = await UserModel.findById({_id:senderId})

  if (theSenderCheck.accountnumber === Number(acconumber) ) return{
    status: false,
    statusCode:400,
    message: ` you can not creadit your self`
   }


  if (!theReciver) return {
   status: false,
   statusCode:404,
   message: `User user doesn 't exist`
 }

 const userAccouDet = await  AccountDetails.findOneAndUpdate({userId:theReciver._id},{ $inc: {balance:+amount,totalDeposit:+amount}},{session,new:true})

 const theSender = await UserModel.findById({_id:senderId})


 const senderNam =`${theSender.firstname} ${theSender.lastname}`

 const receiverNam = `${theReciver.firstname} ${theReciver.lastname}`


 console.log(userAccouDet);

 const transactionsDetail={
   enum: "credit",
   type: "credit",
   amount: amount,
   transactionID:transacID,
   senderName: senderNam,
   receiverName: receiverNam,
   balanceBefore:Number(userAccouDet.balance),
   balanceAfter:Number(userAccouDet.balance)+ Number(amount),
   message:meassage
 }

   const transactionDone = await UserModel.updateOne({_id:theReciver._id},{ $push: {transactionsDetails:[transactionsDetail]}},{session,new:true,upsert:true}).exec()

    // await mailsender(theReciver.email,"Credit",`Dear ${theReciver.firstname}`,`Your have being credited by ${theSender.firstname} ${theSender.lastname}`,`amount ${amount}`, `You balance ${userAccouDet.balance} current balance ${Number(userAccouDet.balance)+Number(amount)}`)

    return {
   status: true,
   statusCode:201,
   message: 'Credit successful',
   data: {creditedAccount:userAccouDet, transactionDone}
 }
}


module.exports ={
    credit
}
















//  ////////////////////////////////
//  ///////////////////////////
//         test code below

// async function credit(amountt,meassage,acconumber,senderId,transacID) {
//     const amount = Number(amountt)
   
//    if (amount <1)return {
//        status: false,
//        statusCode:404,
//        message: `you can not send negative amount`
//    }

//   const theReciver = await UserModel.findOne({accountnumber:acconumber})

//   if (!theReciver) return {
//    status: false,
//    statusCode:404,
//    message: `User ${username} doesn\'t exist`
//  }

//  const userAccouDet =await  AccountDetails.findOneAndUpdate({userId:theReciver._id}, {balance:amount,totalDeposit: +amount})

//  const theSender = await UserModel.findById({_id:senderId})


//  const senderNam =`${theSender.firstname} ${theSender.lastname}`

//  const receiverNam = `${theReciver.firstname} ${theReciver.lastname}`

//  const transactionsDetail={
//    enum: "credit",
//    amount: amount,
//    transactionID:transacID,
//    senderName: senderNam,
//    receiverName: receiverNam,
//    balanceBefore:Number(userAccouDet.balance),
//    balanceAfter:Number(userAccouDet.balance)+Number(amount),
//    meassage:meassage
// }

//  const transactionDone =await  AccountDetails.findOneAndUpdate({userId:theReciver._id},{$push:{transactionsDetails:transactionsDetail}})


//  return {
//    status: true,
//    statusCode:201,
//    message: 'Credit successful',
//    data: {creditedAccount:userAccouDet, transactionDone}
//  }
// }



// async function debit(amountt,meassage,acconumber,senderId,transacID) {
//    const amount = Number(amountt)

//    const theSender = await UserModel.findOne({_id:senderId})
//    console.log("1");
//    if (!theSender) return {
//        status: false,
//        statusCode:404,
//        message: `User  doesn\'t exist`
//    }
//  console.log("2");
//    if (amount <1)return {
//        status: false,
//        statusCode:404,
//        message: `you can not send negative amount`
//    }
//    console.log("3");
//    const theSenderAccoDet = AccountDetails.findOne({userId:theSender._id})

//    if (Number(theSenderAccoDet.balance)< amount)return {
//        status: false,
//        statusCode:400,
//        message:`User has insufficient balance`
//    }
//    console.log("4");
//    const userAccouDet = AccountDetails.findByIdAndUpdate({userId:theSender._id},{balance: - amount, totalWithdraw: + amount})
   
//    console.log("5");
//    const theReciver = await UserModel.findOne({accountnumber:acconumber})
//    console.log("1");
//    const senderNam =`${theSender.firstname} ${theSender.lastname}`
//    console.log("6");
//    const receiverNam = `${theReciver.firstname} ${theReciver.lastname}`
//    console.log("7");
//    const transactionsDetail={
//      enum: "debit",
//      amount: amount,
//      transactionID:transacID,
//      senderName: senderNam,
//      receiverName: receiverNam,
//      balanceBefore:Number(userAccouDet.balance),
//      balanceAfter:Number(userAccouDet.balance)-Number(amount),
//      meassage:meassage
//  }

//  const transactionDone =await  AccountDetails.findOneAndUpdate({userId:theSender._id},{$push: {transactionsDetails:transactionsDetail}})

//  console.log("8");
//  return {
//    status: true,
//    statusCode:201,
//    message: 'debited successful',
//    data: {creditedAccount:userAccouDet, transactionDone}
//  }
// }
