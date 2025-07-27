import fs from "node:fs";
import path from "node:path";
import "./file.ts";

const data = fs.readFileSync(new URL("./text.txt", import.meta.url), "utf-8");
console.log(data);
