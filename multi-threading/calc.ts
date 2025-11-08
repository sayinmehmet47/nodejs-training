import { parentPort, workerData } from "node:worker_threads";
import { generatePrimes } from "./prime-generator/prime-generator.js"; // adjust path!

const { count, start } = workerData;

const primes = generatePrimes(count, start, { format: true });
console.log(primes);

parentPort?.postMessage({ primes });
