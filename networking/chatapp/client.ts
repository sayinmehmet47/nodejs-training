import net from 'node:net';
import readline from 'node:readline';
import { stdin, stdout } from 'node:process';

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
  prompt: '> ',
});

const client = net.createConnection({ port: 8124, host: 'localhost' }, () => {
  console.log('Connected to server!');
  rl.prompt();
});

client.on('data', (data) => {
  const message = data.toString().trim();
  if (message.startsWith('Welcome! Your ID is ')) {
    const userId = message.replace('Welcome! Your ID is ', '');
    console.log(`Connected to server with ID: ${userId}`);
    rl.prompt();
  } else {
    readline.cursorTo(stdout, 0);
    readline.clearLine(stdout, 0);
    stdout.write(`${message}\n`);
    rl.prompt(true);
  }
});

client.on('end', () => {
  console.log('Disconnected from server');
  rl.close();
});

client.on('error', (err) => {
  console.error('Client error:', err);
  rl.close();
});

rl.on('line', (input) => {
  if (input.trim()) {
    client.write(`${input}\n`);
  }
  rl.prompt();
});
