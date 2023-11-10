import express from 'express';
import upload from '../User/Picture.js';
import connection from '../Connection/Connection.js';
import {authorize} from '../User/Authorization.js';

const router = express();
router.use((req,res,next)=>{
     next();
});
router.post('/postScreen', upload.single('image') , authorize ,  async (req,res) => {
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


router.get('/getScreen' , async (req,res) => {
    try {
           const query = 'select * from Screen';
           const [result] = await connection.promise().execute(query, [1]); 
           res.status(200).json({ status: 'success', data: result, message: 'Successfully fetched Screen' });
   } catch (err) {
           console.error(err);
         res.status(500).json({ status: 'error', message: 'Internal server error' });
   }
 }); 

 router.delete('/deleteScreen' , authorize , async (req,res) => {
    try {
       const query = 'DELETE FROM Screen';
       const [result] = await connection.promise().execute(query, [1]); 
       res.status(200).json({ status: 'success', data: result, message: 'Successfully fetched Screen' });
} catch (err) {
       console.error(err);
     res.status(500).json({ status: 'error', message: 'Internal server error' });
}
});

export default router;