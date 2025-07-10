import net from "node:net";
import fs from "node:fs";
import path from "path";
import cliProgress from "cli-progress";
const filePath = process.argv[2];
if (!filePath) {
    console.error("❌ Please provide a file path. Example: node client.ts /path/to/file.png");
    process.exit(1);
}
if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
}
const client = net.createConnection({ port: 5050, host: "uploader.kigx.xyz" }, () => {
    console.log("🔌 Connected to server!");
    const fileName = path.basename(filePath);
    const fileSize = fs.statSync(filePath).size;
    // Send file header
    client.write(`FILE:${fileName}:${fileSize}\n`);
    console.log(`📤 Preparing to send: ${fileName} (${fileSize} bytes)`);
});
let progressBar = null;
let fileStream = null;
let serverReady = false;
let buffer = Buffer.alloc(0);
client.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const message = buffer.subarray(0, newlineIndex).toString().trim();
        buffer = buffer.subarray(newlineIndex + 1);
        if (message === "READY") {
            serverReady = true;
            startFileTransfer();
        }
        else if (message.startsWith("PROGRESS:")) {
            const progress = parseInt(message.substring("PROGRESS:".length), 10);
            if (progressBar) {
                const bytesTransferred = Math.floor((progress / 100) * progressBar.getTotal());
                progressBar.update(bytesTransferred);
            }
        }
        else if (message === "COMPLETE") {
            if (progressBar) {
                progressBar.update(progressBar.getTotal());
                progressBar.stop();
            }
            console.log("\n✅ File upload complete!");
            client.end();
        }
        else if (message.startsWith("ERROR:")) {
            if (progressBar) {
                progressBar.stop();
            }
            console.error("\n❌ Server error:", message.substring("ERROR:".length));
            client.destroy();
        }
    }
});
function startFileTransfer() {
    if (!serverReady)
        return;
    const fileSize = fs.statSync(filePath).size;
    progressBar = new cliProgress.SingleBar({
        format: "📤 Uploading |{bar}| {percentage}% | {value}/{total} Bytes",
        barCompleteChar: "█",
        barIncompleteChar: "░",
        hideCursor: true,
        clearOnComplete: true,
        stopOnComplete: true,
    });
    progressBar.start(fileSize, 0);
    fileStream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks
    let totalBytesRead = 0;
    fileStream.on("data", (chunk) => {
        totalBytesRead += chunk.length;
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
        console.log("\n📤 File data sent, waiting for server confirmation...");
    });
    fileStream.on("error", (err) => {
        if (progressBar) {
            progressBar.stop();
        }
        console.error("\n❌ File read error:", err);
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
    if (progressBar) {
        progressBar.stop();
    }
    client.destroy();
    process.exit(0);
});
