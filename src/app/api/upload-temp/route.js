import nextConnect from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { tempId } = req.body;
        const dir = path.join(process.cwd(), 'public', 'images', 'users', 'watches', tempId);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

const apiRoute = nextConnect();


apiRoute.use(upload.array('files'));

apiRoute.post(async (req, res) => {
    res.status(200).json({ message: 'Success' });
    /*
    try {
        console.log('Temp ID:', req.body.tempId); // Log tempId
        console.log('Files:', req.files); // Log files
        
        const fileUrls = req.files.map((file) => `/images/users/watches/${req.body.tempId}/${file.filename}`);
        res.status(200).json({ urls: fileUrls });
    } catch (error) {
        console.error('Error in upload-temp API:', error); // Log error details
        res.status(500).json({ error: 'Internal Server Error' });
    }
    */
});


export default apiRoute;

export const config = {
    api: {
        bodyParser: false,
    },
};
