import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const client = new PrismaClient();

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, emailAddress, userName, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.user.create({
      data: {
        firstName,
        lastName,
        emailAddress,
        userName,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    const user = await client.user.findFirst({
      where: {
        OR: [
          { userName: identifier },
          { emailAddress: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Wrong login credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Wrong login credentials' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.emailAddress,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY as string, { expiresIn: '1h' });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        emailAddress: user.emailAddress
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// AUTHENTICATE Middleware 
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as {
      id: string;
      email: string;
    };

    (req as any).user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
