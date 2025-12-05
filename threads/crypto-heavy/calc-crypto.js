import { workerData, parentPort } from "node:worker_threads";
import crypto from "node:crypto";

const buffer = Buffer.alloc(2);

function generateRandomNumber() {
  crypto.randomFillSync(buffer);
  const randomValue = buffer.readUInt16BE(0); // read the buffer as an unsigned 16-bit integer
  return randomValue;
}

let sum = 0;
let random;

for (let i = 0; i < workerData.count; i++) {
  random = generateRandomNumber();
  sum += random;

  if (sum > 100_000_000) {
    sum = 0;
  }
}

parentPort.postMessage(sum);
