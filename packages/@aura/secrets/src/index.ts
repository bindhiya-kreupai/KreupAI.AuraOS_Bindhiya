/**
 * @aura/secrets
 * AuraOS secrets management and cryptography utilities.
 *
 * Exports:
 *   - SecretsManager   — Multi-provider secrets store (env / AWS SSM / Vault)
 *   - encrypt          — AES-256-GCM encryption
 *   - decrypt          — AES-256-GCM decryption
 *   - hash             — SHA-256 hashing
 *   - generateKey      — Random 256-bit key generation
 *   - maskPII          — GDPR-compliant PII masking
 */

// Secrets manager
export {
  SecretsManager,
  getSecretsManager,
  resetSecretsManager,
} from './secrets-manager';

export type {
  SecretProvider,
  SecretRecord,
  SecretsManagerOptions,
  RotationResult,
} from './secrets-manager';

// Encryption & hashing utilities
export {
  encrypt,
  decrypt,
  hash,
  deriveKey,
  generateKey,
  generateSalt,
  maskPII,
} from './encryption';

export type {
  PIIType,
  EncryptedValue,
} from './encryption';
