import { Request, Response, NextFunction } from 'express';
import db from '../DB';

export interface RequestWithUserId extends Request {
  userId: number;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If we have a token cookie, then save the userId to the req object
  if (req.headers.cookie) {
    const token = req.headers.cookie.split('=')[1];

    db.update();
    const session = db.sessions.find(
      (session) => session.token === parseInt(token)
    );
    if (session) {
      (req as RequestWithUserId).userId = session.userId;
      return next();
    }
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

export const serverIndex = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const routes = ['/', '/login', '/profile'];

  if (routes.indexOf(req.url) !== -1 && req.method === 'GET') {
    return res.status(200).sendFile('./public/index.html', { root: './' });
  } else {
    next();
  }
};
