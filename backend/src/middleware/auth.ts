import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Customer from '../models/Customer';

interface JwtPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      customer?: Customer;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    const customer = await Customer.findByPk(decoded.id);

    if (!customer) {
      res.status(401).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    req.customer = customer;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
