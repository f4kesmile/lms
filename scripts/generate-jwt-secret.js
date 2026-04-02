#!/usr/bin/env node
/**
 * Generate a cryptographically secure JWT secret.
 * Usage: node scripts/generate-jwt-secret.js [length]
 *
 * Default length: 64 bytes = 128 hex chars (512-bit).
 */

const { randomBytes } = require("crypto");

const length = parseInt(process.argv[2], 10) || 64;

if (length < 32) {
  console.error("ERROR: panjang minimal 32 byte (256-bit) untuk keamanan.");
  process.exit(1);
}

const secret = randomBytes(length).toString("hex");

console.log("\nJWT_SECRET aman yang baru:\n");
console.log(`JWT_SECRET=${secret}`);
console.log(
  `\nPanjang: ${length} byte = ${secret.length} karakter hex (${length * 8}-bit entropy)\n`
);
console.log("Salin baris JWT_SECRET= di atas ke file .env Anda.");
