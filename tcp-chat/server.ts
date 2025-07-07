import * as net from "net";

interface ClientInfo {
  socket: net.Socket;
  address: string;
}

let clients: ClientInfo[] = [];

const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`New connection from ${clientAddress}`);

  // Add client to the list
  clients.push({ socket, address: clientAddress });

  // Handle incoming messages
  socket.on("data", (data) => {
    const message = data.toString().trim();
    const [recipient, ...rest] = message.split(" ");

    if (recipient === "@all") {
      // Broadcast to all clients
      broadcast(clientAddress, message);
    } else if (recipient.startsWith("@")) {
      // Private message
      const targetClient = clients.find((client) =>
        client.address.includes(recipient.substring(1))
      );

      if (targetClient) {
        targetClient.socket.write(`${clientAddress}: ${rest.join(" ")}`);
      } else {
        socket.write("Error: Client not found\n");
      }
    } else {
      // Default to broadcasting
      broadcast(clientAddress, `@all ${message}`);
    }
  });

  // Handle client disconnection
  socket.on("end", () => {
    console.log(`${clientAddress} disconnected`);
    clients = clients.filter((client) => client.socket !== socket);
  });

  // Send welcome message
  socket.write(
    "Welcome to the TCP chat! Use @all to broadcast or @username to send a private message.\n"
  );
});

function broadcast(sender: string, message: string) {
  clients.forEach((client) => {
    if (client.address !== sender) {
      client.socket.write(`${sender}: ${message}\n`);
    }
  });
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
