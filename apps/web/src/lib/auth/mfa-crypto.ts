/**
 * Centralized MFA encryption/decryption helpers.
 *
 * Uses AES-256-CBC with a proper IV (via createCipheriv/createDecipheriv).
 * The IV is prepended to the ciphertext so it can be recovered on decrypt.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size

function getKey(): Buffer {
  const raw = process.env.MFA_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('FATAL: MFA_ENCRYPTION_KEY environment variable is not set.');
  }
  // SHA-256 hash ensures exactly 32 bytes regardless of input length
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypt a plaintext string. Returns `iv:hex:ciphertext`.
 */
export function encryptSecret(secret: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a ciphertext produced by `encryptSecret`.
 * Also handles legacy ciphertext (no IV prefix) from the deprecated
 * `crypto.createCipher` / `crypto.createDecipher` path.
 */
export function decryptSecret(encrypted: string): string {
  const key = getKey();

  if (encrypted.includes(':')) {
    // New format: iv:hex:ciphertext
    const [ivHex, ...rest] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(rest.join(':'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Legacy format (no IV) — migrate on next setup/verify
  // This is the deprecated createDecipher path; we keep it only for
  // reading secrets that were stored before the migration.
  const decipher = crypto.createDecipher(ALGORITHM, process.env.MFA_ENCRYPTION_KEY!);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate backup codes.
 */
export function generateBackupCodes(count: number = 10): {
  codes: string[];
  hashed: string[];
} {
  const bcrypt = require('bcryptjs');
  const codes: string[] = [];
  const hashed: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    hashed.push(bcrypt.hashSync(code, 10));
  }
  return { codes, hashed };
}
