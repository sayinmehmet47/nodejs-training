import dgram from 'dgram';
import type { RemoteInfo } from 'dgram';

// socket(AF_INET, SOCK_DGRAM, 0) under the hood
const server = dgram.createSocket('udp4');

// UDP: no connection — anyone can send to you
// rinfo tells you WHO sent it (IP + port)
server.on('message', (msg: Buffer, rinfo: RemoteInfo) => {
  console.log(`Received ${msg.length} bytes from ${rinfo.address}:${rinfo.port} | "${msg}"`);

  // fire and forget — no connect(), just sendto()
  server.send(msg, rinfo.port, rinfo.address);
});

// UDP: just bind, no listen(), no accept()
server.bind(9997, () => {
  console.log('UDP server listening on 0.0.0.0:9997');
});

// UDP: no 'end' event — no FIN, no teardown. close() kills it instantly.
