import { Worker } from "node:worker_threads";

const sharedMemory: SharedArrayBuffer = new SharedArrayBuffer(
  Int32Array.BYTES_PER_ELEMENT,
);
const sharedNumbers: Int32Array = new Int32Array(sharedMemory);

sharedNumbers[0] = 10;
console.log(`Main: value before worker = ${sharedNumbers[0]}`);

const worker = new Worker(new URL("./04-shared-worker.ts", import.meta.url), {
  workerData: { sharedMemory },
});

worker.once("message", (message: string) => {
  console.log(message);
  console.log(`Main: value after worker = ${sharedNumbers[0]}`);
});

worker.once("error", (error) => {
  console.error("Worker thread failed:", error);
});
