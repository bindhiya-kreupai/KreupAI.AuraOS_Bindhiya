/**
 * Encryption & Hashing Utilities
 *
 * Provides AES-256-GCM encryption/decryption, SHA-256 hashing,
 * secure key generation, and PII masking for GDPR compliance.
 *
 * Uses Node.js built-in `crypto` module — no external dependencies.
 *
 * @module @aura/secrets
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
} from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;      // 256-bit
const IV_LENGTH  = 12;      // 96-bit IV (recommended for GCM)
const TAG_LENGTH = 16;      // 128-bit auth tag
const ENCODING   = 'hex';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PIIType = 'ssn' | 'email' | 'phone' | 'iban' | 'credit-card' | 'generic';

export interface EncryptedValue {
  /** Hex-encoded ciphertext */
  ciphertext: string;
  /** Hex-encoded initialisation vector */
  iv: string;
  /** Hex-encoded GCM auth tag */
  tag: string;
  /** Algorithm identifier */
  algorithm: string;
}

// ---------------------------------------------------------------------------
// Encryption
// ---------------------------------------------------------------------------

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * @param plaintext  The string to encrypt
 * @param key        32-byte key (hex string or Buffer). Use `generateKey()` to create one.
 * @returns          Structured encrypted value including IV and auth tag
 */
export function encrypt(plaintext: string, key: string | Buffer): EncryptedValue {
  const keyBuf  = normaliseKey(key);
  const iv      = randomBytes(IV_LENGTH);
  const cipher  = createCipheriv(ALGORITHM, keyBuf, iv);

  const ciphertextBuf = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return {
    ciphertext: ciphertextBuf.toString(ENCODING),
    iv:         iv.toString(ENCODING),
    tag:        cipher.getAuthTag().toString(ENCODING),
    algorithm:  ALGORITHM,
  };
}

/**
 * Decrypt an AES-256-GCM encrypted value.
 *
 * @throws Error if auth tag verification fails (tampered data)
 */
export function decrypt(encrypted: EncryptedValue, key: string | Buffer): string {
  const keyBuf   = normaliseKey(key);
  const iv       = Buffer.from(encrypted.iv, ENCODING);
  const tag      = Buffer.from(encrypted.tag, ENCODING);
  const decipher = createDecipheriv(ALGORITHM, keyBuf, iv);

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, ENCODING)),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

/**
 * Compute a SHA-256 hex digest of the input value.
 * Suitable for non-reversible fingerprints (e.g. API key hashing).
 */
export function hash(value: string): string {
  return createHash('sha256').update(value).digest(ENCODING);
}

/**
 * Derive a deterministic key from a password and salt using scrypt.
 * Suitable for wrapping master keys with user passwords.
 */
export function deriveKey(password: string, salt: string): Buffer {
  return scryptSync(password, salt, KEY_LENGTH) as Buffer;
}

// ---------------------------------------------------------------------------
// Key generation
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random 256-bit (32-byte) encryption key.
 * Returns the key as a hex string.
 */
export function generateKey(): string {
  return randomBytes(KEY_LENGTH).toString(ENCODING);
}

/**
 * Generate a cryptographically random salt (16 bytes, hex).
 */
export function generateSalt(): string {
  return randomBytes(16).toString(ENCODING);
}

// ---------------------------------------------------------------------------
// PII masking
// ---------------------------------------------------------------------------

/**
 * Mask a PII value for display, retaining only the last 4 characters.
 *
 * Examples:
 *   maskPII('123-45-6789', 'ssn')          → '***-**-6789'
 *   maskPII('user@example.com', 'email')   → '****@*****.com'  (domain kept)
 *   maskPII('+1-202-555-0100', 'phone')    → '**-***-***-0100'
 *   maskPII('DE89370400440532013000','iban')→ '********************3000'
 */
export function maskPII(value: string, type: PIIType): string {
  if (!value) return value;

  switch (type) {
    case 'ssn': {
      // Keep last 4 digits: ***-**-6789
      const digits = value.replace(/\D/g, '');
      const masked = '*'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
      if (value.includes('-')) {
        return masked.replace(/(\d{3})(\d{2})(\d{4})/, '***-**-$3');
      }
      return masked;
    }

    case 'email': {
      const atIdx = value.indexOf('@');
      if (atIdx < 0) return maskGeneric(value);
      const local  = value.slice(0, atIdx);
      const domain = value.slice(atIdx + 1);
      const dotIdx = domain.lastIndexOf('.');
      const domainMasked = dotIdx >= 0
        ? '*'.repeat(dotIdx) + domain.slice(dotIdx)
        : '*'.repeat(domain.length);
      return (local.length <= 2 ? local : local[0] + '*'.repeat(local.length - 1)) +
        '@' + domainMasked;
    }

    case 'phone': {
      const digits = value.replace(/\D/g, '');
      const masked = '*'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
      return masked;
    }

    case 'iban': {
      // Keep last 4 chars
      return '*'.repeat(Math.max(0, value.replace(/\s/g, '').length - 4)) +
        value.slice(-4);
    }

    case 'credit-card': {
      const digits = value.replace(/\D/g, '');
      return '*'.repeat(Math.max(0, digits.length - 4)) + digits.slice(-4);
    }

    case 'generic':
    default:
      return maskGeneric(value);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskGeneric(value: string): string {
  if (value.length <= 4) return '*'.repeat(value.length);
  return '*'.repeat(value.length - 4) + value.slice(-4);
}

function normaliseKey(key: string | Buffer): Buffer {
  if (Buffer.isBuffer(key)) {
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Encryption key must be ${KEY_LENGTH} bytes, got ${key.length}`);
    }
    return key;
  }

  const buf = Buffer.from(key, ENCODING);
  if (buf.length !== KEY_LENGTH) {
    throw new Error(
      `Encryption key must be ${KEY_LENGTH * 2} hex chars (${KEY_LENGTH} bytes), got ${buf.length} bytes`
    );
  }
  return buf;
}
