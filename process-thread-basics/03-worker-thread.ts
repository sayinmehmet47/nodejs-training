import { parentPort, threadId, workerData } from "node:worker_threads";

type CalculationInput = {
  firstNumber: number;
  secondNumber: number;
};

console.log(`Worker: process ID = ${process.pid}, thread ID = ${threadId}`);

const { firstNumber, secondNumber } = workerData as CalculationInput;
const result: number = firstNumber * secondNumber;

parentPort?.postMessage({ firstNumber, secondNumber, result });
