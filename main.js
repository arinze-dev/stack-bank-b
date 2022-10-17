const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

let PORT = process.env.PORT  || 4040

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}



// use area
const app = express();
app.use(cors(corsOptions))
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const connection = process.env.NODE_ENV == 'production' ? process.env.DB_ATLAS_LINK : 'mongodb://127.0.0.1:27017/StackDB';

mongoose.connect(process.env.DB_ATLAS_LINK, () =>
  console.log("connected to StackDB")
);
//routes
const { UserRouter } = require("./route/user-route.js");
const { TransactionRouter } = require("./route/transaction.js");

// Route Middleware
app.use("/api/user", UserRouter);
app.use("/api/tx", TransactionRouter);

//  const atlasDB = `mongodb+srv://pseudobrains:test12345@cluster0.xo0lnsr.mongodb.net/stackDB?retryWrites=true&w=majority`;

// mongoose.connect(atlasDB,{
//    useNewUrlParser:true,
//   useNewUrlParser: true,
//   useCreateIndex:true,
//   useUnifiedTopology:true,
//   useFindAndModify:false
// } 

app.get("/", (req,res) => {
  res.send({message : "welcome to  stak bank"});
});

app.get("/api", (req,res) => {
    res.send({message : "welcome to  stak bank"});
});

app.listen(PORT, () => console.log("server is runing"));
