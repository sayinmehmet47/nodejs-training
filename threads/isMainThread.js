const { Worker, isMainThread, threadId } = require("worker_threads");

let a = 200;

const func = () => {
  // ...
};

if (isMainThread) {
  a = 500;
  const worker = new Worker(__filename);
  console.log("This is the main thread with id: ", threadId);
  console.log(a);
} else {
  console.log("This is a worker thread with id: ", threadId);
  console.log(a);
}
