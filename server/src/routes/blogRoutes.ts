import express from 'express';
import { createBlog, getBlogById, getBlogs, updateBlog, moveBlogToTrash, restoreBlog, deleteBlogPermanently } from '../controllers/blogController';
import { authenticate } from '../controllers/authentication'; 

const router = express.Router();

router.post('/blogs', authenticate, createBlog);
// Public endpoints: listing and viewing individual blogs should be accessible without authentication
router.get('/blogs', getBlogs);
router.get('/blogs/:blogId', getBlogById);
router.patch('/blogs/:blogId', authenticate, updateBlog);
router.patch('/blogs/trash/:blogId', authenticate, moveBlogToTrash);
router.patch('/blogs/restore/:blogId', authenticate, restoreBlog);
router.delete('/blogs/:blogId', authenticate, deleteBlogPermanently);

export default router;
