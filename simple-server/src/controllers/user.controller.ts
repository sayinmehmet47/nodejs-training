import { IncomingMessage, ServerResponse } from 'http';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getUsers = (req: IncomingMessage, res: ServerResponse) => {
  const filePath = path.join(__dirname, '../../users.json');
  const readStream = createReadStream(filePath);

  readStream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Error reading users data' }));
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  readStream.pipe(res);
};
