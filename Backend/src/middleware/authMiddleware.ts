import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export default function auth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error' });
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
