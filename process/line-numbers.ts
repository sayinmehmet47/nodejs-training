import { lineNumberFilter } from "./filter-examples";

async function main() {
  try {
    await lineNumberFilter();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
