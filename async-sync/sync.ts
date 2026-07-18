import { readFileSync } from "node:fs";

console.log("1");
const res = readFileSync("./test.txt");
console.log("res", res.toString());
console.log("2");
