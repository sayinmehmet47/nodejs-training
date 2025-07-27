import { wordCountFilter } from "./filter-examples";

async function main() {
  try {
    await wordCountFilter();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
