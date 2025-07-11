import { IncomingMessage } from 'http';

export const getBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve(body); // Resolve with the raw body if it's not JSON
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};
