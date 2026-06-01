import { z } from 'zod';

/**
 * Environment Variable Validation Schema
 *
 * Validates all required environment variables at application startup
 * Prevents runtime errors from missing or invalid configuration
 */

const envSchema = z
  .object({
    // Node Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Database Configuration
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

    // JWT Configuration
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET must be at least 32 characters for security')
      .describe('Secret key for signing JWT tokens'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
      .describe('Secret key for signing refresh tokens'),
    JWT_EXPIRES_IN: z.string().default('15m').describe('Access token expiration time'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d').describe('Refresh token expiration time'),

    // Crypto Keys (REQUIRED — app refuses to start without these; see Phase 1 #28)
    MFA_ENCRYPTION_KEY: z
      .string()
      .min(
        32,
        'MFA_ENCRYPTION_KEY must be at least 32 characters; generate with `openssl rand -base64 32`'
      )
      .describe('Encrypts TOTP secrets at rest'),
    SSN_ENCRYPTION_KEY: z
      .string()
      .min(
        32,
        'SSN_ENCRYPTION_KEY must be at least 32 characters; generate with `openssl rand -base64 32`'
      )
      .describe('Encrypts dependent SSN fields at rest'),

    // Application Configuration
    NEXT_PUBLIC_APP_URL: z.string().url().optional().describe('Public application URL'),
    PORT: z.coerce.number().int().positive().default(3000).describe('Application port'),

    // Logging Configuration
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info')
      .describe('Minimum log level'),

    // Email Configuration (Optional - for future use)
    SMTP_HOST: z.string().optional().describe('SMTP server host'),
    SMTP_PORT: z.coerce.number().int().positive().optional().describe('SMTP server port'),
    SMTP_USER: z.string().optional().describe('SMTP username'),
    SMTP_PASSWORD: z.string().optional().describe('SMTP password'),
    SMTP_FROM: z.string().email().optional().describe('Default sender email address'),

    // Redis Configuration (Optional - for caching)
    REDIS_URL: z.string().url().optional().describe('Redis connection URL'),

    // External Services (Optional)
    SENTRY_DSN: z.string().url().optional().describe('Sentry error tracking DSN'),
    DATADOG_API_KEY: z.string().optional().describe('Datadog API key'),

    // S3/Storage Configuration (Optional)
    AWS_ACCESS_KEY_ID: z.string().optional().describe('AWS access key'),
    AWS_SECRET_ACCESS_KEY: z.string().optional().describe('AWS secret key'),
    AWS_REGION: z.string().optional().describe('AWS region'),
    AWS_S3_BUCKET: z.string().optional().describe('S3 bucket name'),

    // OAuth/SSO Configuration (Optional)
    GOOGLE_CLIENT_ID: z.string().optional().describe('Google OAuth client ID'),
    GOOGLE_CLIENT_SECRET: z.string().optional().describe('Google OAuth client secret'),
    MICROSOFT_CLIENT_ID: z.string().optional().describe('Microsoft OAuth client ID'),
    MICROSOFT_CLIENT_SECRET: z.string().optional().describe('Microsoft OAuth client secret'),

    // Feature Flags
    ENABLE_SIGNUP: z.coerce.boolean().default(true).describe('Allow new user registration'),
    ENABLE_MFA: z.coerce.boolean().default(true).describe('Enable multi-factor authentication'),
    ENABLE_SSO: z.coerce.boolean().default(false).describe('Enable SSO authentication'),

    // Rate Limiting
    RATE_LIMIT_MAX: z.coerce
      .number()
      .int()
      .positive()
      .default(100)
      .describe('Max requests per window'),
    RATE_LIMIT_WINDOW: z.coerce
      .number()
      .int()
      .positive()
      .default(900000)
      .describe('Rate limit window in ms (15min)'),

    // Microservices Configuration
    AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
    EMPLOYEE_SERVICE_URL: z.string().url().default('http://localhost:3002'),
    NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3003'),
    DOCUMENT_SERVICE_URL: z.string().url().default('http://localhost:3004'),
    PAYROLL_SERVICE_URL: z.string().url().default('http://localhost:3005'),
    ANALYTICS_SERVICE_URL: z.string().url().default('http://localhost:3007'),
    AI_SERVICE_URL: z.string().url().default('http://localhost:3000'),
    INTEGRATION_SERVICE_URL: z.string().url().default('http://localhost:3008'),
    SCHEDULING_SERVICE_URL: z.string().url().default('http://localhost:3009'),
    WORKFLOW_SERVICE_URL: z.string().url().default('http://localhost:3010'),

    // Deployment Information (Vercel)
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  })
  .superRefine((vals, ctx) => {
    // In production, env vars that are merely "optional" for local dev MUST be set
    // for observability, secrets management, and audit-trail integrity to function.
    // Keep this list narrow — every entry should justify being a hard blocker.
    if (vals.NODE_ENV !== 'production') return;
    const requiredInProd: Array<keyof typeof vals> = [
      'NEXT_PUBLIC_APP_URL', // canonical URL for emails/redirects
      'REDIS_URL', // session + audit + rate-limit storage
      'SENTRY_DSN', // error tracking
    ];
    for (const key of requiredInProd) {
      if (!vals[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key as string],
          message: `${String(key)} is required in production (NODE_ENV=production)`,
        });
      }
    }
    // If SSO is on, OAuth secrets must be supplied
    if (vals.ENABLE_SSO) {
      if (!vals.GOOGLE_CLIENT_SECRET && !vals.MICROSOFT_CLIENT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ENABLE_SSO'],
          message:
            'ENABLE_SSO=true but no OAuth provider secret is configured (Google or Microsoft)',
        });
      }
    }
  });

/**
 * Validated environment variables
 * Type-safe access to all configuration
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
function parseEnv(): Env {
  // Skip validation on client-side
  if (typeof window !== 'undefined') {
    // Return a minimal client-side env object with only public vars
    return {
      NODE_ENV: (process.env.NODE_ENV as any) || 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    } as Env;
  }

  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      console.error('\n❌ Invalid environment variables:\n');
      console.error(formatted.join('\n'));
      console.error('\nPlease check your .env file and ensure all required variables are set.\n');

      if (typeof process !== 'undefined' && process.exit) {
        process.exit(1);
      }
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * Use this instead of process.env for type safety
 */
export const env = parseEnv();

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Database configuration
 */
export const dbConfig = {
  url: env.DATABASE_URL,
};

/**
 * JWT configuration
 */
export const jwtConfig = {
  secret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
};

/**
 * Application configuration
 */
export const appConfig = {
  url: env.NEXT_PUBLIC_APP_URL,
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
};

/**
 * Logging configuration
 */
export const logConfig = {
  level: env.LOG_LEVEL,
};

/**
 * Email configuration
 */
export const emailConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  password: env.SMTP_PASSWORD,
  from: env.SMTP_FROM,
};

/**
 * Redis configuration
 */
export const redisConfig = {
  url: env.REDIS_URL,
};

/**
 * Feature flags
 */
export const featureFlags = {
  enableSignup: env.ENABLE_SIGNUP,
  enableMFA: env.ENABLE_MFA,
  enableSSO: env.ENABLE_SSO,
};

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  max: env.RATE_LIMIT_MAX,
  windowMs: env.RATE_LIMIT_WINDOW,
};

/**
 * Microservices configuration
 */
export const servicesConfig = {
  auth: env.AUTH_SERVICE_URL,
  employee: env.EMPLOYEE_SERVICE_URL,
  notification: env.NOTIFICATION_SERVICE_URL,
  document: env.DOCUMENT_SERVICE_URL,
  payroll: env.PAYROLL_SERVICE_URL,
  analytics: env.ANALYTICS_SERVICE_URL,
  ai: env.AI_SERVICE_URL,
  integration: env.INTEGRATION_SERVICE_URL,
  scheduling: env.SCHEDULING_SERVICE_URL,
  workflow: env.WORKFLOW_SERVICE_URL,
};

// Validation runs at module load via parseEnv() above; if it failed,
// the process would have already exited. No explicit success log here —
// the absence of a startup error is the success signal.
