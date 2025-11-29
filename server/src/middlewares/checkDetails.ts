import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

export const checkDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { emailAddress, userName } = req.body;

    const emailExists = await client.user.findUnique({
      where: { emailAddress },
    });

    if (emailExists) {
      return res.status(400).json({ message: 'Email address already in use' });
    }


    const usernameExists = await client.user.findUnique({
      where: { userName },
    });

    if (usernameExists) {
      return res.status(400).json({ message: 'Username already in use' });
    }

    next(); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error checking user details' });
  }
};
