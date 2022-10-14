
const Route = require("express").Router()
const {Authtoken} = require("../middlewares/authUser")
const {AuthUserDetail} = require("../middlewares/AuthUserDetail")

const {pretransferController , transfercontroller , loanController , AirtimeController } = require("../controller/transaction-controller")

Route.post("/pretransfer",Authtoken, AuthUserDetail,pretransferController);
Route.post("/transfer",Authtoken, AuthUserDetail,transfercontroller)
Route.post("/loan",Authtoken, AuthUserDetail,loanController);
Route.post("/airtime",Authtoken,AuthUserDetail,AirtimeController);



module.exports ={
    TransactionRouter: Route
}

