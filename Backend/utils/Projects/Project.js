import express from 'express';
import upload from '../User/Picture.js';
import connection from '../Connection/Connection.js';
import {authorize} from '../User/Authorization.js';


const router = express();
router.use((req,res,next)=>{
        next();
});



//Project submission
router.post('/postProject', upload.single('image'), async (req, res) => {
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




router.get('/getProject' , authorize ,async(req,res)=>{
    try{
        const query = 'SELECT * FROM projectSection';
        const [result] = await connection.promise().execute(query);
        res.status(200).json({ 'data' : result , message : "Successfully fetched all Users"});
      }catch(err){
        console.error(err);
        res.status(500).json({ Error: 'Internal server error' });
      }
});



router.put('/approveProject/:id', authorize, async (req, res) => {
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




router.get('/getApprovedProject', async (req, res) => {
    try {
      const query = 'SELECT * FROM projectSection WHERE Apporved = ?';
      const [rows] = await connection.promise().execute(query, [1]); 
  
      res.status(200).json({ status: 'success', data: rows, message: 'Successfully fetched approved projects' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });



router.get('/getStudentByProject/:id', async (req, res) => {
    const {id} = req.params;
    try {
      const query = 'SELECT * FROM UserProfile WHERE id = ?';
      const [rows] = await connection.promise().execute(query, [id]); 
      res.status(200).json({ status: 'success', data: rows, message: 'Successfully fetched student' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });


export default router;




