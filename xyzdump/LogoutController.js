 
 const express = require("express");
 function logoutController(req,res) {
  const SecUSerInfo = req.header("SecUSerInfo");
  const token = req.header("token");

  token = ("token","",{maxAge:2})
  SecUSerInfo  =SecUSerInfo

 res.status(200).send({token:token,SecUSerInfo:SecUSerInfo})
 
 }
 module.exports = {
    logoutController
 }
