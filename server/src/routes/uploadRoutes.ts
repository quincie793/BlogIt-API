import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { uploadImage } from '../controllers/uploadController';

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
try {
	if (!fs.existsSync(uploadsDir)) {
		fs.mkdirSync(uploadsDir, { recursive: true });
	}
} catch (err) {
	console.error('Failed to ensure uploads directory exists:', err);
}

const upload = multer({ dest: uploadsDir });

router.post('/upload', upload.single('file'), uploadImage);

export default router;
