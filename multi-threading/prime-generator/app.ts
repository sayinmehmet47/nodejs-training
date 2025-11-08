import { Worker } from "node:worker_threads";
import { performance } from "node:perf_hooks";

const THREAD_COUNT = 1;
const count = 200;
let completed = 0;
let result: number[] = [];

const startTime = performance.now();

for (let i = 0; i < THREAD_COUNT; i++) {
  const worker = new Worker(new URL("../calc.ts", import.meta.url), {
    workerData: {
      count: count / THREAD_COUNT,
      start: 100_000_000_000_000 + i * 300,
    },
  });

  const threadId = worker.threadId;
  console.log(`Worker ${threadId} started.`);

  worker.on("message", (msg) => {
    result = result.concat(msg.primes);
  });

  worker.on("error", (err) => console.error(err));

  worker.on("exit", (code) => {
    console.log(`Worker ${threadId} exited.`);
    completed++;

    if (completed === THREAD_COUNT) {
      const endTime = performance.now();
      console.log(`Execution time: ${endTime - startTime} ms`);
      console.log(result);
    }

    if (code !== 0)
      console.error(`Worker ${threadId} exited with code ${code}`);
  });
}
