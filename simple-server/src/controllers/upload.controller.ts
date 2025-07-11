import { IncomingMessage, ServerResponse } from 'http';
import { createWriteStream } from 'fs';
import { stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storageFolder = path.join(__dirname, '../../storage');

export const uploadFile = async (req: IncomingMessage, res: ServerResponse) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    return res.end('Content-Type must be multipart/form-data');
  }

  let body = '';
  req.on('data', (chunk) => (body += chunk.toString('binary')));
  req.on('end', async () => {
    try {
      await stat(storageFolder); // Check if storage directory exists
      const boundary = contentType.split('boundary=')[1];
      const parts = body.split(`--${boundary}`);
      const filePart = parts.find((part) => part.includes('filename'));

      if (!filePart) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('File data not found in request');
      }

      const filenameMatch = filePart.match(/filename="(.*)"/);
      const fileName = filenameMatch ? filenameMatch[1] : 'uploaded_file';
      const fileContent = filePart.split('\r\n\r\n')[1].trim();

      if (!fileContent) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        return res.end('File content is empty');
      }

      const filePath = path.join(storageFolder, fileName);
      const writeStream = createWriteStream(filePath, 'binary');
      writeStream.write(fileContent, 'binary');
      writeStream.end();

      writeStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'File uploaded successfully' }));
      });

      writeStream.on('error', (err) => {
        console.error('File write error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error during upload');
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Storage directory not found on server.');
        return;
      }
      console.error('Upload processing error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error processing upload');
    }
  });
};
