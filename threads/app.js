const { Worker, MessageChannel } = require("worker_threads");

/* Example 1 - workerData
const obj = { name: "Joe" };

new Worker("./calc.js", { workerData: obj });

console.log("Object from main thread:", obj);
*/

/* Example 2 - Message channels
const channel = new MessageChannel();

const port1 = channel.port1;
const port2 = channel.port2;

port1.postMessage({ name: "Joe" });
port2.postMessage({ name: "Joe" });


port1.on("message", (msg) => {
  console.log(`Message received on port1: `, msg);
});

port2.on("message", (msg) => {
  console.log(`Message received on port2: `, msg);
});
*/

/* Example 3 - Communication between 2 worker threads 
const { port1, port2 } = new MessageChannel();

const thread1 = new Worker("./calc.js", {
  workerData: { port: port1 },
  transferList: [port1],
});

const thread2 = new Worker("./calc.js", {
  workerData: { port: port2 },
  transferList: [port2],
});
*/

/* Example 4 - Communication between a parent thread and 2 worker threads 
const channel1 = new MessageChannel();
const channel2 = new MessageChannel();

const thread1 = new Worker("./calc.js", {
  workerData: { port: channel1.port2 },
  transferList: [channel1.port2],
});

const thread2 = new Worker("./calc.js", {
  workerData: { port: channel2.port2 },
  transferList: [channel2.port2],
});

channel1.port1.on("message", (msg) => {
  console.log("Main thread got this on channel 1: ", msg);
});

channel2.port1.on("message", (msg) => {
  console.log("Main thread got this on channel 2: ", msg);
});

channel1.port1.postMessage("Some text from main thread");
channel2.port1.postMessage("Some text from main thread");
*/

/* Example 5 - Communication between a parent thread and its worker threads - the easy way!  */
const thread1 = new Worker("./calc.js");

thread1.on("message", (msg) => {
  console.log("Main thread got this: ", msg);
});

thread1.postMessage({ name: "Joe" });
