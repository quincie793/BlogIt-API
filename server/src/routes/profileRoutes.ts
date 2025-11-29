import express from "express";
import { authenticate } from "../controllers/authentication";
import {
  getProfile,
  updateProfile,
  getUserBlogs,
  getUserTrashedBlogs,
  updatePassword,
} from "../controllers/profileController";

const router = express.Router();

router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);
router.get("/profile/blogs", authenticate, getUserBlogs);
router.get("/profile/blogs/trash", authenticate, getUserTrashedBlogs);
router.patch("/auth/password", authenticate, updatePassword);

export default router;
