import { open, watch } from "fs/promises";
import { processCommands } from "./commandProcessor";
import path from "path";
import { fileURLToPath } from "url";

// Derive the directory name from the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the path relative to the current file's directory
const COMMAND_FILE_PATH = path.resolve(__dirname, "../command.txt");

(async () => {
  let fileHandle;
  try {
    // Open the command file for reading
    fileHandle = await open(COMMAND_FILE_PATH, "r");
    console.log(`Opened command file: ${COMMAND_FILE_PATH}`);

    // Initial processing in case the file already has commands
    await processCommands(fileHandle);

    // Set up the watcher
    const watcher = watch(COMMAND_FILE_PATH);
    console.log(`Watching ${COMMAND_FILE_PATH} for changes...`);

    for await (const event of watcher) {
      if (event.eventType === "change") {
        console.log(`Detected change in ${COMMAND_FILE_PATH}.`);
        // Re-process the commands when the file changes
        await processCommands(fileHandle);
      }
    }
  } catch (error: any) {
    // Added type annotation for error
    // Provide more specific error handling if possible
    if (error.code === "ENOENT") {
      console.error(`Error: Command file not found at ${COMMAND_FILE_PATH}`);
    } else {
      console.error(
        `Error setting up file watcher or processing commands:`,
        error
      );
    }
    // Optionally, exit the process if the command file can't be accessed
    // process.exit(1);
  } finally {
    // Ensure the file handle is closed if it was opened
    if (fileHandle) {
      await fileHandle.close();
      console.log("Closed command file handle.");
    }
  }
})();
