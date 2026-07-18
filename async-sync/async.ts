import { readFile } from "node:fs";

console.log("1");

readFile("./test.txt", (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
console.log("2");
