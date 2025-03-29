import nextConnect from 'next-connect';
import fs from 'fs';
import path from 'path';

const apiRoute = nextConnect();

apiRoute.post((req, res) => {
    const { tempId, blockId } = req.body;

    const tempDir = path.join(process.cwd(), 'public', 'images', 'users', 'watches', tempId);
    const blockDir = path.join(process.cwd(), 'public', 'images', 'users', 'watches', blockId);

    if (!fs.existsSync(tempDir)) {
        return res.status(404).json({ error: 'Temp directory not found' });
    }

    if (!fs.existsSync(blockDir)) {
        fs.mkdirSync(blockDir, { recursive: true });
    }

    fs.readdirSync(tempDir).forEach((file) => {
        fs.renameSync(path.join(tempDir, file), path.join(blockDir, file));
    });

    fs.rmdirSync(tempDir); // Remove temp directory

    res.status(200).json({ message: 'Files moved successfully' });
});

export default apiRoute;
