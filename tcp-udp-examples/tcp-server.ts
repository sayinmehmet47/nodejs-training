import net from 'net';

// socket(AF_INET, SOCK_STREAM, 0) under the hood
const server = net.createServer((socket) => {
  // TCP: socket is DEDICATED to one client (accept() returned a new fd)
  console.log(`Client connected from ${socket.remoteAddress}:${socket.remotePort}`);

  // TCP: stream-oriented — reads are a continuous flow of bytes
  socket.on('data', (data: Buffer) => {
    console.log(`Received: "${data.toString().trim()}"`);
    socket.write(data); // TCP guarantees delivery + ordering
  });

  // TCP: FIN received — other side called close()/end()
  socket.on('end', () => {
    console.log('Client disconnected (FIN received)');
  });
});

// TCP: bind() + listen() — kernel creates a backlog queue
server.listen(9996, () => {
  console.log('TCP server listening on 0.0.0.0:9996');
});
