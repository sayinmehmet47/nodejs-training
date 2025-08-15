import { Request, Response, NextFunction } from 'express';
import db from '../DB';

export const logUserIn = (req: Request, res: Response, next: NextFunction) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if the user exists
  db.update();
  const user = db.users.find((user) => user.username === username);

  // Check the password if the user was found
  if (user && user.password === password) {
    // At this point, we know that the client is who they say they are

    // Generate a random 10 digit token
    const token = Math.floor(Math.random() * 10000000000).toString();

    // Save the generated token
    db.sessions.push({ userId: user.id, token: parseInt(token) });
    db.save();

    res.setHeader('Set-Cookie', `token=${token}; Path=/;`);
    res.status(200).json({ message: 'Logged in successfully!' });
  } else {
    return next({ status: 401, message: 'Invalid username or password.' });
  }
};

export const logUserOut = (req: Request, res: Response) => {
  // Remove the session object form the DB SESSIONS array
  db.update();
  const sessionIndex = db.sessions.findIndex(
    (session) => session.userId === (req as any).userId
  );
  if (sessionIndex > -1) {
    db.sessions.splice(sessionIndex, 1);
    db.save();
  }
  res.setHeader(
    'Set-Cookie',
    `token=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
  res.status(200).json({ message: 'Logged out successfully!' });
};

export const sendUserInfo = (req: Request, res: Response) => {
  db.update();
  const user = db.users.find((user) => user.id === (req as any).userId);
  if (user) {
    res.json({ username: user.username, name: user.name });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

export const updateUser = (req: Request, res: Response) => {
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;

  // Grab the user object that is currently logged in
  db.update();
  const user = db.users.find((user) => user.id === (req as any).userId);

  if (user) {
    user.username = username;
    user.name = name;

    // Only update the password if it is provided
    if (password) {
      user.password = password;
    }

    db.save();

    res.status(200).json({
      username: user.username,
      name: user.name,
      password_status: password ? 'updated' : 'not updated',
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
