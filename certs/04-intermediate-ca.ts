import { execSync } from "node:child_process";
import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";

// ─── STEP 4: Create Intermediate CA, Signed by Root ──────────
//
// Why intermediates? So the root private key stays OFFLINE.
// Intermediates handle day-to-day signing.
// If compromised, only the intermediate is revoked.
// ──────────────────────────────────────────────────────────────

const CERTS_DIR = new URL("./generated", import.meta.url).pathname;

console.log("=== STEP 4: Create Intermediate CA ===\n");

// 1. Generate intermediate CA's own key pair
execSync(
  `openssl genrsa -out "${CERTS_DIR}/intermediate-ca.key" 2048`,
  { stdio: "inherit" }
);
console.log("1. Generated intermediate private key\n");

// 2. Create a Certificate Signing Request (CSR)
//    "Hey Root CA, here's my public key and identity. Please sign me."
execSync(
  `openssl req -new \
    -key "${CERTS_DIR}/intermediate-ca.key" \
    -subj "/C=TR/O=My Root CA/CN=My Intermediate CA" \
    -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -out "${CERTS_DIR}/intermediate-ca.csr"`,
  { stdio: "inherit", shell: true }
);
console.log("2. Created CSR (Certificate Signing Request)\n");

// 3. Root CA SIGNS the intermediate's CSR with its private key
//    This is the "vouching" — Root says "I trust this intermediate"
execSync(
  `openssl x509 -req \
    -in "${CERTS_DIR}/intermediate-ca.csr" \
    -CA "${CERTS_DIR}/root-ca.crt" \
    -CAkey "${CERTS_DIR}/root-ca.key" \
    -CAcreateserial \
    -days 1825 \
    -sha256 \
    -copy_extensions copy \
    -out "${CERTS_DIR}/intermediate-ca.crt"`,
  { stdio: "inherit", shell: true }
);
console.log("3. Root CA signed the intermediate's certificate\n");

// 4. Inspect the intermediate cert
const intermediatePem = readFileSync(
  `${CERTS_DIR}/intermediate-ca.crt`,
  "utf8"
);
const intermediate = new X509Certificate(intermediatePem);

console.log("Intermediate Certificate Contents:");
console.log("  Subject:", intermediate.subject);
console.log("  Issuer:", intermediate.issuer);
console.log(
  "  Signed by Root?",
  intermediate.issuer.includes("My Root CA") ? "YES ✓" : "NO ✗"
);
console.log(
  "  Subject === Issuer?",
  intermediate.subject === intermediate.issuer ? "YES (would be self-signed)" : "NO (correct)"
);
console.log("  CA (can sign others)?", intermediate.ca ? "YES ✓" : "NO");
console.log("  Path length constraint: 0 = can only sign end-user certs, not other CAs");

console.log(
  "\nChain so far:  Root CA → Intermediate CA"
);
