import express from 'express';
import brevo from '@getbrevo/brevo';
import {authorize} from '../User/Authorization.js';
import env from 'dotenv';
env.config();


const router = express();

function sendToAlumni(Email , Name){
    let defaultClient = brevo.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_KEY;

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Related to Department Project Submisson";
    sendSmtpEmail.htmlContent = `<html><body>
        Dear ${Name}, <br/>
       <p> 
           In recent years, our students have been tirelessly working on innovative <br/>
           and cutting-edge projects in the fields of Data Science, Software Development, <br/>
           and Geometry. Their hard work, dedication, and passion have truly shone through, and <br/>
           we are eager to share their accomplishments with you.<br/>

           We invite you to take part in this journey of student success by sharing your  <br/>
           expertise and feedback with them. Your valuable insights and experiences as alumni <br/>
           will not only motivate our students but also help them refine and improve their projects<br/>
          further. Additionally, your guidance may lead to potential collaborations and opportunities for <br/>
           these talented individuals.

           <a href="https://dept-proj.com">Department of Mathematics</a>
          
           <h3>Placement Cell</h3>
           <h3>Smita Kandekar</h3>
           <h3>Department of Mathematics</h3>
           <h2>Savitribai Phule Pune Univeristy</h2>
       </p>
    </body></html>`;
    sendSmtpEmail.sender = { "name": "Shivam Shakya", "email": "shivdu2000@gmail.com" };
    sendSmtpEmail.to = [{ "email": Email, "name": "Reciever" }];
    sendSmtpEmail.replyTo = { "email": "shivdu2000@gmail.com", "name": "Shivam Shakya" };
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": "My param value", "subject": "Related to Project Submission : Department of Mathematics" };


    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
         console.log( {"Success" :  JSON.stringify(data)});
         return  true;
    }, function (error) {
         console.log( {"Failed" :  error});
         return  false;
    });
}


function Varification(Email, OTP){
    let defaultClient = brevo.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.EMAIL_KEY;

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "My {{params.subject}}";
    sendSmtpEmail.htmlContent = `<html><body><h1> your otp number is : ${OTP}</h1></body></html>`;
    sendSmtpEmail.sender = { "name": "Shivam Shakya", "email": "shivdu2000@gmail.com" };
    sendSmtpEmail.to = [
      { "email": Email, "name": "Reciever" }
    ];
    sendSmtpEmail.replyTo = { "email": "shivdu2000@gmail.com", "name": "Shivam Shakya" };
    sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
    sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };


    apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
         console.log( {"Success" :  JSON.stringify(data)});
         return  true;
    }, function (error) {
         console.log( {"Failed" :  error});
         return  false;
    });
}


router.get('/sendEmailToAlumni', authorize, async (req, res) => {
    try {     
        const query = "SELECT * FROM UserProfile WHERE role = 'alumni'";
        const [result] = await connection.promise().execute(query); 
        console.log({result});

        result.map(result => {

             const Name = result.FirstName +' '+result.MiddleName +' '+result.LastName;
             sendToAlumni(result.Email , Name);
        })
        res.json({message : "successfully send"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export {sendToAlumni , Varification , router};


