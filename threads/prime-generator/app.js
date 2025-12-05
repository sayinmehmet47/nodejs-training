const { Worker } = require("worker_threads");
const { performance } = require("perf_hooks");

// count: 200, start: 100_000_000_000_000, time: 30s, threads=1, numbers
// count: 200, start: 100_000_000_000_000, time: 8s, threads=4, numbers

// count: 20, start: 12n ** 17n, time: 22s, threads=1, Bigints
// count: 80, start: 12n ** 17n, time: 82s, threads=1, Bigints
// count: 80, start: 12n ** 17n, time: 20s, threads=8, Bigints

let result = [];
const THREADS = 4;
let completed = 0;
const count = 100; // number of prime numbers that we want
const start = performance.now();

for (let i = 0; i < THREADS; i++) {
  const worker = new Worker("./calc.js", {
    workerData: {
      count: count / THREADS,
      start: 100_000_000_000_000 + i * 300,
    },
  });
  const threadId = worker.threadId;
  console.log(`Worker ${threadId} started.`);

  worker.on("message", (primes) => {
    result = result.concat(primes);
  });

  worker.on("error", (err) => {
    console.error(err);
  });

  worker.on("exit", (code) => {
    console.log(`Worker ${threadId} exited.`);

    completed++;

    if (completed === THREADS) {
      console.log(`Time Taken: ${performance.now() - start}ms`);
      console.log(result.sort());
    }

    if (code !== 0) {
      console.error(`Worker ${threadId} exited with code ${code}`);
    }
  });
}
