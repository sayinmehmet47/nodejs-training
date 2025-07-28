import { stdin, stdout, exit } from "node:process";
import { createReadStream, readFile } from "node:fs";

const fileName = process.argv[2];

if (fileName) {
  readFile(fileName, (err, data) => {
    if (err) {
      console.error(err);
      exit(1);
    }
    stdout.write(data);
    exit(0);
  });
}

stdin.on("data", async (chunk) => {
  stdout.write(chunk.toString().toUpperCase());
});
