import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import upload from './Picture.js';
import connection from '../Connection/Connection.js';
import {authorize , authorizeStudent} from './Authorization.js';
const router = express();

router.use((req,res,next)=>{
      next();
})


router.post('/postUser', upload.single('image') ,async(req,res)=>{
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


router.post('/login', async (req,res)=>{
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
        console.log({token});
        res.status(200).json({ token , message : "Successfully Logged in." , user});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

router.get('/getUsers' , authorizeStudent ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM UserProfile';
        const [result] = await connection.promise().execute(query);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});

      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});


router.delete('/deleteUser/:id', authorizeStudent , async(req,res)=>{

    const {id} = req.params;
    try{
       const query = `DELETE FROM UserProfile WHERE id = ${id};`;
       const [result] = await connection.promise().execute(query);
       res.status(200).json({ 'data' : result , message : `Successfully Delete user with id : ${id}`});    
    }catch(err){
           console.error(err);
            res.status(500).json({ Error: 'Internal server error' });
      }
});


router.put('/updateUser/:id', authorizeStudent, async (req, res) => {
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


export default router;