const { Worker, workerData, parentPort } = require("worker_threads");

/*
const port = workerData.port;

port.postMessage("some text for testing");

port.on("message", (msg) => {
  console.log("Worker received: ", msg);
});
*/

const port = parentPort;

port.postMessage("some text for testing");

port.on("message", (msg) => {
  console.log("Worker received: ", msg);
});
