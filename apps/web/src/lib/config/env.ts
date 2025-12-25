import { z } from 'zod';
import { logger } from '@/lib/logger';

/**
 * Environment Variable Validation Schema
 *
 * Validates all required environment variables at application startup
 * Prevents runtime errors from missing or invalid configuration
 */

const envSchema = z.object({
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
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100).describe('Max requests per window'),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(900000).describe('Rate limit window in ms (15min)'),

  // Deployment Information (Vercel)
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
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
  try {
    return envSchema.parse(process.env);
  } catch {
    if (error instanceof z.ZodError) {
      const formatted = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      logger.error('\n❌ Invalid environment variables:\n');
      logger.error(formatted.join('\n'));
      logger.error('\nPlease check your .env file and ensure all required variables are set.\n');

      process.exit(1);
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
 * Validate environment on module load
 * This ensures the app won't start with invalid configuration
 */
if (typeof window === 'undefined') {
  // Only validate on server-side
  logger.info('✅ Environment variables validated successfully');
}
