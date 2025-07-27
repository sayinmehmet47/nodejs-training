import { text } from "node:stream/consumers";
import { uppercaseFilter } from "./filter-examples";

async function main() {
  try {
    await uppercaseFilter();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
