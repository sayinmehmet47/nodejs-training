import { randomUUID } from 'node:crypto';
import net from 'node:net';

const server = net.createServer();

const clients = new Map();

server.on('error', (err) => {
  throw err;
});

server.on('connection', (socket) => {
  const clientId = randomUUID();
  console.log(`${clientId} connected!`);
  clients.set(socket, clientId);

  const joinMessage = `${clientId} has joined the chat`;
  for (const [client, _] of clients) {
    if (client !== socket) {
      client.write(`${joinMessage}\n`);
    }
  }

  socket.write(`Welcome! Your ID is ${clientId}\n`);

  socket.on('data', (data) => {
    const message = data.toString().trim();

    if (message) {
      const formattedMessage = `${clientId}: ${message}`;
      console.log('Broadcasting message:', formattedMessage);

      for (const [client, _] of clients) {
        if (client !== socket) {
          client.write(`${formattedMessage}\n`);
        }
      }
    }
  });

  socket.on('end', () => {
    const clientId = clients.get(socket);
    console.log(`${clientId} disconnected!`);

    const leaveMessage = `${clientId} has left the chat`;
    for (const [client, _] of clients) {
      if (client !== socket) {
        client.write(`${leaveMessage}\n`);
      }
    }

    clients.delete(socket);
  });

  socket.on('error', (err) => {
    console.error(`${clientId} error:`, err);
    clients.delete(socket);
  });
});

server.listen({ port: 8124, host: 'localhost' }, () => {
  console.log('opened server on', server.address());
});
