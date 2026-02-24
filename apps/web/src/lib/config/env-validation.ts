/**
 * Environment Variables Validation
 * Validates required environment variables for Phase 3 services
 */

import { logger } from '@/lib/logger';

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS = {
  // Core Application
  NEXT_PUBLIC_APP_URL: 'Application URL',
  JWT_SECRET: 'JWT secret key',

  // Database
  DATABASE_URL: 'PostgreSQL connection URL',

  // Redis
  REDIS_URL: 'Redis connection URL',
};

/**
 * Optional environment variables (with warnings if missing)
 */
const OPTIONAL_ENV_VARS = {
  // RabbitMQ
  RABBITMQ_HOST: 'RabbitMQ host',
  RABBITMQ_PORT: 'RabbitMQ port',
  RABBITMQ_USER: 'RabbitMQ username',
  RABBITMQ_PASSWORD: 'RabbitMQ password',
  RABBITMQ_VHOST: 'RabbitMQ virtual host',

  // Elasticsearch
  ELASTICSEARCH_NODE: 'Elasticsearch node URL',
  ELASTICSEARCH_USERNAME: 'Elasticsearch username',
  ELASTICSEARCH_PASSWORD: 'Elasticsearch password',

  // Google OAuth2
  GOOGLE_CLIENT_ID: 'Google OAuth2 client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth2 client secret',

  // Microsoft Azure AD
  AZURE_AD_CLIENT_ID: 'Microsoft Azure AD client ID',
  AZURE_AD_CLIENT_SECRET: 'Microsoft Azure AD client secret',
  AZURE_AD_TENANT_ID: 'Microsoft Azure AD tenant ID',

  // Okta
  OKTA_DOMAIN: 'Okta domain',
  OKTA_CLIENT_ID: 'Okta client ID',
  OKTA_CLIENT_SECRET: 'Okta client secret',

  // Datadog APM
  DD_API_KEY: 'Datadog API key',
  DD_SERVICE_NAME: 'Datadog service name',
};

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      missing.push(`${key} (${description})`);
    }
  }

  // Check optional variables (warnings only)
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key]) {
      warnings.push(`${key} (${description}) - Feature may not be available`);
    }
  }

  const valid = missing.length === 0;

  return {
    valid,
    missing,
    warnings,
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation(): void {
  const result = validateEnvironment();

  if (result.valid) {
    logger.info('✅ Environment variables validation passed');

    if (result.warnings.length > 0) {
      logger.warn(
        { warnings: result.warnings },
        `⚠️  ${result.warnings.length} optional environment variables missing`
      );
    }
  } else {
    logger.error(
      { missing: result.missing },
      `❌ Environment variables validation failed - ${result.missing.length} required variables missing`
    );

    // In production, we might want to throw an error
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${result.missing.join(', ')}`
      );
    }
  }
}

/**
 * Get environment summary for health checks
 */
export function getEnvironmentSummary(): {
  required: { key: string; present: boolean }[];
  optional: { key: string; present: boolean }[];
} {
  return {
    required: Object.keys(REQUIRED_ENV_VARS).map((key) => ({
      key,
      present: !!process.env[key],
    })),
    optional: Object.keys(OPTIONAL_ENV_VARS).map((key) => ({
      key,
      present: !!process.env[key],
    })),
  };
}

/**
 * Check if a specific feature is enabled based on env vars
 */
export function isFeatureEnabled(feature: string): boolean {
  switch (feature) {
    case 'rabbitmq':
      return !!(
        process.env.RABBITMQ_HOST &&
        process.env.RABBITMQ_PORT &&
        process.env.RABBITMQ_USER &&
        process.env.RABBITMQ_PASSWORD
      );

    case 'elasticsearch':
      return !!process.env.ELASTICSEARCH_NODE;

    case 'google-oauth':
      return !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET
      );

    case 'microsoft-oauth':
      return !!(
        process.env.AZURE_AD_CLIENT_ID &&
        process.env.AZURE_AD_CLIENT_SECRET
      );

    case 'okta-oauth':
      return !!(
        process.env.OKTA_DOMAIN &&
        process.env.OKTA_CLIENT_ID &&
        process.env.OKTA_CLIENT_SECRET
      );

    case 'datadog':
      return !!(
        process.env.DD_API_KEY &&
        process.env.DD_SERVICE_NAME
      );

    default:
      return false;
  }
}
