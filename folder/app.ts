import fs from "node:fs";
import "./file.ts";

const data = fs.readFileSync(new URL("./text.txt", import.meta.url), "utf-8");
console.log(data);
