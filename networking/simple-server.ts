import net, { Socket } from 'net';

const server = net.createServer((socket: Socket) => {
  console.log('Client connected:', socket.remoteAddress);

  socket.on('data', (data: Buffer) => {
    console.log('Server received:', data.toString());
    // socket.write('Echo: ' + data.toString()); // Echo reply
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3099;
server.listen(PORT, () => {
  console.log(`TCP server listening on port ${PORT}`);
});
