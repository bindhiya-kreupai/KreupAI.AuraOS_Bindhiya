/**
 * Unit Tests — AES-256-GCM Encryption & PII Masking
 *
 * Tests the @aura/secrets encryption utilities:
 *   - encrypt / decrypt roundtrip
 *   - different data types
 *   - PII masking (email, phone, SSN)
 *   - tamper detection (modified ciphertext)
 *
 * @module tests/unit/utils
 */

import { describe, test, expect } from 'vitest';
import {
  encrypt,
  decrypt,
  generateKey,
  maskPII,
  hash,
} from '../../../packages/@aura/secrets/src/encryption';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function encryptDecryptRoundtrip(plaintext: string, key: string): string {
  const encrypted = encrypt(plaintext, key);
  return decrypt(encrypted, key);
}

// ---------------------------------------------------------------------------
// Encrypt / Decrypt Roundtrip
// ---------------------------------------------------------------------------

describe('Encryption — AES-256-GCM Roundtrip', () => {
  test('encrypts and decrypts a plain string', () => {
    const key = generateKey();
    const plaintext = 'Hello, AuraOS!';
    expect(encryptDecryptRoundtrip(plaintext, key)).toBe(plaintext);
  });

  test('encrypts and decrypts an empty string', () => {
    const key = generateKey();
    expect(encryptDecryptRoundtrip('', key)).toBe('');
  });

  test('encrypts and decrypts a JSON-serialised number', () => {
    const key = generateKey();
    const value = JSON.stringify(42);
    expect(encryptDecryptRoundtrip(value, key)).toBe(value);
  });

  test('encrypts and decrypts a JSON-serialised object', () => {
    const key = generateKey();
    const obj = { employeeId: 'emp-001', salary: 95_000, currency: 'AED' };
    const serialised = JSON.stringify(obj);
    const result = encryptDecryptRoundtrip(serialised, key);
    expect(JSON.parse(result)).toEqual(obj);
  });

  test('produces different ciphertext for the same plaintext (IV randomisation)', () => {
    const key = generateKey();
    const plaintext = 'sensitive-data';
    const enc1 = encrypt(plaintext, key);
    const enc2 = encrypt(plaintext, key);
    // IVs should differ
    expect(enc1.iv).not.toBe(enc2.iv);
    // Ciphertexts should differ too
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  test('decrypts with different key throws', () => {
    const key1 = generateKey();
    const key2 = generateKey();
    const encrypted = encrypt('secret', key1);
    expect(() => decrypt(encrypted, key2)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Data Type Support
// ---------------------------------------------------------------------------

describe('Encryption — Different Data Types', () => {
  test('roundtrips a long Unicode string', () => {
    const key = generateKey();
    const unicode = 'محمد بن سلمان 🇸🇦 — مرحباً بكم في AuraOS';
    expect(encryptDecryptRoundtrip(unicode, key)).toBe(unicode);
  });

  test('roundtrips a large payload (100KB)', () => {
    const key = generateKey();
    const large = 'x'.repeat(100_000);
    expect(encryptDecryptRoundtrip(large, key)).toBe(large);
  });

  test('roundtrips a serialised boolean', () => {
    const key = generateKey();
    expect(encryptDecryptRoundtrip('true', key)).toBe('true');
  });

  test('roundtrips a serialised null', () => {
    const key = generateKey();
    expect(encryptDecryptRoundtrip('null', key)).toBe('null');
  });
});

// ---------------------------------------------------------------------------
// PII Masking
// ---------------------------------------------------------------------------

describe('Encryption — PII Masking', () => {
  test('masks email: local part hidden, domain extension preserved', () => {
    const masked = maskPII('john.doe@example.com', 'email');
    expect(masked).toContain('@');
    expect(masked).toContain('.com');
    // local part should be mostly asterisks
    const local = masked.split('@')[0];
    expect(local).toMatch(/\*/);
  });

  test('masks phone: only last 4 digits visible', () => {
    const masked = maskPII('+971501234567', 'phone');
    expect(masked.endsWith('4567')).toBe(true);
    expect(masked).toMatch(/\*+4567$/);
  });

  test('masks SSN: last 4 digits visible, formatted', () => {
    const masked = maskPII('123-45-6789', 'ssn');
    expect(masked).toContain('6789');
    expect(masked).toMatch(/\*/);
  });

  test('masks IBAN: only last 4 chars visible', () => {
    const masked = maskPII('AE070331234567890123456', 'iban');
    expect(masked.endsWith('3456')).toBe(true);
    expect(masked).toMatch(/\*+3456$/);
  });

  test('masks generic value: only last 4 chars visible', () => {
    const masked = maskPII('SECRETVALUE', 'generic');
    expect(masked.endsWith('ALUE')).toBe(true);
    expect(masked).toMatch(/\*+ALUE$/);
  });

  test('short values are fully masked', () => {
    const masked = maskPII('abc', 'generic');
    expect(masked).toBe('***');
  });

  test('empty string returns empty string', () => {
    expect(maskPII('', 'email')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Tamper Detection
// ---------------------------------------------------------------------------

describe('Encryption — Tamper Detection', () => {
  test('throws when ciphertext is modified', () => {
    const key = generateKey();
    const encrypted = encrypt('sensitive-payload', key);

    // Flip a byte in the ciphertext
    const tamperedCiphertext =
      encrypted.ciphertext.slice(0, -2) +
      (encrypted.ciphertext.endsWith('ff') ? '00' : 'ff');

    expect(() =>
      decrypt({ ...encrypted, ciphertext: tamperedCiphertext }, key)
    ).toThrow();
  });

  test('throws when auth tag is modified', () => {
    const key = generateKey();
    const encrypted = encrypt('another-payload', key);

    const tamperedTag =
      encrypted.tag.slice(0, -2) +
      (encrypted.tag.endsWith('ff') ? '00' : 'ff');

    expect(() =>
      decrypt({ ...encrypted, tag: tamperedTag }, key)
    ).toThrow();
  });

  test('throws when IV is modified', () => {
    const key = generateKey();
    const encrypted = encrypt('yet-another-payload', key);

    const tamperedIV =
      encrypted.iv.slice(0, -2) +
      (encrypted.iv.endsWith('ff') ? '00' : 'ff');

    expect(() =>
      decrypt({ ...encrypted, iv: tamperedIV }, key)
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Hash
// ---------------------------------------------------------------------------

describe('Encryption — SHA-256 Hash', () => {
  test('produces a 64-char hex string', () => {
    const digest = hash('test-value');
    expect(digest).toHaveLength(64);
    expect(digest).toMatch(/^[0-9a-f]+$/);
  });

  test('same input always produces same hash', () => {
    expect(hash('stable')).toBe(hash('stable'));
  });

  test('different inputs produce different hashes', () => {
    expect(hash('aaa')).not.toBe(hash('aab'));
  });
});
