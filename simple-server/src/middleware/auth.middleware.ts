import { IncomingMessage, ServerResponse } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.js';

export const authMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({ message: 'Unauthorized: No token provided' })
      );
    }
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Unauthorized: Invalid token' }));
  }
};
