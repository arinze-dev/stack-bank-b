

const  {UserModel}  = require("../models/user")

async function generateAccoNum() {
  let AccountNum = null;
  do {
    const nums = new Set();
    while (nums.size < 7) {
      nums.add(Math.floor(Math.random() * 80) + 11);
    }
   let TempAccNum =  Number([...nums].join("").split("").splice(0,11).join(""));    
   
         AccountNum = await UserModel.findOne({accountnumber:TempAccNum})
      if (!AccountNum){
        return TempAccNum
       }

  } while (AccountNum);
}

module.exports = {
  generateAccoNum,
};
