import { text } from "node:stream/consumers";

// Example 1: Uppercase filter
export async function uppercaseFilter() {
  const input = await text(process.stdin);
  process.stdout.write(input.toUpperCase());
}

// Example 2: Line number filter
export async function lineNumberFilter() {
  const input = await text(process.stdin);
  const lines = input.split("\n");
  const numbered = lines
    .map((line, index) => `${index + 1}: ${line}`)
    .join("\n");
  process.stdout.write(numbered);
}

// Example 3: Word count filter
export async function wordCountFilter() {
  const input = await text(process.stdin);
  const words = input.trim().split(/\s+/).length;
  process.stdout.write(`Word count: ${words}\n`);
}

// Example 4: Reverse lines filter
export async function reverseLinesFilter() {
  const input = await text(process.stdin);
  const lines = input.split("\n");
  const reversed = lines.reverse().join("\n");
  process.stdout.write(reversed);
}

// Example 5: Remove empty lines filter
export async function removeEmptyLinesFilter() {
  const input = await text(process.stdin);
  const lines = input.split("\n");
  const nonEmpty = lines.filter((line) => line.trim() !== "").join("\n");
  process.stdout.write(nonEmpty);
}
