import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req: any, res: Response) => {
  try {
    // quick validation: ensure cloudinary env vars are present
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials are missing in environment variables');
      return res.status(500).json({ message: 'Server misconfiguration: Cloudinary credentials missing.' });
    }

    // log minimal file info to help debug (do not log file contents or secret data)
    console.log('Upload request received. file present?', !!req.file);
    if (req.file) {
      console.log('Uploaded file info:', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, path: req.file.path });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;

    // ensure file exists before attempting upload
    if (!fs.existsSync(filePath)) {
      console.error('Uploaded file not found at path:', filePath);
      return res.status(500).json({ message: 'Uploaded file not found on server.' });
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'blogit',
      resource_type: 'image',
    });

    // remove temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.warn('Failed to remove temp file', e);
    }

    return res.status(200).json({ url: result.secure_url });
  } catch (error: any) {
    console.error('Upload error:', error && error.message ? error.message : error);
    // return error details in dev mode to help debugging (safe for local dev)
    return res.status(500).json({ message: 'Image upload failed.', error: error?.message || String(error) });
  }
};
