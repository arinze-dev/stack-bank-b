

async function SendMSG(messageM,to) {
    
const accountSid = process.env.TWILIO_SID; 
const authToken = `[${process.env.TWILIO_TOKEN}]`; 
const client = require('twilio')(accountSid, authToken); 
 
client.messages 
      .create({ 
         body: messageM,      
         to: `${to}` 
       }) 
      .then(message => console.log(message.sid)) 
      .done();   
}


module.exports ={
    SendMSG
}