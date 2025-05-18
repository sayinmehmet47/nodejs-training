import net from 'net';

const client = net.createConnection({ port: 3099, host: '127.0.0.1' }, () => {
  console.log('Connected');
  const buffer = Buffer.alloc(8);
  buffer[0] = 2;
  buffer[1] = 12;

  client.write(buffer);
});

// client.on('data', (data) => {
//   console.log('Received:', data.toString());
//   client.end();
// });
