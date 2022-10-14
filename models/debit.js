
const { UserModel} = require("./user")
const {mailsender} = require("./sendMailFun")
const {AccountDetails} = require("./accountDetail")



async function debit(amountt,meassage,acconumber,senderId,transacID, session) {
    const amount = Number(amountt)
 
    const theSender = await UserModel.findOne({_id:senderId})
 
      if (theSender.accountnumber === Number(acconumber) ) return{
       status: false,
       statusCode:400,
       message: ` you can not send money to your self`
      }
 
    
     if (!theSender) return {
           status: false,
           statusCode:404,
           message: `User  doesn\'t exist`
       }
      
       if (amount < 1)return {
             status: false,
             statusCode:404,
             message: `you can not send negative amount`
         }
 
          const theSenderAccoDet = await AccountDetails.findOne({userId:theSender._id})
      
          
       if (Number(theSenderAccoDet.balance)< amount)return {
           status: false,
           statusCode:400,
           message:`User has insufficient balance`
       }
               
       const userAccouDet = await AccountDetails.findOneAndUpdate({userId:theSender.id},{$inc: {balance:-amount,totalWithdraw:-amount}},{session,new:true})
 
       
       const theReciver = await UserModel.findOne({accountnumber:acconumber})
       
       const senderNam =`${theSender.firstname} ${theSender.lastname}`
       
       const receiverNam = `${theReciver.firstname} ${theReciver.lastname}`
   
    const transactionsDetail={
      enum: "debit",
      type: "debit",
      amount:amount,
      transactionID:transacID,
      senderName: senderNam,
      receiverName: receiverNam,
      balanceBefore:Number(userAccouDet.balance),
      balanceAfter:Number(userAccouDet.balance)- Number(amount),
      message:meassage
  }
 
  const transactionDone = await UserModel.updateOne({_id:theSender.id},{ $push: {transactionsDetails:[transactionsDetail]}},{session,new:true,upsert:true}).exec()
 
  // await mailsender(theSender.email,"debit",`Dear ${theSender.firstname}`,`Your have being credited by ${theReciver.firstname} ${theReciver.lastname}`,`amount ${amount}`, `You balance ${userAccouDet.balance} current balance ${Number(userAccouDet.balance)-Number(amount)}`)
 
     
  return {
    status: true,
    statusCode:201,
    message: 'debited successful',
    data: {creditedAccount:userAccouDet, transactionDone}
  }
 }
 module.exports ={
     debit
 }
 