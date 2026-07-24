import { createPublicKey, createVerify, X509Certificate } from "node:crypto";
import { readFileSync } from "node:fs";

// ─── STEP 6: Verify the Entire Chain ────────────────────────
//
// How does a browser verify this chain?
//   For each cert in the chain:
//     a. Does the issuer's public key verify the signature? ✓
//     b. Is the cert within its validity period? ✓
//     c. Is it revoked? (CRL/OCSP check — skipped here)
//     d. Does the chain end at a trusted root? ✓
// ──────────────────────────────────────────────────────────────

const CERTS_DIR = new URL("./generated", import.meta.url).pathname;

console.log("=== STEP 6: Verify the Certificate Chain ===\n");

// Load all three certs
const serverCert = new X509Certificate(
  readFileSync(`${CERTS_DIR}/server.crt`, "utf8")
);
const intermediateCert = new X509Certificate(
  readFileSync(`${CERTS_DIR}/intermediate-ca.crt`, "utf8")
);
const rootCert = new X509Certificate(
  readFileSync(`${CERTS_DIR}/root-ca.crt`, "utf8")
);

// ── Platform-independent signature verification ─────────────
//
// We'll verify each cert's signature using its issuer's public key.
// The cert's raw TBSCertificate was signed by the issuer.
// We verify that signature against the issuer's public key.
//
// We construct the signature algorithm from cert info and verify.

const sigAlgMap: Record<string, string> = {
  "1.2.840.113549.1.1.11": "SHA256", // sha256WithRSAEncryption
  "1.2.840.113549.1.1.5": "SHA1", // sha1WithRSAEncryption
};

function verifyCertSignedBy(
  childName: string,
  child: X509Certificate,
  parentName: string,
  parent: X509Certificate
): boolean {
  // Extract the signature and the data that was signed
  const signature = child.raw!;
  const tbsData = child.toString(); // fallback approach

  // A cleaner approach: use the public key directly
  // We can use crypto.verify for raw verification
  // But X509Certificate.verify with issuer's public key is the standard way

  const issuerPublicKey = parent.publicKey;

  // X509Certificate.verify(publicKey) checks:
  // 1. The cert's signature was made by this public key's private key
  // 2. The cert is within its validity period
  const isSignatureValid = child.verify(issuerPublicKey);

  console.log(
    `  ${childName} signed by ${parentName}:`,
    isSignatureValid ? "VALI ✓" : "INVALID ✗"
  );

  return isSignatureValid;
}

// ── Verify each link in the chain ──
console.log("🔐 Verifying the 3-link chain:\n");

// Link 1: Server cert was signed by Intermediate CA's private key
console.log("  [1] Server cert ← Intermediate CA");
const link1 = verifyCertSignedBy(
  "server.crt",
  serverCert,
  "intermediate-ca.crt",
  intermediateCert
);

// Link 2: Intermediate cert was signed by Root CA's private key
console.log("  [2] Intermediate CA ← Root CA");
const link2 = verifyCertSignedBy(
  "intermediate-ca.crt",
  intermediateCert,
  "root-ca.crt",
  rootCert
);

// Link 3: Root is self-signed (verifies against its own public key)
console.log("  [3] Root CA ← Root CA (self-signed)");
const link3 = verifyCertSignedBy(
  "root-ca.crt",
  rootCert,
  "root-ca.crt",
  rootCert
);

// ── Summary ──
console.log("\n📋 Summary:");
console.log("  All links valid?", link1 && link2 && link3 ? "YES ✓" : "NO ✗");

// ── Check validity dates ──
console.log("\n📅 Validity check:");
const now = new Date();

[serverCert, intermediateCert, rootCert].forEach((cert) => {
  const cnMatch = cert.subject.match(/CN=([^,\n]+)/);
  const name = cnMatch ? cnMatch[1] : cert.subject;

  const validFrom = new Date(cert.validFrom);
  const validTo = new Date(cert.validTo);
  const isWithin = now >= validFrom && now <= validTo;

  console.log(
    `  ${name}: ${validFrom.toISOString().slice(0, 10)} → ${validTo.toISOString().slice(0, 10)} ${
      isWithin ? "✓ valid" : "✗ EXPIRED/NOT YET VALID"
    }`
  );
});

// ── Trust anchor ──
console.log("\n🔒 Trust Anchor:");
console.log(
  "  Root CA is SELF-SIGNED. No one above it to verify it."
);
console.log(
  "  Your OS/browser has it pre-installed in the trust store."
);
console.log(
  "  If you trust the root, you transitively trust everything it signed."
);

// ── Chain of trust ASCII art ──
console.log(`
┌─────────────────────────────┐
│ Trust Store (OS/Browser)    │
│ Pre-installed Root CA cert  │  ← You trust this by default
└──────────┬──────────────────┘
           │ signs
           ▼
┌─────────────────────────────┐
│ Intermediate CA Certificate │  ← Root's private key signed this
│ Public key + Root's sig     │
└──────────┬──────────────────┘
           │ signs
           ▼
┌─────────────────────────────┐
│ Server Certificate          │  ← Intermediate's private key signed this
│ Public key + Intermed. sig  │
│ Domain: example.com         │
└─────────────────────────────┘
`);
