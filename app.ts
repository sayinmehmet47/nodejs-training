import { open, watch, writeFile } from "fs/promises";
import { EventEmitter } from "node:events";

const CREATE_FILE = "create a file";

(async () => {
  const fileContent = await open("command.txt", "r");
  const myEmitter = new EventEmitter();

  const createFile = async (filePath) => {
    console.log(`Attempting to create file: ${filePath}`);

    try {
      await writeFile(filePath, "", { flag: "wx" });
      console.log(`File created successfully: ${filePath}`);
    } catch (createError) {
      if (createError.code === "EEXIST") {
        console.log(`File already exists: ${filePath}`);
      } else {
        console.error(`Error creating file ${filePath}:`, createError);
      }
    }
  };

  myEmitter.on("change", async () => {
    console.log("File changed, reading content...");
    try {
      const size = await (await fileContent.stat()).size;
      if (size === 0) return;
      const buff = Buffer.alloc(size);
      const offset = 0;
      const length = buff.byteLength;
      const position = 0;
      const { buffer } = await fileContent.read(buff, offset, length, position);
      const content = buffer.toString("utf-8").trim();

      if (content.startsWith(CREATE_FILE)) {
        const filePath = content.substring(CREATE_FILE.length).trim();
        if (filePath) {
          createFile(filePath);
        } else {
          console.warn(
            "CREATE_FILE command detected, but no filename specified."
          );
        }
      }
    } catch (readError) {
      console.error("Error reading command file:", readError);
    }
  });

  const watcher = await watch("./command.txt");
  console.log("Watching command.txt for changes...");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      myEmitter.emit("change");
    }
  }
})();
