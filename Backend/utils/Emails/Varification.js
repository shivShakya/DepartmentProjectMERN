import express from 'express';
import brevo from '@getbrevo/brevo';
import env from 'dotenv';
env.config();

const router = express();
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email) {
    return emailRegex.test(email);
  };


router.post('/emailVarification', async (req, res) => {
    const { Email} = req.body;
     if(validateEmail(Email)){
        try {

            const OTP =Math.round(100*Math.random());
            Varification(Email , OTP);
            res.json({message : "successfully send" , generatedOTP: OTP});
            console.log(OTP);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
     }else{
            res.status(500).json({error: "Email is not valid"});

     }
});



router.post('/otpMatch', (req,res)=> {
    const { userOTP, generatedOTP } = req.body;
    console.log({userOTP , generatedOTP});
    if (parseInt(userOTP,10) === generatedOTP) {
        console.log({ message: 'OTP verification successful' });
        res.json({ success : true ,  message: 'OTP verification successful' });
      } else {
        console.log({ message: 'OTP verification failed' });
        res.status(400).json({ success : false ,message: 'OTP verification failed' });
      }
});

export default router;
