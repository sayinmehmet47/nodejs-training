# Networking

## Files

- `simple-server.ts` — TCP server that echoes received data
- `simple-sender.ts` — TCP client that sends an 8-byte buffer
- `chatapp/` — multi-client TCP chat server

---

## TCP Packet Inspection Walkthrough

This guide shows how to visually inspect TCP handshake and data transfer on your own machine using `tcpdump`.

### Step 1: Start the server

```bash
npx ts-node simple-server.ts
# Output: TCP server listening on port 3099
```

### Step 2: Start tcpdump capture

```bash
sudo tcpdump -i lo0 -X port 3099
```

`-i lo0` captures on the loopback interface (localhost traffic). `-X` shows hex + ASCII dump.

### Step 3: Send data from the client

```bash
npx ts-node simple-sender.ts
```

### Step 4: The captured output

```
17:21:01.945986 IP localhost.51961 > localhost.3099: Flags [S], seq 2769791896, ...
    (TCP handshake: 3 packets)
    (Data transfer: 2 packets)
```

---

## The TCP 3-Way Handshake

| # | Direction | Flag | Meaning |
|---|-----------|------|---------|
| 1 | Client → Server | `[S]` SYN | "I want to connect. Here's my starting sequence number (2769791896)." |
| 2 | Server → Client | `[S.]` SYN-ACK | "Okay. Here's my sequence number (2352067724), and I acknowledge yours (ack 2769791897)." |
| 3 | Client → Server | `[.]` ACK | "Got it. Connection established." |

**After these 3 packets, the TCP connection is open and ready for data.**

---

## Data Transfer

Packet 5 is the one that carries your data — an 8-byte buffer:

```ts
// simple-sender.ts
const buffer = Buffer.alloc(8);
buffer[0] = 2;
buffer[1] = 12;
client.write(buffer);
```

In the tcpdump hex dump:

```
17:21:01.946365 IP localhost.51961 > localhost.3099: Flags [P.], seq 1:9, length 8
	0x0000:  4500 003c 0000 4000 4006 0000 7f00 0001  E..<..@.@.......
	0x0010:  7f00 0001 caf9 0c1b a517 ab99 8c31 b48d  .............1..
	0x0020:  8018 18ec fe30 0000 0101 080a e1aa 211a  .....0........!.
	0x0030:  9991 4f5c 020c 0000 0000 0000            ..O\........
```

The `[P.]` flag means **PUSH** — deliver this to the application immediately.

Your 8 bytes appear at the end of the hex dump:

```
020c 0000 0000 0000
││   └──────────────┘
││     bytes 2–7: zeros (never set)
││
│└── byte[1] = 12 → 0x0c
└─── byte[0] = 2  → 0x02
```

**Key takeaway:** your JavaScript `Buffer` becomes raw bytes on the wire — visible in the hex dump exactly as you wrote them.

---

## The Full TCP Header Decoded (Packet 5)

| Offset | Hex | Field | Meaning |
|--------|-----|-------|---------|
| 0–1 | `4500` | IP version + length | IPv4, header = 20 bytes |
| 12–15 | `7f00 0001` | Source IP | `127.0.0.1` (client) |
| 16–19 | `7f00 0001` | Dest IP | `127.0.0.1` (server) |
| 20–21 | `caf9` | Source Port | `51961` |
| 22–23 | `0c1b` | Dest Port | `3099` (`0x0c1b` = 3099) |
| 31 | `18` | TCP Flags | `0x18` = PSH + ACK |
| 34–35 | `18ec` | Window Size | `6380` |
| 60–67 | `020c 0000 0000 0000` | **Payload** | Your 8-byte buffer |

---

## Network vs Loopback

When you run this locally, `tcpdump -i lo0` captures traffic on the loopback interface. Real network traffic would be captured with `-i en0` (Ethernet) or `-i en1` (Wi-Fi). The packet structure is identical — only the interface differs.

## Useful tcpdump filters

```bash
# DNS traffic
sudo tcpdump -i en1 port 53

# HTTP requests
sudo tcpdump -i en1 -A port 80

# Watch SYN packets only (connection starts)
sudo tcpdump -i en1 'tcp[tcpflags] & tcp-syn != 0'

# All traffic to/from a specific host
sudo tcpdump -i en1 host 192.168.1.1
```
