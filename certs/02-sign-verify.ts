import {
  generateKeyPairSync,
  createSign,
  createVerify,
} from "node:crypto";

// ─── STEP 2: Sign a Message, Then Verify It ──────────────────
//
// Signing = encrypt a hash of the message with your PRIVATE key.
//            Anyone with your PUBLIC key can verify it was YOU.
//
// This is how certificates work:
//   A CA "signs" your cert with its private key.
//   Browsers verify with the CA's public key.
// ──────────────────────────────────────────────────────────────

console.log("=== STEP 2: Sign and Verify a Message ===\n");

// 1. Generate keys
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// 2. Alice signs a message with her PRIVATE key
const message = "example.com owns public key 0x8a3f2b...";
console.log("Message to sign:", `"${message}"`);

const signer = createSign("SHA256");
signer.update(message);
signer.end();
const signature = signer.sign(privateKey, "hex");

console.log("Signature (hex):", signature.slice(0, 60) + "...\n");
console.log("The signature proves Alice wrote this message.");
console.log("Bob can verify it using Alice's PUBLIC key.\n");

// 3. Bob verifies the signature using Alice's PUBLIC key
const verifier = createVerify("SHA256");
verifier.update(message);
verifier.end();
const isValid = verifier.verify(publicKey, signature, "hex");

console.log("Is the signature valid?", isValid ? "YES ✓" : "NO ✗");

// 4. What if someone tampers with the message?
console.log("\n--- Tamper test ---");
const tamperedVerifier = createVerify("SHA256");
tamperedVerifier.update(message + "EVIL!"); // tampered!
tamperedVerifier.end();
const tamperedValid = tamperedVerifier.verify(publicKey, signature, "hex");
console.log(
  "Tampered message valid?",
  tamperedValid ? "YES ✗ (bad!)" : "NO ✓ (correctly rejected)"
);

console.log(
  "\nThis is the core of certificates: the CA's signature on your cert"
);
console.log("can be verified by anyone with the CA's public key.");
