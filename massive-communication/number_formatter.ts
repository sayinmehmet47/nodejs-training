import { writeFile } from "node:fs/promises";
import { stdin } from "node:process";

const targetPath = process.argv[2];
const prefix = process.argv[3];
const suffix = process.argv[4];

stdin.on("data", (chunk) => {
  const formatted = numberFormatter(chunk.toString(), prefix, suffix);
  writeFile(targetPath, formatted);
});

function numberFormatter(input: string, prefix: string, suffix: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .map((number) => {
      return `${prefix}${number}`;
    })
    .join(suffix + " ");
}
