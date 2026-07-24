import { execSync } from "node:child_process";
import { X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";

// ─── STEP 5: Create a Server Certificate ────────────────────
//
// This is what your website uses.
// Signed by the INTERMEDIATE CA (not directly by root).
// Chains up: your cert → intermediate → root
// ──────────────────────────────────────────────────────────────

const CERTS_DIR = new URL("./generated", import.meta.url).pathname;

console.log("=== STEP 5: Create a Server Certificate ===\n");

// 1. Generate the server's key pair
execSync(
  `openssl genrsa -out "${CERTS_DIR}/server.key" 2048`,
  { stdio: "inherit" }
);
console.log("1. Generated server private key\n");

// 2. Create a CSR for the server
//    Subject Alternative Name (SAN) = the domain names this cert is valid for
execSync(
  `openssl req -new \
    -key "${CERTS_DIR}/server.key" \
    -subj "/C=TR/O=MyCompany/CN=example.com" \
    -addext "basicConstraints=critical,CA:FALSE" \
    -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
    -addext "extendedKeyUsage=serverAuth,clientAuth" \
    -addext "subjectAltName=DNS:example.com,DNS:*.example.com" \
    -out "${CERTS_DIR}/server.csr"`,
  { stdio: "inherit", shell: true }
);
console.log("2. Created server CSR\n");

// 3. Intermediate CA signs the server's CSR
execSync(
  `openssl x509 -req \
    -in "${CERTS_DIR}/server.csr" \
    -CA "${CERTS_DIR}/intermediate-ca.crt" \
    -CAkey "${CERTS_DIR}/intermediate-ca.key" \
    -CAcreateserial \
    -days 365 \
    -sha256 \
    -copy_extensions copy \
    -out "${CERTS_DIR}/server.crt"`,
  { stdio: "inherit", shell: true }
);
console.log("3. Intermediate CA signed the server certificate\n");

// 4. Inspect
const serverPem = readFileSync(`${CERTS_DIR}/server.crt`, "utf8");
const server = new X509Certificate(serverPem);

console.log("Server Certificate Contents:");
console.log("  Subject:", server.subject);
console.log("  Issuer:", server.issuer);
console.log(
  "  Signed by Intermediate?",
  server.issuer.includes("Intermediate") ? "YES ✓" : "NO ✗"
);
console.log("  CA (can sign others)?", server.ca ? "YES" : "NO ✓ (correct)");
console.log("  Valid from:", server.validFrom);
console.log("  Valid to:", server.validTo);
console.log(
  "  Subject Alt Names:",
  server.subjectAltName
);

console.log(
  "\nFull chain:  Root CA → Intermediate CA → example.com"
);
console.log(
  "When you visit example.com, your browser verifies all 3 steps."
);
