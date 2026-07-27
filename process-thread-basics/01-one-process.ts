import { threadId } from "node:worker_threads";

const waitTimeMs: number = 30_000;

console.log("1. The process started.");
console.log(`   Process ID: ${process.pid}`);
console.log(`   Thread ID: ${threadId} (the main thread)`);

setTimeout(() => {
  console.log("3. The timer finished. The process can now exit.");
}, waitTimeMs);

console.log("2. Node.js will wait for 30 seconds. Inspect it now.");
