import { generateKeyPairSync, createPublicKey, createPrivateKey } from "node:crypto";

// ─── STEP 1: Generate a Public/Private Key Pair ────────────────
//
// Private Key = your secret. You NEVER share this.
// Public Key  = derived from private key. You share it freely.
//
// Nothing encrypted with one can be decrypted without the other.
// ───────────────────────────────────────────────────────────────

console.log("=== STEP 1: Generate a Key Pair ===\n");

// Generate RSA 2048-bit key pair
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

console.log("Private Key (KEEP SECRET - first 100 chars):");
console.log(privateKey.slice(0, 100) + "...\n");

console.log("Public Key (you can share this publicly - first 100 chars):");
console.log(publicKey.slice(0, 100) + "...\n");

// You can also derive the public key from the private key at any time
const derivedPublicKey = createPublicKey(privateKey);
console.log("Public key can be derived from private key:");
console.log(
  derivedPublicKey.export({ type: "spki", format: "pem" }).slice(0, 100) +
    "...\n"
);

console.log(
  "Key concept: Private key → can always derive public key from it."
);
console.log(
  "            Public key → CANNOT derive private key from it."
);
console.log(
  "            That's why you only share the public key. The math is one-way."
);
