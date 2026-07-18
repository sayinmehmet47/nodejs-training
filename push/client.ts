import { WebSocket } from "ws";

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
  socket.send(JSON.stringify({ type: "message", content: "Hello!" }));
});

socket.on("message", (data: Buffer) => {
  console.log("Received:", data.toString());
});

socket.on("error", (err) => console.error("Error:", err.message));
socket.on("close", () => console.log("Disconnected"));
