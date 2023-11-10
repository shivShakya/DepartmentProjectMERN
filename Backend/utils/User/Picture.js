import multer from 'multer';

// Image storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'stores/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

export default upload;