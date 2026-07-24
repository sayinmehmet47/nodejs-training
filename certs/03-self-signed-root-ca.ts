import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";

// ─── STEP 3: Create a Self-Signed Root CA ────────────────────
//
// A Root CA is just a certificate that signs ITSELF.
// Nobody above it — it IS the trust anchor.
//
// We use OpenSSL here because Node.js doesn't have
// built-in X.509 certificate generation.
// ──────────────────────────────────────────────────────────────

const CERTS_DIR = new URL("./generated", import.meta.url).pathname;

if (!existsSync(CERTS_DIR)) mkdirSync(CERTS_DIR);

console.log("=== STEP 3: Create a Self-Signed Root CA ===\n");

// 1. Generate the Root CA's private key (the "nuclear launch code")
execSync(
  `openssl genrsa -out "${CERTS_DIR}/root-ca.key" 2048`,
  { stdio: "inherit" }
);

console.log('\n1. Generated Root CA private key → generated/root-ca.key');
console.log('   This key should be OFFLINE, air-gapped, in an HSM.\n');

// 2. Create a self-signed root certificate
//    Subject = Issuer (it signs itself)
//    CA:TRUE means it can sign other certificates
execSync(
  `openssl req -x509 -new -nodes -key "${CERTS_DIR}/root-ca.key" \
    -sha256 -days 3650 \
    -subj "/C=TR/O=My Root CA/CN=My Root CA" \
    -addext "basicConstraints=critical,CA:TRUE,pathlen:1" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -out "${CERTS_DIR}/root-ca.crt"`,
  { stdio: "inherit", shell: true }
);

console.log('\n2. Created self-signed root certificate → generated/root-ca.crt\n');

// 3. Read and inspect what's inside the certificate
const rootCertPem = readFileSync(`${CERTS_DIR}/root-ca.crt`, "utf8");
const rootCert = new X509Certificate(rootCertPem);

console.log("Root Certificate Contents:");
console.log("  Subject:", rootCert.subject);
console.log("  Issuer:", rootCert.issuer);
console.log(
  "  Subject === Issuer?",
  rootCert.subject === rootCert.issuer ? "YES (self-signed) ✓" : "NO ✗"
);
console.log("  Valid from:", rootCert.validFrom);
console.log("  Valid to:", rootCert.validTo);
console.log("  CA (can sign others)?", rootCert.ca ? "YES ✓" : "NO");
console.log("  Public key:", rootCert.publicKey.asymmetricKeyType?.toUpperCase());
console.log(
  "  Fingerprint:",
  rootCert.fingerprint256?.slice(0, 16) + "..."
);

console.log(
  "\nThis root CA is now a trust anchor. If you install this in your"
);
console.log(
  "OS/browser trust store, all certificates signed by it will be trusted."
);
