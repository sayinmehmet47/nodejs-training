import net from "node:net";
import fs from "node:fs";
import path from "path";
import cliProgress from "cli-progress";

const filePath = process.argv[2];

if (!filePath) {
  console.error(
    "❌ Please provide a file path. Example: node client.ts /path/to/file.png"
  );
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const client = net.createConnection({ port: 5050, host: "::1" }, () => {
  console.log("🔌 Connected to server!");

  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;

  // Send file header
  client.write(`FILE:${fileName}:${fileSize}\n`);

  console.log(`📤 Preparing to send: ${fileName} (${fileSize} bytes)`);
});

let progressBar: cliProgress.SingleBar | null = null;
let fileStream: fs.ReadStream | null = null;
let serverReady = false;

client.on("data", (chunk) => {
  const message = chunk.toString().trim();
  if (message === "READY") {
    serverReady = true;
    startFileTransfer();
  } else if (message.startsWith("PROGRESS:")) {
    const progress = parseInt(message.substring("PROGRESS:".length), 10);
    // Server sends progress updates, we could use these for validation
  } else if (message === "COMPLETE") {
    if (progressBar) {
      progressBar.stop();
    }
    console.log("✅ File upload complete!");
    client.end();
  } else if (message.startsWith("ERROR:")) {
    console.error(`❌ Server error: ${message.substring("ERROR:".length)}`);
    if (progressBar) {
      progressBar.stop();
    }
    client.destroy();
  }
});

function startFileTransfer() {
  if (!serverReady) return;

  const fileSize = fs.statSync(filePath).size;

  progressBar = new cliProgress.SingleBar({
    format: "📤 Uploading |{bar}| {percentage}% | {value}/{total} Bytes",
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
  });

  progressBar.start(fileSize, 0);

  fileStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks
  let totalBytesRead = 0;

  fileStream.on("data", (chunk) => {
    totalBytesRead += chunk.length;
    progressBar?.update(totalBytesRead);

    // Write binary data directly to socket
    const writeSuccess = client.write(chunk);

    if (!writeSuccess) {
      // Pause file stream if socket buffer is full
      fileStream?.pause();
      client.once("drain", () => {
        fileStream?.resume();
      });
    }
  });

  fileStream.on("end", () => {
    console.log("📤 File data sent, waiting for server confirmation...");
  });

  fileStream.on("error", (err) => {
    if (progressBar) {
      progressBar.stop();
    }
    console.error("❌ File read error:", err);
    client.destroy();
  });
}

client.on("close", () => {
  console.log("🔌 Client connection closed");
  if (progressBar) {
    progressBar.stop();
  }
});

client.on("error", (err) => {
  console.error("❌ Client error:", err);
  if (progressBar) {
    progressBar.stop();
  }
});

process.on("SIGINT", () => {
  console.log("\n🛑 Cancelling upload...");
  if (progressBar) {
    progressBar.stop();
  }
  client.destroy();
  process.exit(0);
});
