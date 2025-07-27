import { text } from "node:stream/consumers";

async function main() {
  try {
    const input = await text(process.stdin);

    const processed = processInput(input);

    process.stdout.write(processed);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

function processInput(input: string): string {
  return input.toUpperCase();
}

main();
