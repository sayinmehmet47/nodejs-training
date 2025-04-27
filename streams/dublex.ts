import { Duplex } from 'node:stream';
import fs from 'node:fs';
import type { DuplexOptions } from 'node:stream';

class FileDuplex extends Duplex {
  private readFd: number;
  private writeFd: number;

  constructor(options: DuplexOptions) {
    super(options);
    this.readFd = fs.openSync('input.txt', 'r');
    this.writeFd = fs.openSync('output.txt', 'w');
  }

  _read(size) {
    const buf = Buffer.alloc(size);
    fs.read(this.readFd, buf, 0, size, null, (err, bytesRead) => {
      if (bytesRead > 0) {
        this.push(buf.slice(0, bytesRead));
      } else {
        this.push(null);
      }
    });
  }

  _write(chunk, encoding, callback) {
    fs.write(this.writeFd, chunk, callback);
  }

  _final(callback) {
    fs.close(this.readFd, (err) => {
      fs.close(this.writeFd, callback);
    });
  }
}

const fileDuplex = new FileDuplex({});
fileDuplex.pipe(process.stdout);
fileDuplex.write('This will be written to output.txt\n');

fileDuplex.on('data', (chunk) => {
  console.log('chunk', chunk);
});

fileDuplex.on('end', () => {
  console.log('end');
});
