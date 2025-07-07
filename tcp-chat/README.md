# TCP Chat Application

A simple TCP-based chat application built with Node.js and TypeScript.

## Installation

1. Install Node.js and npm if you haven't already
2. Install TypeScript globally:

```bash
npm install -g typescript
```

## Running the Application

1. Compile the TypeScript files:

```bash
npx tsc
```

2. Start the server in one terminal:

```bash
node dist/server.js
```

3. Start the client in another terminal:

```bash
node dist/client.js
```

## Usage

1. When prompted, enter your username
2. Use `@all` to broadcast a message to all users
3. Use `@username` to send a private message to a specific user
4. Type your message and press Enter to send

## Files

- `server.ts`: The TCP server implementation
- `client.ts`: The TCP client implementation
- `tsconfig.json`: TypeScript configuration file
