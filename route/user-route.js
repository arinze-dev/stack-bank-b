const express = require("express")
const Router = require("express").Router();
const {AuthUserDetail} = require("../middlewares/AuthUserDetail")

const { registerControllerPost,forgotPasswordController , logIncontroller, resetPasswordController , homeController , verifyUser, logoutController } = require("../controller/user-controller");
const {Authtoken} = require("../middlewares/authUser")

Router.get("/" , Authtoken, homeController);
Router.post("/register", registerControllerPost);
Router.post("/login",logIncontroller);
Router.post("/forgot-password", forgotPasswordController);
Router.post("/reset-password/:id/:token",resetPasswordController);
Router.get("/verify/:confirmationCode", verifyUser);
Router.get("/logout",Authtoken,AuthUserDetail, logoutController )


module.exports = {
  UserRouter: Router
};





