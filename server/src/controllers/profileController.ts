import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import bcrypt from "bcryptjs";

// GET /profile
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          emailAddress: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile." });
  }
};

// update profile
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { firstName, lastName, userName, emailAddress } = req.body;

    if (userName) {
      const existingUsername = await prisma.user.findFirst({
        where: { userName, NOT: { id: req.user.id } },
      });
      if (existingUsername)
        return res
          .status(400)
          .json({ message: "The username you have provided is already associated by another account" });
    }

    if (emailAddress) {
      const existingEmail = await prisma.user.findFirst({
        where: { emailAddress, NOT: { id: req.user.id } },
      });
      if (existingEmail)
        return res
          .status(400)
          .json({ message: "The email you have provided is already associated by another account" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, userName, emailAddress },
      select: {
        firstName: true,
        lastName: true,
        userName: true,
        emailAddress: true,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile." });
  }
};

// GET profile blogs
export const getUserBlogs = async (req: any, res: Response) => {
  try {
    console.log("Authenticated user ID:", req.user?.id);
    const blogs = await prisma.blog.findMany({
      where: { userId: req.user.id, isDeleted: false },
      select: {
        id: true,
        title: true,
        synopsis: true,
        featuredImageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs." });
  }
};

// GET profile trashed blogs
export const getUserTrashedBlogs = async (req: any, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { userId: req.user.id, isDeleted: true },
      select: {
        id: true,
        title: true,
        synopsis: true,
        featuredImageUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ blogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching trashed blogs." });
  }
};

// update password
export const updatePassword = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new passwords are required." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found." });

  
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating password." });
  }
};
