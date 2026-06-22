/**
 * Service Configuration
 */

export const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3011', 10),
  host: process.env.HOST || '0.0.0.0',
  grpcPort: parseInt(process.env.GRPC_PORT || '50051', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT
  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set.');
      return process.env.JWT_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRY || '1h',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  },

  // OAuth2 Providers
  oauth2: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3006/api/auth/callback/google',
    },
    microsoft: {
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
      redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:3006/api/auth/callback/microsoft',
    },
    okta: {
      domain: process.env.OKTA_DOMAIN || '',
      clientId: process.env.OKTA_CLIENT_ID || '',
      clientSecret: process.env.OKTA_CLIENT_SECRET || '',
      redirectUri: process.env.OKTA_REDIRECT_URI || 'http://localhost:3006/api/auth/callback/okta',
    },
  },

  // SAML
  saml: {
    entryPoint: process.env.SAML_ENTRY_POINT || '',
    issuer: process.env.SAML_ISSUER || 'auraos',
    idpCert: process.env.SAML_IDP_CERT || '',
    spPrivateKey: process.env.SAML_SP_PRIVATE_KEY || '',
  },

  // MFA
  mfa: {
    enabled: process.env.ENABLE_MFA === 'true',
    issuer: 'AuraOS',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Datadog APM
  datadog: {
    enabled: process.env.DD_TRACE_ENABLED === 'true',
    service: process.env.DD_SERVICE || 'auth-service',
    env: process.env.DD_ENV || 'development',
    version: process.env.DD_VERSION || '1.0.0',
    agentHost: process.env.DD_AGENT_HOST || 'localhost',
  },

  // Logging
  log: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.NODE_ENV === 'development',
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),

  // Feature Flags
  features: {
    mfa: process.env.ENABLE_MFA === 'true',
    sso: process.env.ENABLE_SSO === 'true',
    auditLogging: process.env.ENABLE_AUDIT_LOGGING === 'true',
  },
} as const;

// If SSO is enabled, at least one OAuth provider must be fully configured.
// Empty-string client secrets silently fail OAuth code-exchange — refuse to start
// rather than leave a misconfigured deployment running.
if (config.features.sso) {
  const providerConfigured = (p: { clientId: string; clientSecret: string }) =>
    p.clientId.length > 0 && p.clientSecret.length > 0;
  const { google, microsoft, okta } = config.oauth2;
  if (![google, microsoft, okta].some(providerConfigured)) {
    throw new Error(
      'FATAL: ENABLE_SSO=true but no OAuth provider (Google, Microsoft, Okta) has a non-empty clientId + clientSecret.'
    );
  }
}
