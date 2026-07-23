import net from 'net';

const message = process.argv[2] || 'hello tcp';

// TCP: connect() triggers the 3-way handshake (SYN, SYN-ACK, ACK)
const client = net.createConnection({ port: 9996, host: '127.0.0.1' }, () => {
  console.log('Connected (TCP handshake done)');
  client.write(message); // TCP — no address needed, you're connected
  console.log(`Sent: "${message}"`);
});

// TCP: data arrives in order, guaranteed. Kernel handled retransmission.
client.on('data', (data: Buffer) => {
  console.log(`Reply: "${data.toString().trim()}"`);
  client.end(); // triggers FIN → 4-way teardown
});

// TCP: FIN received — connection is fully closed
client.on('end', () => {
  console.log('Disconnected (FIN received)');
});
