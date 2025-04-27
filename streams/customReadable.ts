import { Readable } from 'node:stream';
import type { ReadableOptions } from 'node:stream';
import fs from 'node:fs';

class ReadStream extends Readable {
  private filename: string;
  private fd: number | null;

  constructor(filename: string, options?: ReadableOptions) {
    super(options);
    this.filename = filename;
    this.fd = null;
  }
  _construct(callback) {
    fs.open(this.filename, (err, fd) => {
      if (err) {
        callback(err);
      } else {
        this.fd = fd;
        callback();
      }
    });
  }
  _read(n) {
    if (this.fd === null) {
      this.destroy(new Error('File descriptor is not set'));
      return;
    }
    const buf = Buffer.alloc(n);
    fs.read(this.fd, buf, 0, n, null, (err, bytesRead) => {
      if (err) {
        this.destroy(err);
      } else {
        this.push(bytesRead > 0 ? buf.slice(0, bytesRead) : null);
      }
    });
  }
  _destroy(err, callback) {
    if (this.fd) {
      fs.close(this.fd, (er) => callback(er || err));
    } else {
      callback(err);
    }
  }
}

const stream = new ReadStream('./text.txt');

stream.on('data', (chunk) => {
  console.log('chunk', chunk);
});

stream.on('end', () => {
  console.log('end');
});
