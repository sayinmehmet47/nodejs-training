import { threadId, Worker } from "node:worker_threads";

type CalculationResult = {
  firstNumber: number;
  secondNumber: number;
  result: number;
};

console.log(`Main:   process ID = ${process.pid}, thread ID = ${threadId}`);

const worker = new Worker(new URL("./03-worker-thread.ts", import.meta.url), {
  workerData: { firstNumber: 7, secondNumber: 6 },
});

worker.once("message", ({
  firstNumber,
  secondNumber,
  result,
}: CalculationResult) => {
  console.log(`Worker calculated ${firstNumber} * ${secondNumber} = ${result}.`);
});

worker.once("error", (error) => {
  console.error("Worker thread failed:", error);
});

worker.once("exit", (exitCode) => {
  if (exitCode === 0) {
    console.log("Worker thread finished.");
  }
});
