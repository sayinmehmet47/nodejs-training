import { IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import { getBody } from '../utils/get-body.js';
import { JWT_SECRET } from '../config/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loginUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const { username, password } = await getBody(req);
    const usersData = await readFile(
      path.join(__dirname, '../../users.json'),
      'utf-8'
    );
    const users = JSON.parse(usersData);
    const user = users.find(
      (u: any) => u.name === username && u.password === password
    );

    if (user) {
      const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
        expiresIn: '1h',
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Invalid credentials' }));
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Server error during login' }));
  }
};
