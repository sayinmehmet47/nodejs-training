import * as net from "net";
import * as readline from "readline";

interface ClientOptions {
  host: string;
  port: number;
}

class ChatClient {
  private socket: net.Socket;
  private rl: readline.Interface;
  private username: string;
  private options: ClientOptions;
  private inputBuffer: string = "";

  constructor(options: ClientOptions) {
    this.socket = new net.Socket();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: ">",
    });
    this.username = "";
    this.options = options;
  }

  async connect(): Promise<void> {
    const username = await this.askForUsername();
    this.username = username;

    this.socket.connect(this.options.port, this.options.host, () => {
      console.log(
        `Connected to server at ${this.options.host}:${this.options.port}`
      );
      console.log(
        `Type your messages. Use @all to broadcast or @username to send a private message.`
      );
    });

    this.setupEventListeners();
  }

  private async askForUsername(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question("Enter your username: ", (username) => {
        resolve(username);
      });
    });
  }

  private setupEventListeners(): void {
    this.socket.on("data", (data) => {
      const message = data.toString();
      // Only clear the line if we're not in the middle of typing
      if (this.inputBuffer === "") {
        process.stdout.write("\n");
      }
      process.stdout.write(message);
      // Move to a new line after receiving a message
      if (!message.endsWith("\n")) {
        process.stdout.write("\n");
      }
    });

    this.socket.on("close", () => {
      console.log("Connection closed");
      this.rl.close();
    });

    this.rl.on("line", (input) => {
      this.socket.write(`${this.username}: ${input}\n`);

      this.inputBuffer = "";
    });

    // Handle input character by character
    process.stdin.on("data", (chunk) => {
      if (chunk.toString().includes("\n")) {
        // If the chunk contains a newline, process it as a complete line
        const parts = chunk.toString().split("\n");
        this.inputBuffer += parts[0];
        this.rl.write(this.inputBuffer);
        this.socket.write(`${this.username}: ${this.inputBuffer}\n`);
        this.inputBuffer = "";
      } else {
        // Otherwise, add it to the buffer
        this.inputBuffer += chunk.toString();
        this.rl.write(chunk);
      }
    });
  }
}

const main = async () => {
  const client = new ChatClient({
    host: "localhost",
    port: 3000,
  });

  await client.connect();
};

main().catch(console.error);
