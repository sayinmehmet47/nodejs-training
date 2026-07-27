import { fork } from "node:child_process";

type ChildMessage = string;

let counter: number = 0;

console.log(`Parent process ID: ${process.pid}`);

const child = fork(new URL("./02-child-process.ts", import.meta.url));

console.log(`Child process ID: ${child.pid}`);

child.once("message", (message: ChildMessage) => {
  console.log(`Child says: ${message}`);
  console.log(`Parent counter is still ${counter}.`);
  console.log("Both processes will stay open for 30 seconds. Inspect them now.");
});

child.once("exit", (exitCode) => {
  if (exitCode === 0) {
    console.log("Child process finished.");
  } else {
    console.error(`Child process failed with exit code ${exitCode}.`);
  }
});

child.send({ amountToAdd: 5 });
