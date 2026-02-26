/**
 * SecretsManager
 *
 * Unified interface for retrieving, storing, and rotating secrets.
 * Supports multiple backends via provider pattern:
 *   - EnvironmentVariables (default, zero-dependency)
 *   - AWS SSM Parameter Store (stub — extend with @aws-sdk/client-ssm)
 *   - HashiCorp Vault (stub — extend with node-vault)
 *
 * Zero-downtime rotation: new value is written before old value TTL expires.
 *
 * @module @aura/secrets
 */

import { encrypt, decrypt, generateKey, hash, type EncryptedValue } from './encryption';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SecretProvider = 'env' | 'aws-ssm' | 'vault';

export interface SecretRecord {
  key: string;
  value: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, string>;
}

export interface SecretsManagerOptions {
  provider?: SecretProvider;
  /** Encryption key (hex, 32 bytes). Required for encrypted in-memory store. */
  encryptionKey?: string;
  /** AWS region (when provider = 'aws-ssm') */
  awsRegion?: string;
  /** AWS SSM path prefix (e.g. '/aura/production/') */
  awsPathPrefix?: string;
  /** Vault server address (when provider = 'vault') */
  vaultAddr?: string;
  /** Vault token or role ID */
  vaultToken?: string;
  /** Vault KV mount path. Default: 'secret' */
  vaultMount?: string;
}

export interface RotationResult {
  key: string;
  previousVersion: number;
  newVersion: number;
  rotatedAt: Date;
}

// ---------------------------------------------------------------------------
// In-memory encrypted store (used by env provider for runtime secrets)
// ---------------------------------------------------------------------------

interface StoredEntry {
  encrypted: EncryptedValue;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// ---------------------------------------------------------------------------
// SecretsManager
// ---------------------------------------------------------------------------

export class SecretsManager {
  private readonly provider: SecretProvider;
  private readonly encryptionKey: string;
  private readonly options: SecretsManagerOptions;

  /** In-memory encrypted store for env provider */
  private readonly store: Map<string, StoredEntry> = new Map();

  constructor(options: SecretsManagerOptions = {}) {
    this.provider      = options.provider ?? 'env';
    this.options       = options;

    // Use provided key, env var, or generate an ephemeral key
    this.encryptionKey =
      options.encryptionKey ??
      process.env.ENCRYPTION_KEY ??
      generateKey();

    if (this.provider === 'env') {
      this.loadFromEnvironment();
    }
  }

  // -------------------------------------------------------------------------
  // Core operations
  // -------------------------------------------------------------------------

  /**
   * Retrieve a secret value by key.
   * Returns null if the key does not exist or has expired.
   */
  async getSecret(key: string): Promise<string | null> {
    switch (this.provider) {
      case 'env':
        return this.getFromStore(key) ?? process.env[key] ?? null;

      case 'aws-ssm':
        return this.getFromSSM(key);

      case 'vault':
        return this.getFromVault(key);

      default:
        return null;
    }
  }

  /**
   * Store a secret value.
   */
  async setSecret(
    key: string,
    value: string,
    options?: { expiresAt?: Date; metadata?: Record<string, string> }
  ): Promise<void> {
    switch (this.provider) {
      case 'env':
        return this.setInStore(key, value, options);

      case 'aws-ssm':
        return this.setInSSM(key, value);

      case 'vault':
        return this.setInVault(key, value);
    }
  }

  /**
   * Delete a secret.
   */
  async deleteSecret(key: string): Promise<boolean> {
    if (this.provider === 'env') {
      return this.store.delete(key);
    }
    console.warn(`[SecretsManager] deleteSecret not implemented for provider: ${this.provider}`);
    return false;
  }

  /**
   * Rotate a secret with zero downtime.
   * Generates a new random value, stores it alongside the old value
   * (under a versioned key), then promotes the new value as canonical.
   *
   * Callers using `getSecret(key)` will automatically receive the new value
   * after rotation completes.
   */
  async rotateSecret(key: string): Promise<RotationResult> {
    const existing = await this.getSecret(key);
    const existingEntry = this.store.get(key);
    const previousVersion = existingEntry?.version ?? 0;

    // Archive old value
    if (existing !== null) {
      await this.setSecret(`${key}:v${previousVersion}`, existing);
    }

    // Generate new secret value (caller is responsible for applying it to services)
    const newValue = generateKey();
    await this.setSecret(key, newValue);

    const newVersion = previousVersion + 1;
    const entry = this.store.get(key);
    if (entry) entry.version = newVersion;

    console.info(`[SecretsManager] Rotated secret "${key}" from v${previousVersion} to v${newVersion}`);

    return {
      key,
      previousVersion,
      newVersion,
      rotatedAt: new Date(),
    };
  }

  /**
   * List available secret keys (no values returned).
   */
  async listSecrets(): Promise<string[]> {
    if (this.provider === 'env') {
      // Return store keys + env keys that start with AURA_
      const storeKeys = Array.from(this.store.keys());
      const envKeys = Object.keys(process.env).filter(
        (k) => k.startsWith('AURA_') || k.startsWith('DB_') || k.startsWith('JWT_')
      );
      return Array.from(new Set([...storeKeys, ...envKeys]));
    }

    console.warn(`[SecretsManager] listSecrets not implemented for provider: ${this.provider}`);
    return [];
  }

  /**
   * Get full secret record including metadata.
   */
  async getSecretRecord(key: string): Promise<SecretRecord | null> {
    const value = await this.getSecret(key);
    if (value === null) return null;

    const entry = this.store.get(key);
    return {
      key,
      value,
      version: entry?.version ?? 1,
      createdAt: entry?.createdAt ?? new Date(),
      updatedAt: entry?.updatedAt ?? new Date(),
      expiresAt: entry?.expiresAt,
    };
  }

  /**
   * Check if a secret exists.
   */
  async hasSecret(key: string): Promise<boolean> {
    const value = await this.getSecret(key);
    return value !== null;
  }

  /**
   * Get a secret hash (for comparison without exposing the value).
   */
  async getSecretHash(key: string): Promise<string | null> {
    const value = await this.getSecret(key);
    return value !== null ? hash(value) : null;
  }

  // -------------------------------------------------------------------------
  // Env provider — encrypted in-memory store
  // -------------------------------------------------------------------------

  private loadFromEnvironment(): void {
    // Pre-load well-known env secrets into the encrypted store
    const knownSecrets = [
      'DB_PASSWORD', 'JWT_SECRET', 'SESSION_SECRET',
      'REDIS_PASSWORD', 'RABBITMQ_PASSWORD',
      'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
      'ENCRYPTION_KEY', 'SENDGRID_API_KEY',
      'TWILIO_AUTH_TOKEN', 'STRIPE_SECRET_KEY',
    ];

    for (const key of knownSecrets) {
      const val = process.env[key];
      if (val) {
        const entry: StoredEntry = {
          encrypted: encrypt(val, this.encryptionKey),
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.store.set(key, entry);
      }
    }
  }

  private getFromStore(key: string): string | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.store.delete(key);
      return null;
    }

    try {
      return decrypt(entry.encrypted, this.encryptionKey);
    } catch (err) {
      console.error(`[SecretsManager] Failed to decrypt secret "${key}":`, err);
      return null;
    }
  }

  private setInStore(
    key: string,
    value: string,
    opts?: { expiresAt?: Date; metadata?: Record<string, string> }
  ): void {
    const existing = this.store.get(key);
    const entry: StoredEntry = {
      encrypted: encrypt(value, this.encryptionKey),
      version: (existing?.version ?? 0) + 1,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
      expiresAt: opts?.expiresAt,
    };
    this.store.set(key, entry);
  }

  // -------------------------------------------------------------------------
  // AWS SSM stub
  // -------------------------------------------------------------------------

  private async getFromSSM(key: string): Promise<string | null> {
    const prefix = this.options.awsPathPrefix ?? '/aura/';
    console.debug(`[SecretsManager] AWS SSM get: ${prefix}${key}`);
    // TODO: Implement with @aws-sdk/client-ssm
    // const client = new SSMClient({ region: this.options.awsRegion });
    // const cmd = new GetParameterCommand({ Name: `${prefix}${key}`, WithDecryption: true });
    // const res = await client.send(cmd);
    // return res.Parameter?.Value ?? null;
    return process.env[key] ?? null;
  }

  private async setInSSM(key: string, value: string): Promise<void> {
    const prefix = this.options.awsPathPrefix ?? '/aura/';
    console.debug(`[SecretsManager] AWS SSM put: ${prefix}${key}`);
    // TODO: Implement with @aws-sdk/client-ssm
    // const client = new SSMClient({ region: this.options.awsRegion });
    // const cmd = new PutParameterCommand({ Name: `${prefix}${key}`, Value: value, Type: 'SecureString', Overwrite: true });
    // await client.send(cmd);
    console.warn(`[SecretsManager] AWS SSM setSecret stub — value not persisted for key: ${key}`);
  }

  // -------------------------------------------------------------------------
  // HashiCorp Vault stub
  // -------------------------------------------------------------------------

  private async getFromVault(key: string): Promise<string | null> {
    const mount = this.options.vaultMount ?? 'secret';
    console.debug(`[SecretsManager] Vault get: ${mount}/data/aura/${key}`);
    // TODO: Implement with node-vault or vault client
    // const vault = require('node-vault')({ endpoint: this.options.vaultAddr, token: this.options.vaultToken });
    // const res = await vault.read(`${mount}/data/aura/${key}`);
    // return res?.data?.data?.value ?? null;
    return process.env[key] ?? null;
  }

  private async setInVault(key: string, value: string): Promise<void> {
    const mount = this.options.vaultMount ?? 'secret';
    console.debug(`[SecretsManager] Vault put: ${mount}/data/aura/${key}`);
    // TODO: Implement with node-vault
    console.warn(`[SecretsManager] Vault setSecret stub — value not persisted for key: ${key}`);
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _instance: SecretsManager | null = null;

export function getSecretsManager(options?: SecretsManagerOptions): SecretsManager {
  if (!_instance) {
    _instance = new SecretsManager(options);
  }
  return _instance;
}

export function resetSecretsManager(): void {
  _instance = null;
}
