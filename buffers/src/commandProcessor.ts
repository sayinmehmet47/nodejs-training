import { FileHandle } from "fs/promises";
import {
  CREATE_FILE,
  DELETE_FILE,
  RENAME_FILE,
  ADD_TO_FILE,
} from "./constants";
import {
  createFile,
  deleteFile,
  renameFile,
  addToFile,
} from "./fileOperations";

// Type for command handler functions
type CommandHandler = (args: string) => Promise<void>;

// Map command constants to their handler functions
const commandHandlers = new Map<string, CommandHandler>([
  [
    CREATE_FILE,
    async (args) => {
      const filePath = args.trim();
      if (!filePath) {
        console.warn(
          `${CREATE_FILE} command detected, but no filename specified.`
        );
        return;
      }
      await createFile(filePath);
    },
  ],
  [
    DELETE_FILE,
    async (args) => {
      const filePath = args.trim();
      if (!filePath) {
        console.warn(
          `${DELETE_FILE} command detected, but no filename specified.`
        );
        return;
      }
      await deleteFile(filePath);
    },
  ],
  [
    RENAME_FILE,
    async (args) => {
      const separator = " to ";
      const separatorIndex = args.indexOf(separator);
      if (separatorIndex === -1) {
        console.warn(
          `${RENAME_FILE} command is missing the '${separator}' separator.`
        );
        return;
      }
      const oldPath = args.substring(0, separatorIndex).trim(); // Corrected parsing
      const newPath = args.substring(separatorIndex + separator.length).trim(); // Corrected parsing

      if (!oldPath) {
        console.warn(`${RENAME_FILE} command missing original filename.`);
        return;
      }
      if (!newPath) {
        console.warn(`${RENAME_FILE} command missing new filename.`);
        return;
      }
      await renameFile(oldPath, newPath);
    },
  ],
  [
    ADD_TO_FILE,
    async (args) => {
      const separator = " content: ";
      const separatorIndex = args.indexOf(separator);
      if (separatorIndex === -1) {
        console.warn(
          `${ADD_TO_FILE} command is missing the '${separator}' separator.`
        );
        return;
      }
      const filePath = args.substring(0, separatorIndex).trim();
      const content = args.substring(separatorIndex + separator.length);

      if (!filePath) {
        console.warn(
          `${ADD_TO_FILE} command detected, but no filename specified.`
        );
        return;
      }
      if (!content) {
        console.warn(
          `${ADD_TO_FILE} command for file '${filePath}' detected, but no content specified.`
        );
        return;
      }
      await addToFile(filePath, content + "\n");
    },
  ],
]);

export const processCommands = async (
  fileHandle: FileHandle
): Promise<void> => {
  console.log("Processing commands from file...");
  try {
    const stats = await fileHandle.stat();
    const size = stats.size;
    if (size === 0) {
      console.log("Command file is empty, nothing to process.");
      return; // Nothing to process
    }

    const buff = Buffer.alloc(size);
    const offset = 0;
    const length = buff.byteLength;
    const position = 0;
    // Read the whole file content at the current state
    const { buffer } = await fileHandle.read(buff, offset, length, position);

    const lines = buffer.toString("utf-8").split("\n");

    for await (const line of lines) {
      const commandLine = line.trim();
      if (!commandLine) continue; // Skip empty lines

      let commandProcessed = false;
      for (const [commandPrefix, handler] of commandHandlers.entries()) {
        if (commandLine.startsWith(commandPrefix)) {
          const args = commandLine.substring(commandPrefix.length).trim();
          await handler(args);
          commandProcessed = true;
          break; // Exit the inner loop once a command is handled
        }
      }

      if (!commandProcessed) {
        console.warn(`Unknown command found: ${commandLine}`);
      }
    }
    console.log("Finished processing commands.");
  } catch (readError) {
    console.error("Error reading or processing command file:", readError);
    // Depending on the error, might want to close the handle or exit
  }
};
