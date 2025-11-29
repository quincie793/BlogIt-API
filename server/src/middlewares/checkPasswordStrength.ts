import { Request, Response, NextFunction } from "express";
import zxcvbn from "zxcvbn";

export const checkPasswordStrength = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;

  
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  const result = zxcvbn(password);
  if (result.score < 2) {
    return res.status(400).json({
      message: "Password is too weak. Try adding numbers, symbols, or mixing uppercase/lowercase letters.",
      suggestions: result.feedback.suggestions,
    });
  }

  next();
};
