import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";

const numberFormatter = spawn("./number_formatter", ["./dest.txt", "$", ","]);

numberFormatter.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

numberFormatter.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

numberFormatter.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

const fileStream = createReadStream("./src.txt");
fileStream.pipe(numberFormatter.stdin);
