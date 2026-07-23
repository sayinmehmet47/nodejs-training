# Networking Fundamentals

## The Stack (bottom to top)

```
┌──────────────────────────────────────────────────────┐
│  7. Application   │  HTTP, DNS, WebSocket, gRPC      │
│───────────────────│──────────────────────────────────│
│  6. Presentation  │  TLS/SSL (encryption)             │  ← Sits between TCP and HTTP
│───────────────────│──────────────────────────────────│
│  5. Session       │  (usually merged with TLS today)  │
│───────────────────│──────────────────────────────────│
│  4. Transport      │  TCP (reliable) / UDP (fast)    │
│───────────────────│──────────────────────────────────│
│  3. Network        │  IP (routing, addressing)        │
│───────────────────│──────────────────────────────────│
│  2. Data Link      │  Ethernet, Wi-Fi                 │
│───────────────────│──────────────────────────────────│
│  1. Physical       │  Cables, radio waves             │
└──────────────────────────────────────────────────────┘
```

---

## 1. IP (Internet Protocol) — Layer 3

**What it does:** Routes packets from one machine to another using IP addresses.

**20-byte header** on every packet. Contains source IP, destination IP, TTL (max hops), checksum.

**Key concept:** IP is **connectionless and unreliable**. It just delivers packets. No guarantee they arrive or arrive in order.

---

## 2. TCP (Transmission Control Protocol) — Layer 4

**What it does:** Adds **reliability** on top of IP — ordering, retransmission, flow control.

### System calls (C):
```
socket(AF_INET, SOCK_STREAM, 0)   → create TCP socket
bind()                             → claim a port
listen()                           → tell kernel to queue connections
accept()                           → blocks until client connects, returns NEW socket for that client
connect()                          → triggers 3-way handshake (SYN → SYN-ACK → ACK)
write() / read()                   → send/receive data (no address needed, you're connected)
close()                            → triggers 4-way FIN teardown
```

### TCP features:
- **3-way handshake:** SYN → SYN-ACK → ACK before any data
- **Ordering:** Sequence numbers ensure data arrives in order
- **ACKs:** Receiver confirms every byte received (cumulative — one ACK covers many segments)
- **Retransmission:** Lost segments are detected via timeout or duplicate ACKs, re-sent automatically
- **Flow control:** Receiver tells sender how much buffer space it has (window size)
- **4-way teardown:** FIN → ACK → FIN → ACK (each direction closes independently)
- **20-60 byte header** per segment

### Node.js: `net` module
```ts
import net from 'net';

// net.createServer wraps: socket() + bind() + listen()
const server = net.createServer((socket) => {
  // socket = dedicated fd from accept()
  socket.on('data', (data) => {});   // read()
  socket.write('response');           // write()
  socket.on('end', () => {});         // read() returned 0 = FIN
});
server.listen(9999);
```

---

## 3. UDP (User Datagram Protocol) — Layer 4

**What it does:** Fast, connectionless delivery. No reliability.

### System calls (C):
```
socket(AF_INET, SOCK_DGRAM, 0)     → create UDP socket
bind()                              → claim a port
sendto()                            → fire packet to IP:port (no connect needed)
recvfrom()                          → receive ANY packet + sender's address
close()                             → instant — no FIN
```

### UDP features:
- **No handshake** — just send
- **No ordering** — packets may arrive out of order
- **No ACKs** — no delivery confirmation
- **No retransmission** — lost is lost
- **8-byte header** (vs TCP's 20-60 bytes)
- **Stateless** — no connection, no teardown

### Node.js: `dgram` module
```ts
import dgram from 'dgram';

const server = dgram.createSocket('udp4');
server.on('message', (msg, rinfo) => {
  // rinfo = who sent it (IP + port)
  server.send(msg, rinfo.port, rinfo.address);
});
server.bind(9999);
```

### When to use UDP:
- DNS queries (fast, small, retry if needed)
- VoIP / video calls (speed > perfection)
- Online gaming (60 updates/sec, one lost frame doesn't matter)
- Service discovery (broadcast "I'm alive")
- StatsD metrics (lose one datapoint among thousands — fine)

---

## 4. TCP vs UDP Summary

| | TCP | UDP |
|---|---|---|
| Connection | Yes (SYN → SYN-ACK → ACK) | No |
| Reliable | Yes (ACKs + retransmit) | No |
| Ordered | Yes (seq numbers) | No |
| Header size | 20-60 bytes | 8 bytes |
| Close | FIN 4-way handshake | Instant |
| Node module | `net` | `dgram` |
| C type | `SOCK_STREAM` | `SOCK_DGRAM` |
| Use case | HTTP, DB queries, file transfer | DNS, VoIP, gaming, metrics |

---

## 5. TLS (Transport Layer Security) — Layer 6

**What it does:** Adds **encryption, authentication, and integrity** on top of a TCP connection. It does NOT replace TCP — it sits between TCP and your application protocol.

### Where TLS fits:
```
Before TLS:           With TLS:
┌───────────┐         ┌───────────┐
│   HTTP    │         │   HTTP    │  ← same application protocol
├───────────┤         ├───────────┤
│           │         │   TLS     │  ← encryption layer added
│   TCP     │         ├───────────┤
│           │         │   TCP     │  ← same reliable transport
├───────────┤         ├───────────┤
│   IP      │         │   IP      │
└───────────┘         └───────────┘
```

HTTPS = HTTP + TLS. The "S" is TLS, not a separate protocol.

### The TLS Handshake (TLS 1.2 — RSA):

```
Client                                    Server
  │                                          │
  │─── ClientHello ─────────────────────────→│  "I support TLS 1.2, these cipher suites"
  │←── ServerHello + Certificate ───────────│  "Use this cipher, here's my cert"
  │                                          │
  │ Client verifies cert with CA             │
  │                                          │
  │─── PreMaster Secret (encrypted) ────────→│  Encrypted with server's public key
  │                                          │
  │ Both sides compute session keys          │  (from client random + server random + premaster)
  │                                          │
  │─── Finished (encrypted) ────────────────→│  "I'm ready, this is encrypted"
  │←── Finished (encrypted) ────────────────│  "Me too"
  │                                          │
  │   === Secure channel established ===     │
  │   All subsequent data is symmetrically   │
  │   encrypted with session keys            │
```

### TLS 1.3 (faster, 2018):
- Removed insecure algorithms (RSA key exchange, CBC ciphers)
- **1 round trip** instead of 2 to establish connection
- **0-RTT** mode: if you connected to this server before, first message can already be encrypted (session resumption)
- No premaster secret step — key exchange happens earlier

### What TLS provides:
- **Encryption:** Nobody can read your data in transit
- **Authentication:** The server proves it is who it claims to be (via certificate signed by a CA)
- **Integrity:** Data cannot be tampered with without detection (MAC)
- **Forward secrecy (TLS 1.3):** Even if server's private key is stolen later, past sessions remain encrypted

### TLS Certificates Deep Dive

#### Public key vs Private key (Asymmetric Cryptography)

Every TLS certificate involves a **key pair**:

```
┌─────────────────────┐       ┌──────────────────────┐
│     Public Key      │       │     Private Key       │
│  (shared openly)    │       │  (kept secret, safe)  │
├─────────────────────┤       ├──────────────────────┤
│ • Inside the cert   │       │ • Lives on the server │
│ • Anyone can see it │       │ • NEVER shared        │
│ • Encrypts data     │       │ • Decrypts data       │
│ • Verifies signature│       │ • Creates signature   │
└─────────────────────┘       └──────────────────────┘

Data encrypted with public key  →  can ONLY be decrypted with private key
Data signed with private key     →  can be VERIFIED with public key
```

#### What's inside a TLS certificate?

A certificate is a data file (usually `.pem` or `.crt`) containing:

| Field | Description |
|-------|-------------|
| **Subject** | Domain name (CN = example.com) + organization |
| **Issuer** | Which CA issued this certificate |
| **Public Key** | The server's public key (long string of characters) |
| **Validity period** | Issue date + expiration date |
| **Serial number** | Unique ID for this certificate |
| **CA's digital signature** | Hash of the certificate, encrypted with CA's private key |
| **Key usage** | What this cert can be used for (server auth, client auth, code signing) |
| **SANs** (Subject Alternative Names) | Additional domains covered (e.g., www.example.com, *.example.com) |

#### The chain of trust:

```
Root CA (pre-installed in OS/browser, trusted by default)
  │  Private key stored OFFLINE, in HSMs (hardware security modules)
  │
  └── Intermediate CA
       │  Signed by the Root CA's private key
       │
       └── Your server's certificate (for yourdomain.com)
            Signed by the Intermediate CA's private key
```

Browser trusts root CAs by default (Firefox, Chrome, macOS all have a built-in list). When it receives your cert, it:
1. Checks the issuer → finds the intermediate cert
2. Verifies intermediate cert was signed by a trusted root
3. Verifies your cert was signed by the intermediate
4. Checks expiration date, domain match, revocation status

If any step fails → browser shows "Not Secure" or blocks the connection.

#### Server cert vs Client cert

**Server certificate** (what every HTTPS website uses):
- The **server** presents it to prove its identity
- Used by the client to verify: "I'm really talking to google.com, not an impostor"
- Contains the server's public key
- Everyone uses this — mandatory for HTTPS

**Client certificate** (optional, advanced):
- The **client** presents it to prove its identity to the server
- Server verifies it: "This user is who they claim to be"
- Used for **Mutual TLS (mTLS)** — both sides authenticate each other
- Common in: corporate VPNs, banking APIs, service-to-service communication, IoT devices

```
Normal TLS (server cert only):    Mutual TLS (both sides):

Client                Server      Client                Server
  │── connect ────────→│            │── ClientHello ─────→│
  │←── server cert ───│            │←── server cert ────│
  │ verify server      │            │ verify server       │
  │  ✓                 │            │  ✓                  │
  │ secure channel     │            │←── request client ─│  "Prove who you are"
  │                    │            │── client cert ─────→│  My certificate
  │                    │            │                     │ verify client
  │                    │            │                     │  ✓
  │                    │            │ secure channel      │
```

#### How to generate certificates (OpenSSL)

**1. Generate a private key:**
```bash
# 2048-bit RSA private key (encrypted with passphrase)
openssl genrsa -aes256 -out server.key 2048

# Without passphrase (for automated services)
openssl genrsa -out server.key 2048
```

**2. Create a Certificate Signing Request (CSR):**
```bash
openssl req -new -key server.key -out server.csr

# It will ask:
#   Country (C): CH
#   State (ST): Bern
#   Organization (O): My Company
#   Common Name (CN): mydomain.com    ← THIS MUST MATCH YOUR DOMAIN
```

**3a. Get it signed by a CA (production):**
Send `server.csr` to a Certificate Authority (Let's Encrypt, DigiCert, Sectigo). They verify you own the domain, sign it, and return a signed certificate.

**3b. Self-sign (development/testing only):**
```bash
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```
Browsers will show a warning because no trusted CA signed it.

**Both files needed to run a TLS server:**
```ts
import tls from 'tls';
import fs from 'fs';

const server = tls.createServer({
  key:  fs.readFileSync('server.key'),   // private key (SECRET!)
  cert: fs.readFileSync('server.crt'),   // certificate (public)
}, (socket) => {
  // encrypted communication
});
server.listen(8443);
```

**4. Self-signed cert with a single command:**
```bash
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=localhost"
```
- `-x509` = self-signed (output a cert directly, no CSR)
- `-nodes` = no DES encryption (no passphrase on the key)
- `-subj` = skip the interactive prompts
- `-days 365` = valid for 1 year

**5. Create your own CA (for internal/private use):**
```bash
# Step 1: Create root CA key + cert
openssl req -x509 -newkey rsa:4096 -keyout ca.key -out ca.crt -days 3650 -nodes -subj "/CN=My Internal CA"

# Step 2: Create server key + CSR
openssl req -newkey rsa:2048 -keyout server.key -out server.csr -nodes -subj "/CN=internal-api.local"

# Step 3: Sign the server CSR with your CA
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365

# Step 4: Distribute ca.crt to all clients (add to trust store)
```

#### Certificate types by validation level:

| Type | Validation | Example | Padlock |
|------|-----------|---------|---------|
| **DV** (Domain Validated) | Only check domain ownership | `example.com` | 🔒 |
| **OV** (Organization Validated) | Verify domain + organization identity | Company website | 🔒 |
| **EV** (Extended Validation) | Full legal entity verification | Bank, government | 🔒 + company name in bar |

Let's Encrypt provides free DV certificates. Most websites use DV — it's sufficient.

#### How the browser verifies a certificate:

```
Browser receives server's cert:

1. Is it expired?
   → Check notBefore < now < notAfter

2. Is the domain correct?
   → Certificate CN or SANs must match the URL domain

3. Is the issuer trusted?
   → Follow chain up to a Root CA in the browser's trust store

4. Is the signature valid?
   → Decrypt CA's signature with CA's public key → compare hash
   → If hash matches: the CA really signed this cert

5. Has it been revoked?
   → Check OCSP (Online Certificate Status Protocol) or CRL
   → If revoked: reject

All 5 pass → 🔒 green padlock
```

---

## 6. How they stack together in a real HTTPS request

```
Browser requests https://google.com

1. DNS lookup (UDP)
   └── Browser → DNS resolver: "What's google.com's IP?"
   └── Resolver → Browser: "142.250.80.46"

2. TCP handshake
   └── Client → Server: SYN
   └── Server → Client: SYN-ACK
   └── Client → Server: ACK
   └── TCP connection established

3. TLS handshake (over TCP)
   └── ClientHello → ServerHello → key exchange → Finished
   └── TLS session established (encrypted channel)

4. HTTP request (over TLS, over TCP)
   └── Client → Server: GET / HTTP/1.1 (encrypted)
   └── Server → Client: 200 OK + HTML body (encrypted)

5. Teardown
   └── TLS close_notify
   └── TCP FIN 4-way handshake
```

Every HTTPS request goes through ALL of these layers. DNS over UDP, TCP for transport, TLS for encryption, HTTP for the actual data.

---

## 7. Node.js Modules Map

| Module | Layer | Wraps | Used for |
|--------|-------|-------|----------|
| `dgram` | Transport (UDP) | `SOCK_DGRAM` | DNS queries, custom UDP services |
| `net` | Transport (TCP) | `SOCK_STREAM` | All TCP servers/clients, foundation for HTTP |
| `tls` | Presentation | TLS over `net.Socket` | Encrypted TCP connections |
| `http` | Application | HTTP parser + `net` | Web servers, REST APIs |
| `https` | Application + Presentation | `http` + `tls` + `net` | Secure web servers |

### The inheritance chain:
```
net.createServer((socket: net.Socket) => { ... })
  ↑
tls.createServer(options, (socket: tls.TLSSocket) => { ... })
  ↑                                         TLSSocket wraps net.Socket
http.createServer((req, res) => { ... })
  ↑
https.createServer(options, (req, res) => { ... })
```

`tls.TLSSocket` wraps a `net.Socket` — it takes a raw TCP connection and adds encryption. When you use `https.createServer()`, it internally:
1. Calls `net.createServer()` (TCP layer)
2. Wraps each socket with `new tls.TLSSocket()` (TLS layer)
3. Passes the decrypted data to the HTTP parser

---

## 8. Key Takeaways

1. **TCP = phone call.** You dial, both sides talk, both hang up. Everything arrives in order.
2. **UDP = postcards.** You throw them, some get lost. Each one has the address on it. Fast but unreliable.
3. **TLS = locked briefcase.** Inside the TCP phone call, you put your conversation in a locked box. Only you and the recipient have the key.
4. **HTTP = the actual conversation topic.** What you're saying inside the locked briefcase inside the phone call.

Every byte on the internet flows through some combination of these layers. Understanding the stack -- bottom to top -- is the foundation of everything else: debugging, performance, security, and architecture decisions.

---

## 9. Further Reading

- [Cloudflare: What is TLS?](https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/)
- [Cloudflare: TLS Handshake](https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/)
- [Cloudflare: What is tunneling?](https://www.cloudflare.com/learning/network-layer/what-is-tunneling/)
- [Cloudflare: TCP vs UDP](https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/)
- [Node.js net module docs](https://nodejs.org/api/net.html)
- [Node.js tls module docs](https://nodejs.org/api/tls.html)
- [Node.js dgram module docs](https://nodejs.org/api/dgram.html)
