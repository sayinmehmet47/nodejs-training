import { parentPort, workerData } from "node:worker_threads";

type SharedWorkerData = {
  sharedMemory: SharedArrayBuffer;
};

const { sharedMemory } = workerData as SharedWorkerData;
const sharedNumbers: Int32Array = new Int32Array(sharedMemory);
const oldValue: number = Atomics.add(sharedNumbers, 0, 5);
const newValue: number = Atomics.load(sharedNumbers, 0);

parentPort?.postMessage(
  `Worker: changed the shared value from ${oldValue} to ${newValue}`,
);
