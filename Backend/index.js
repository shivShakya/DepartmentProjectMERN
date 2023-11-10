import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import brevo from '@getbrevo/brevo';
import mysql from 'mysql2';
import multer from 'multer';
import env from 'dotenv';
import path from 'path';
env.config();


const app = express();
app.use(express.json());
app.use(cors());



// Important function for email verification

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



// Important fuction call for MySQL Database connection
let connection = mysql.createConnection({
    host: "localhost",
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    port: 3306, 
    database: 'department'
});

connection.connect((err)=>{
       if(err){throw err;}
       console.log("connected with database");
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'store/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  // Define a route for image upload
  app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No Picture uploaded.');
    }
    console.log("successfull");
    return res.status(200).send('File uploaded successfully.');
  });




//ALumni Post API ------
app.post('/postAlumni',upload.single('image'), async (req, res) => {
    const {
        PRN,
        FirstName,
        MiddleName,
        LastName,
        Email,
        Phone,
        PassingYear,
        Course,
        Company,
        Position,
        linkdin,
        sector,
        password,
        confirmPassword,
        image
    } = req.body;

    try {
        if (password === confirmPassword) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const query = 'INSERT INTO Alumni (PRN, FirstName, MiddleName, LastName, Email, Phone, PassingYear, Course, Company, Position, linkdin, sector, password,image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)';        
            const [result] = await connection.promise().execute(query, [PRN, FirstName, MiddleName, LastName, Email, Phone, PassingYear, Course, Company, Position, linkdin, sector, hashedPassword, image]);
            console.log(result);
            
            if (result.affectedRows === 1) {
                res.status(200).json({ message: "Successfully inserted" });
            } else {
                res.status(401).json({ message: "Some error occurred while inserting"});
            }
           } else {
                  res.status(400).json({ message: "Passwords are not matching" });
            }

         }
       catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" , error : err });
    }
});


//Student Post API ------
app.post('/postStudent',upload.single('image'), async (req, res) => {
    const {
        student_id,
        first_name,
        middle_name,
        last_name,
        address,
        course_id,
        semester,
        mobile_number,
        email_id,
        blood_group,
        linkedin_id,
        password,
        confirmPassword,
        image
    } = req.body;

    try {
        if (password === confirmPassword) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const query =  'INSERT INTO student (student_id, first_name, middle_name, last_name, address, course_id, semester, mobile_number, email_id, blood_group, linkedin_id, password, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const [result] = await connection.promise().execute(query, [student_id,first_name,middle_name,last_name,address,course_id,semester,mobile_number,email_id,blood_group,linkedin_id,hashedPassword,image]);
            console.log(result);
            
            if (result.affectedRows === 1) {
                res.status(200).json({ message: "Successfully inserted" });
            } else {
                res.status(401).json({ message: "Some error occurred while inserting"});
            }
           } else {
                  res.status(400).json({ message: "Passwords are not matching" });
            }

         }
       catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" , error : err });
    }
});



//Teacher Post API ------
app.post('/postTeacher',upload.single('image'), async (req, res) => {
    const {
        employe_id,
        first_name,
        middle_name,
        last_name,
        position,
        mobile_number,
        email_id,
        blood_group,
        number_of_phd_students_in_guidance,
        password,
        confirmPassword,
        image
    } = req.body;

    try {
        if (password === confirmPassword) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const query = 'INSERT INTO teacher (employe_id, first_name, middle_name, last_name, position, mobile_number, email_id, blood_group, number_of_phd_student_in_guidance, password, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

            const [result] = await connection.promise().execute(query, [ employe_id,first_name,middle_name,last_name,position,mobile_number,email_id,blood_group,number_of_phd_students_in_guidance,hashedPassword,image]);
            console.log(result);
            
            if (result.affectedRows === 1) {
                res.status(200).json({ message: "Successfully inserted" });
            } else {
                res.status(401).json({ message: "Some error occurred while inserting"});
            }
           } else {
                  res.status(400).json({ message: "Passwords are not matching" });
            }

         }
       catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" , error : err });
    }
});



//Email Verification and validation APIs and function  - #Important

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email) {
    return emailRegex.test(email);
  };

app.post('/emailVarification', async (req, res) => {
    const { Email} = req.body;
    console.log({Email});
     if(validateEmail(Email)){
        try {

            const OTP =Math.round(100*Math.random());
            Varification(Email , OTP);
            res.json({message : "successfully send" , generatedOTP: OTP});

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
     }else{
            res.status(500).json({error: "Email is not valid"});
     }
});

app.post('/otpMatch', (req,res)=> {
    const { userOTP, generatedOTP } = req.body;
    console.log({userOTP , generatedOTP});
    if (parseInt(userOTP,10) === generatedOTP) {
        res.json({ message: 'OTP verification successful' });
      } else {
        res.status(400).json({ message: 'OTP verification failed' });
      }
});








//login Authetification and Authorization ------->


function authorizeAdmin(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token not provided' });
    }
    console.log({token});
  
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN);
      if (decodedToken.role !== 'Admin') {
        return res.status(403).json({ message: 'Access forbidden for non-Admin users' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  
  

app.post('/login', async(req,res)=>{
       const {Email , password , role} = req.body;
     
       switch(role){
           case 'Alumni' :   try {

                                  const query = 'SELECT * FROM Alumni WHERE Email = ?';
                                  const [result] = await connection.promise().execute(query, [Email]);
                              
                                  if (result.length === 0) {
                                      res.status(400).json({ message: 'Alumni not found Please create an account' });
                                      return;
                                  }
                              
                                  const alumni = result[0];
                                  const passwordMatch = await bcrypt.compare(password, alumni.password);
        
                                  if (!passwordMatch) {
                                      res.status(400).json({ message: 'Password is incorrect' });
                                      return;
                                  }
                                  const token = jwt.sign({ email: alumni.Email, PRN: alumni.PRN , FirstName : alumni.FirstName , MiddleName : alumni.MiddleName , LastName : alumni.LastName, image : alumni.image ,role: 'Alumni' }, process.env.TOKEN);
                              
                                  res.status(200).json({ token , message : "Successfully Logged in."});
                              } catch (err) {
                                  console.error(err);
                                  res.status(500).json({ Error: 'Internal server error' });
                              }
                              break;


            case 'Student':   try {


                                   const query = 'SELECT * FROM student WHERE email = ?';
                                   const [result] = await connection.promise().execute(query, [Email]);
        
                                   if (result.length === 0) {
                                       res.status(400).json({ Error: 'Student not found Please create an account' });
                                       return;
                                    }
        
                                    const student = result[0];
                                    const passwordMatch = await bcrypt.compare(password, student.password);

                                     if (!passwordMatch) {
                                         res.status(400).json({ Error: 'Password is incorrect' });
                                         return;
                                     }
                                    const token = jwt.sign({ email: student.email_id, roll_no: student.student_id , FirstName : student.first_name , MiddleName : student.middle_name , LastName : student.last_name , image : student.image ,role: 'Student' }, process.env.TOKEN);
                                    res.status(200).json({ token , message : "Successfully Logged in."});
                                    } catch (err) {
                                          console.error(err);
                                          res.status(500).json({ Error: 'Internal server error' });
                                     }
                                    break;
          
        
               case 'Teacher':   try {

                                        const query = 'SELECT * FROM teacher WHERE email_id = ?';
                                        const [result] = await connection.promise().execute(query, [Email]);
             
                                        if (result.length === 0) {
                                            res.status(400).json({ Error: 'this account does not found Please create an account' });
                                            return;
                                         }
             
                                         const teacher = result[0];
                                         const passwordMatch = await bcrypt.compare(password, teacher.password);
     
                                          if (!passwordMatch) {
                                              res.status(400).json({ Error: 'Password is incorrect' });
                                              return;
                                          }
                                         const token = jwt.sign({ email: teacher.email_id, Teacher_id: teacher.employe_id , FirstName : teacher.first_name , MiddleName : teacher.middle_name , LastName : teacher.last_name  ,image : teacher.image ,role: 'Teacher' }, process.env.TOKEN);
                                         res.status(200).json({ token , message : "Successfully Logged in."});
                                         } catch (err) {
                                               console.error(err);
                                               res.status(500).json({ Error: 'Internal server error' });
                                          }
                                         break;


                case 'Admin':   try {
                                            const query = 'SELECT * FROM admin WHERE email_id = ?';
                                            const [result] = await connection.promise().execute(query, [Email]);
                 
                                            if (result.length === 0) {
                                                res.status(400).json({ Error: 'this account does not found Please create an account' });
                                                return;
                                             }
                 
                                             const admin = result[0];
                                             const passwordMatch = await bcrypt.compare(password, admin.password);
         
                                              if (!passwordMatch) {
                                                  res.status(400).json({ Error: 'Password is incorrect' });
                                                  return;
                                              }
                                             const token = jwt.sign({ email:admin.email_id, admin_id: admin.admin_id , name : admin.admin_name , role: 'Admin' }, process.env.TOKEN);
                                             res.status(200).json({ token , message : "Successfully Logged in."});

                                             } catch (err) {
                                                   console.error(err);
                                                   res.status(500).json({ Error: 'Internal server error' });
                                              }
                                             break;
        
       }
});




app.get('/getAlumni', authorizeAdmin, async(req,res)=>{    
      try{
        const query = 'SELECT * FROM Alumni';
        const [result] = await connection.promise().execute(query);
        console.log(result);

        res.status(200).json({ 'data' : result , message : "Successfully fetched all admin"});

      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});


app.get('/getAlumni', authorizeAdmin, async(req,res)=>{    
  try{
    const query = 'SELECT * FROM Alumni';
    const [result] = await connection.promise().execute(query);
    console.log(result);

    res.status(200).json({ 'data' : result , message : "Successfully fetched all admin"});

  }catch(err){
    console.error(err);
    res.status(500).json({ Error: 'Internal server error' });
  }
});

app.listen( process.env.PORT , ()=>{
       console.log(`http://localhost:${process.env.PORT}`)
})