import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "node:stream";
import { createGzip, createGunzip } from "zlib";

// const gzip = createGzip();
// const source = createReadStream("largefile_5GB.txt");
// const destination = createWriteStream("input.text.gz");

// pipeline(source, gzip, destination, (err) => {
//   if (err) {
//     console.error("An error occured", err);
//     process.exitCode = 1;
//   }
// });

// gunzip for decompression
const gunzip = createGunzip();
const decompressionSource = createReadStream("input.text.gz");
const decompressionDestination = createWriteStream("decompressed.txt");

pipeline(decompressionSource, gunzip, decompressionDestination, (err) => {
  if (err) {
    console.error("An error occured", err);
    process.exitCode = 1;
  }
});
