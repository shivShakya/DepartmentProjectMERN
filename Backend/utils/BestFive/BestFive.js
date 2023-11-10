import express from 'express';
import connection from '../Connection/Connection.js';
const router = express();


router.get('/bestAlumniList' , async (req,res)=>{
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

router.get('/bestProjectList' , async (req,res)=>{
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

export default router;


