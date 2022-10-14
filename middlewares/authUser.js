
const express = require("express");
const jwt = require("jsonwebtoken")


  async function Authtoken (req,res,next) {
    const token = req.header("token");
    if (!token) return res.status(401).send({message:"user is not login try and login"});   
        try {  
         const verifiy = jwt.verify(token,process.env.TOKEN_SECRET);
          req.UserId = verifiy._id;
          req.token = token
           next()
           return
        } catch (error) {
          return res.status(401).send("Invalid Token");
        }     
    }

module.exports ={
  Authtoken
}

