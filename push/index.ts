import { type WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (data: Buffer) => {
    for (const client of wss.clients) {
      client.send(
        JSON.stringify({ type: "broadcast", content: data.toString() }),
      );
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

console.log("WebSocket server running on ws://localhost:8080");
