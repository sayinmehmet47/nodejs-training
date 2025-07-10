import net from "net";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "path";
const server = net.createServer();
const storageDirectory = "storage";
server.on("connection", async (socket) => {
    console.log("✅ A client connected.");
    await fs.mkdir(storageDirectory, { recursive: true });
    const state = {
        fileStream: null,
        fileName: "",
        expectedSize: 0,
        receivedSize: 0,
        isReceivingFile: false,
    };
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        while (buffer.length > 0) {
            if (!state.isReceivingFile) {
                const newlineIndex = buffer.indexOf("\n");
                if (newlineIndex === -1)
                    break;
                const messageBuffer = buffer.subarray(0, newlineIndex);
                buffer = buffer.subarray(newlineIndex + 1);
                const message = messageBuffer.toString("utf8");
                if (message.startsWith("FILE:")) {
                    // Format: FILE:filename:filesize
                    const parts = message.split(":");
                    if (parts.length !== 3) {
                        console.error("Invalid FILE message format");
                        socket.write("ERROR:Invalid file header\n");
                        socket.destroy();
                        return;
                    }
                    state.fileName = path.basename(parts[1]);
                    state.expectedSize = parseInt(parts[2], 10);
                    if (isNaN(state.expectedSize) || state.expectedSize <= 0) {
                        console.error("Invalid file size");
                        socket.write("ERROR:Invalid file size\n");
                        socket.destroy();
                        return;
                    }
                    const filePath = path.join(storageDirectory, state.fileName);
                    console.log(`📥 Receiving file: ${state.fileName} (${state.expectedSize} bytes)`);
                    state.fileStream = createWriteStream(filePath);
                    state.isReceivingFile = true;
                    state.receivedSize = 0;
                    // Send acknowledgment
                    socket.write("READY\n");
                    // Handle file stream events
                    state.fileStream.on("error", (err) => {
                        console.error("File write error:", err);
                        socket.write("ERROR:File write error\n");
                        socket.destroy();
                    });
                }
                else {
                    console.error("Unknown message:", message);
                    socket.write("ERROR:Unknown message\n");
                }
            }
            else {
                // We're receiving file data
                const remainingBytes = state.expectedSize - state.receivedSize;
                const bytesToWrite = Math.min(buffer.length, remainingBytes);
                if (bytesToWrite > 0) {
                    const dataToWrite = buffer.subarray(0, bytesToWrite);
                    buffer = buffer.subarray(bytesToWrite);
                    if (state.fileStream) {
                        const writeSuccess = state.fileStream.write(dataToWrite);
                        if (!writeSuccess) {
                            socket.pause();
                            state.fileStream.once("drain", () => {
                                socket.resume();
                            });
                        }
                    }
                    state.receivedSize += bytesToWrite;
                    // Send progress update
                    const progress = Math.round((state.receivedSize / state.expectedSize) * 100);
                    socket.write(`PROGRESS:${progress}\n`);
                }
                // Check if file is complete
                if (state.receivedSize >= state.expectedSize) {
                    console.log(`🎉 Finished receiving file: ${state.fileName}`);
                    if (state.fileStream) {
                        state.fileStream.end();
                        state.fileStream = null;
                    }
                    socket.write("COMPLETE\n");
                    state.isReceivingFile = false;
                    // Reset state for potential next file
                    state.fileName = "";
                    state.expectedSize = 0;
                    state.receivedSize = 0;
                }
                break; // Process remaining buffer in next iteration
            }
        }
    });
    socket.on("end", () => {
        console.log("📤 Client disconnected");
        if (state.fileStream) {
            state.fileStream.end();
        }
    });
    socket.on("error", (err) => {
        console.error("❌ Socket error:", err.message);
        if (state.fileStream) {
            state.fileStream.end();
        }
        socket.destroy();
    });
});
server.listen(5050, "0.0.0.0", () => {
    console.log("🚀 Server listening on", server.address());
});
process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down server...");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
});
