import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicFolder = path.join(__dirname, './public');

const server = http.createServer((req, res) => {
  let filePath;
  let contentType;
  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(publicFolder, 'index.html');
    contentType = 'text/html';
  } else if (req.url === '/styles.css') {
    filePath = path.join(publicFolder, 'styles.css');
    contentType = 'text/css';
  } else if (req.url === '/api/users' && req.method === 'GET') {
    filePath = path.join(__dirname, 'users.json');
    contentType = 'application/json';
  } else if (req.url === '/script.js') {
    filePath = path.join(publicFolder, 'script.js');
    contentType = 'text/javascript';
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404: File not found');
    return;
  }

  const readStream = createReadStream(filePath);

  readStream.on('error', (err) => {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500: Server error');
  });

  res.writeHead(200, { 'Content-Type': contentType });
  readStream.pipe(res);
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
