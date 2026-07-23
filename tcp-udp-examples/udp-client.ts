import dgram from 'dgram';

const client = dgram.createSocket('udp4');
const message = process.argv[2] || 'hello udp';

// UDP: sendto() — no connect(), no handshake. Just fire.
client.send(message, 9997, '127.0.0.1', (err) => {
  if (err) { console.error(err); client.close(); return; }
  console.log(`Sent: "${message}"`);
});

// UDP: no dedicated connection. Reply comes to this same handler.
client.on('message', (msg: Buffer) => {
  console.log(`Reply: "${msg}"`);
  client.close(); // instant — no FIN
});
