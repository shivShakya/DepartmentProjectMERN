import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import brevo from '@getbrevo/brevo';
import mysql from 'mysql2';
import multer from 'multer';
import env from 'dotenv';
env.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use('/images/store', express.static('/Users/jyoti-alok/Desktop/DeptProj/Backend/store'));

// Important function call for MySQL Database connection
let connection = mysql.createConnection({
    host: "localhost",
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    port: 3306,
    database: 'dept'
});

connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("connected with database");
});

// Image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'store/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });


// POST User
app.post('/postUsers', upload.single('image') , async (req, res) => {

    console.log({ 'data' : JSON.parse(req.body.user)});

    const {
        id, FirstName, MiddleName, LastName,
        Address, Semester, Email, Phone,
        PassingYear, Position, Course,
        Company, Linkdin, Sector, Password,
        ConfirmPassword, Role
    } = JSON.parse(req.body.user);

    const new_image = req.file ? `/store/${req.file.filename}` : '';
    console.log({new_image});

    try {
        console.log(JSON.parse(req.body.user));
        if (Password !== ConfirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const query = 'INSERT INTO UserProfile (id, FirstName, MiddleName, LastName, Address, Semester, Email, Phone, PassingYear, Position, Course, Company, Linkdin, Sector, Password, Image, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        const [result] = await connection.promise().execute(query, [id, FirstName, MiddleName, LastName, Address, Semester, Email, Phone, PassingYear, Position, Course, Company, Linkdin, Sector, hashedPassword, new_image, Role]);
        console.log(result);


        if (result.affectedRows === 1 ) {
            return res.status(200).json({ message: "Successfully inserted User in database" });
        } else {
            return res.status(401).json({ message: "Some error occurred while inserting." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error });
    }
});



//login 




app.post('/login', async (req, res) => {
    const { Email, Password , Role} = req.body;
    console.log(req.body);
    try {
        let queryLogin;
        if(Role === 'Admin'){
            queryLogin = 'SELECT * FROM adminTable WHERE email = ?';
        }else{
            queryLogin = 'SELECT * FROM UserProfile WHERE email = ?';
        }
        const [resultLogin] = await connection.promise().execute(queryLogin, [Email]);

        if (resultLogin.length === 0) {
            return res.status(401).json({ message: "Authentication failed. Invalid email or password." });
        }

        const user = resultLogin[0];
        console.log(user);
        const passwordMatch = await bcrypt.compare(Password, user.Password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Authentication failed. Invalid email or password." });
        }

        const token = jwt.sign({ id : user.id , email: Email, role: Role , Name : user.FirstName  + " " + user.MiddleName + " " + user.LastName , Address: user.Address , Semester : user.Semester ,Phone : user.Phone ,Image : user.Image }, process.env.TOKEN );

        res.status(200).json({ token , message : "Successfully Logged in." , user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});



function authorize(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token not provided' });
    }
    console.log({token});
  
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN);
      if (decodedToken.role !== 'Admin' ) {
        return res.status(403).json({ message: 'Access forbidden for non-Admin users' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  function authorizeStudent(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token not provided' });
    }
    console.log({token});
  
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN);
      if (decodedToken.role !== 'Admin' && decodedToken.role !== 'Student' ) {
        return res.status(403).json({ message: 'Access forbidden for non-Admin users' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }





app.get('/getUsers' , authorizeStudent ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM UserProfile';
        const [result] = await connection.promise().execute(query);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});

      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});



app.delete('/deleteUser/:id', authorizeStudent , async(req,res)=>{

     const {id} = req.params;
     try{
        const query = `DELETE FROM UserProfile WHERE id = ${id};`;
        const [result] = await connection.promise().execute(query);
        res.status(200).json({ 'data' : result , message : `Successfully Delete user with id : ${id}`});    
     }catch(err){
            console.error(err);
             res.status(500).json({ Error: 'Internal server error' });
       }
})


app.put('/updateUser/:id', authorizeStudent, async (req, res) => {
    const { id } = req.params;
    const updated = req.body;
    const newUpdated = {};

    for (const key in updated) {
        if (updated[key] !== null && updated[key] !== '') {
            newUpdated[key] = updated[key];
        }
    }

    try {
        let query = 'UPDATE UserProfile SET ';
        const values = [];

        for (const key in newUpdated) {
            query += `${key} = ?, `;
            values.push(newUpdated[key]);
        }
        query = query.slice(0, -2);
        query += ' WHERE id = ?';
        values.push(id);

        const [result] = await connection.promise().execute(query, values);
        console.log(result);
        res.status(200).json({ data: result, message: `Successfully updated user with id: ${id}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
    }
});




//filters

app.get('/courseFilter/:course', authorizeStudent , async (req, res) => {
    const { course } = req.params;
    try {
        const query = 'SELECT * FROM UserProfile WHERE Course = ?';
        const [result] = await connection.promise().execute(query, [course]);
        res.status(200).json({ data: result, message: `Successfully fetched users with Course: ${course}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
    }
});

app.get('/semFilter/:semester', authorizeStudent, async (req, res) => {
    const { semester } = req.params;
    try {
        const query = 'SELECT * FROM UserProfile WHERE Semester = ?';
        const [result] = await connection.promise().execute(query, [semester]);
        res.status(200).json({ data: result, message: `Successfully fetched users with Course: ${semester}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
    }
});

app.get('/secFilter/:sector', authorizeStudent , async (req, res) => {
    const { sector } = req.params;
    try {
        const query = 'SELECT * FROM UserProfile WHERE Sector = ?';
        const [result] = await connection.promise().execute(query, [sector]);
        res.status(200).json({ data: result, message: `Successfully fetched users with Course: ${sector}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
    }
});


app.get('/yearFilter/:year', authorizeStudent , async (req, res) => {
    const { year } = req.params;
    console.log({year})
    try {
        const query = 'SELECT * FROM UserProfile WHERE PassingYear = ?';
        const [result] = await connection.promise().execute(query, [year]);
        console.log(result);
        res.status(200).json({ data: result, message: `Successfully fetched users with Course: ${year}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
    }
});


app.get('/bestAlumniList' , async (req,res)=>{
       try{
           const query = "SELECT * FROM UserProfile WHERE Role = 'Alumni' ORDER BY RAND() LIMIT 2";
           const [result] = await connection.promise().execute(query);
           console.log({result});

           res.status(200).json({ data: result, message: `Successfully fetched alumni` });
       }catch(err){
            console.error(err);
            res.status(500).json({ Error: 'Internal server error' });
       }
});

app.get('/bestProjectList' , async (req,res)=>{
    try{
        const query = "SELECT * FROM projectSection ORDER BY RAND() LIMIT 2";
        const [result] = await connection.promise().execute(query);
        console.log({result});

        res.status(200).json({ data: result, message: `Successfully fetched Projects` });
    }catch(err){
         console.error(err);
         res.status(500).json({ Error: 'Internal server error' });
    }
});


//Project submission
app.post('/postProject', upload.single('image'), async (req, res) => {
    console.log({ 'data': JSON.parse(req.body.project) });

    const {
        Title, Github_link, Sector,
        Description, File_path, Demo_link,
    } = JSON.parse(req.body.project);

    const {student_id} = req.body ;
    console.log({student_id : student_id})

    const new_image = req.file ? `/store/${req.file.filename}` : '';
    console.log({ new_image });

    try {
        console.log(JSON.parse(req.body.project));

        const query = 'INSERT INTO projectSection (Title, Github_link, Sector, Description, File_path, Demo_link, Image,Apporved ,Student_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await connection.promise().execute(query, [Title, Github_link, Sector, Description, File_path, Demo_link, new_image,false,student_id]);
        console.log(result);

        if (result.affectedRows === 1) {
            return res.status(200).json({ message: "Successfully inserted project in the database" });
        } else {
            return res.status(401).json({ message: "Some error occurred while inserting." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error });
    }
});

app.get('/getProject' , authorize ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM projectSection';
        const [result] = await connection.promise().execute(query);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});
      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});

app.put('/approveProject/:id', authorize, async (req, res) => {
    const { id } = req.params;
    const approved = req.query.approved;
    console.log({id , approved});
    const approve = approved === '0' ? '1' : '0';

    try {
      const query = "UPDATE projectSection SET Apporved = ? WHERE Project_id = ?";
      const [result] = await connection.promise().execute(query, [approve , id]);
  
      if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Project not found' });
      } else {
        res.status(200).json({ message: `Project ${approve} ` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/getApprovedProject', async (req, res) => {
    try {
      const query = 'SELECT * FROM projectSection WHERE Apporved = ?';
      const [rows] = await connection.promise().execute(query, [1]); 
  
      res.status(200).json({ status: 'success', data: rows, message: 'Successfully fetched approved projects' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });
  
  app.get('/getStudentByProject/:id', async (req, res) => {
    const {id} = req.params;
    console.log({id})
    try {
      const query = 'SELECT * FROM UserProfile WHERE id = ?';
      const [rows] = await connection.promise().execute(query, [id]); 
      res.status(200).json({ status: 'success', data: rows, message: 'Successfully fetched student' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });

  app.post('/postScreen', upload.single('image') , authorize ,async (req,res) => {
        const new_image = req.file ? `/store/${req.file.filename}` : '';
        console.log({ new_image });
        const { description } = req.body ;

       try {
            const query = 'UPDATE Screen SET Image = ?, Description = ? WHERE Screen_id = ?';
            const [result] = await connection.promise().execute(query, [new_image , description , 1]);
            console.log(result);

            if (result.affectedRows === 1) {
                 return res.status(200).json({ message: "Successfully inserted project in the database" });
            } else {
                return res.status(401).json({ message: "Some error occurred while inserting." });
           }

      } catch (error) {
           console.error(error);
           return res.status(500).json({ message: "Internal server error", error: error });
       }
  });

  app.get('/getScreen' , async (req,res) => {
     try {
            const query = 'select * from Screen';
            const [result] = await connection.promise().execute(query, [1]); 
            res.status(200).json({ status: 'success', data: result, message: 'Successfully fetched Screen' });
    } catch (err) {
            console.error(err);
          res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }); 

  app.delete('/deleteScreen' , authorize , async (req,res) => {
         try {
            const query = 'DELETE FROM Screen';
            const [result] = await connection.promise().execute(query, [1]); 
            res.status(200).json({ status: 'success', data: result, message: 'Successfully fetched Screen' });
    } catch (err) {
            console.error(err);
          res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });


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

app.get('/sendEmailToAlumni', authorize, async (req, res) => {
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


const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email) {
    return emailRegex.test(email);
  };


app.post('/emailVarification', async (req, res) => {
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


app.post('/otpMatch', (req,res)=> {
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




app.listen(4000, () => {
    console.log(`http://localhost:4000`)
})




