const { workerData, parentPort } = require("worker_threads");

let sum = 0;
let random;

for (let i = 0; i < workerData.count; i++) {
  random = Math.floor(1000 + Math.random() * 9000);
  sum += random;

  if (sum > 100_000_000) {
    sum = 0;
  }
}

parentPort.postMessage(sum);
