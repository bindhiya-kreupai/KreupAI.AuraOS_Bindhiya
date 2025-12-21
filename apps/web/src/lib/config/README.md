# Environment Configuration

## Overview

AuraOS uses Zod-based environment variable validation to ensure all required configuration is present and valid before the application starts. This prevents runtime errors from missing or misconfigured environment variables.

## Features

- ✅ **Type-Safe Configuration**: Full TypeScript support for all environment variables
- ✅ **Startup Validation**: Validates all variables before app starts
- ✅ **Clear Error Messages**: Descriptive error messages for invalid configuration
- ✅ **Default Values**: Sensible defaults for optional variables
- ✅ **Grouped Exports**: Organized configuration objects by domain

## Quick Start

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` and set the required variables:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@localhost:5432/auraos

# JWT Secrets (REQUIRED)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

### 3. Start Application

The app will automatically validate environment variables on startup:

```bash
pnpm dev
```

## Usage

### Type-Safe Access

Instead of using `process.env` directly, import validated configuration:

```typescript
// ❌ DON'T: Unsafe, no type checking
const dbUrl = process.env.DATABASE_URL;
const port = parseInt(process.env.PORT || '3000');

// ✅ DO: Type-safe, validated
import { env, dbConfig, appConfig } from '@/lib/config/env';

const dbUrl = env.DATABASE_URL;          // string (validated URL)
const port = appConfig.port;             // number (validated, with default)
```

### Grouped Configuration Objects

```typescript
import {
  dbConfig,
  jwtConfig,
  appConfig,
  logConfig,
  emailConfig,
  redisConfig,
  featureFlags,
  rateLimitConfig,
} from '@/lib/config/env';

// Database configuration
console.log(dbConfig.url); // Validated PostgreSQL URL

// JWT configuration
const token = jwt.sign(payload, jwtConfig.secret, {
  expiresIn: jwtConfig.expiresIn,
});

// Feature flags
if (featureFlags.enableMFA) {
  // MFA logic
}

// Rate limiting
const limiter = rateLimit({
  max: rateLimitConfig.max,
  windowMs: rateLimitConfig.windowMs,
});
```

### Environment Helpers

```typescript
import { isProduction, isDevelopment, isTest } from '@/lib/config/env';

if (isDevelopment) {
  console.log('Running in development mode');
}

if (isProduction) {
  // Enable production optimizations
}
```

## Environment Variables

### Required Variables

These must be set or the app won't start:

#### Database
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

#### JWT
```bash
JWT_SECRET=your-secret-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-characters
```

### Optional Variables with Defaults

#### Application
```bash
NODE_ENV=development          # Options: development, test, production
PORT=3000                     # Application port
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### JWT Expiration
```bash
JWT_EXPIRES_IN=15m            # Access token expiration
JWT_REFRESH_EXPIRES_IN=7d     # Refresh token expiration
```

#### Logging
```bash
LOG_LEVEL=info               # Options: trace, debug, info, warn, error, fatal
```

#### Feature Flags
```bash
ENABLE_SIGNUP=true           # Allow new user registration
ENABLE_MFA=true              # Enable multi-factor authentication
ENABLE_SSO=false             # Enable SSO authentication
```

#### Rate Limiting
```bash
RATE_LIMIT_MAX=100           # Max requests per window
RATE_LIMIT_WINDOW=900000     # Window in milliseconds (15 minutes)
```

### Optional Variables (No Defaults)

#### Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@auraos.com
```

#### Redis Caching
```bash
REDIS_URL=redis://localhost:6379
```

#### Error Tracking
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
DATADOG_API_KEY=your-datadog-api-key
```

#### AWS S3 Storage
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=auraos-uploads
```

#### OAuth/SSO
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## Validation Rules

### Database URL
- Must be a valid URL
- Should use PostgreSQL connection string format

### JWT Secrets
- Minimum 32 characters
- Should be cryptographically random

### PORT
- Must be a positive integer
- Default: 3000

### Email
- SMTP_FROM must be a valid email address
- SMTP_PORT must be a positive integer

### Log Level
- Must be one of: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

## Error Messages

### Example: Missing Required Variable

```bash
❌ Invalid environment variables:

  - DATABASE_URL: Required
  - JWT_SECRET: Required

Please check your .env file and ensure all required variables are set.
```

### Example: Invalid Value

```bash
❌ Invalid environment variables:

  - JWT_SECRET: String must contain at least 32 character(s)
  - DATABASE_URL: Invalid url
  - PORT: Expected number, received string

Please check your .env file and ensure all required variables are set.
```

## Generating Secure Secrets

### JWT Secrets

```bash
# Generate 32-byte random secret (base64 encoded)
openssl rand -base64 32

# Generate 64-byte random secret for extra security
openssl rand -base64 64
```

### Example Output
```bash
$ openssl rand -base64 32
fK8vN2mP4qR7sT9uV3wX6yZ1bC5dE8gH

# Use in .env
JWT_SECRET=fK8vN2mP4qR7sT9uV3wX6yZ1bC5dE8gH
```

## Deployment

### Vercel

Vercel automatically injects these variables:

```bash
VERCEL_ENV=production
VERCEL_URL=your-app.vercel.app
VERCEL_GIT_COMMIT_SHA=abc123
```

Set other variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each required variable
3. Set appropriate environment (Production, Preview, Development)

### Docker

Create `.env` file and use with docker-compose:

```yaml
# docker-compose.yml
services:
  web:
    env_file:
      - .env
    environment:
      - NODE_ENV=production
```

Or pass variables explicitly:

```yaml
environment:
  - DATABASE_URL=${DATABASE_URL}
  - JWT_SECRET=${JWT_SECRET}
  - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
```

### Traditional Hosting

Set environment variables through your hosting provider's control panel or CLI.

## Examples

### Complete Development Setup

```bash
# .env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/auraos
JWT_SECRET=dev-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
LOG_LEVEL=debug
ENABLE_SIGNUP=true
ENABLE_MFA=true
ENABLE_SSO=false
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Complete Production Setup

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/auraos
JWT_SECRET=<64-character-random-secret>
JWT_REFRESH_SECRET=<64-character-random-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=https://app.example.com
PORT=3000
LOG_LEVEL=info

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
SMTP_FROM=noreply@example.com

# Redis
REDIS_URL=redis://prod-redis.example.com:6379

# Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx
DATADOG_API_KEY=xxx

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=prod-uploads

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# Feature Flags
ENABLE_SIGNUP=true
ENABLE_MFA=true
ENABLE_SSO=true

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

## Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Different Secrets Per Environment

```bash
# Development
JWT_SECRET=dev-secret

# Production
JWT_SECRET=<cryptographically-random-64-char-string>
```

### 3. Rotate Secrets Regularly

Update JWT secrets periodically (e.g., every 90 days) in production.

### 4. Use Secret Management Services

For production, consider using:
- AWS Secrets Manager
- HashiCorp Vault
- Vercel Environment Variables
- Google Secret Manager

### 5. Document Custom Variables

If you add new environment variables, update:
1. `apps/web/src/lib/config/env.ts` (schema)
2. `apps/web/.env.example` (template)
3. This README (documentation)

## Troubleshooting

### App Won't Start

**Error**: `Invalid environment variables`

**Solution**: Check error message for missing/invalid variables and fix in `.env`

### Type Errors

**Error**: `Property 'MY_VAR' does not exist on type 'Env'`

**Solution**: Add variable to schema in `env.ts`:

```typescript
const envSchema = z.object({
  // ... existing vars
  MY_VAR: z.string().optional(),
});
```

### Default Values Not Working

**Issue**: Variable shows as undefined even with default

**Solution**: Ensure you're using the validated `env` import, not `process.env`:

```typescript
// ❌ Wrong
const port = process.env.PORT; // string | undefined

// ✅ Correct
import { env } from '@/lib/config/env';
const port = env.PORT; // number (with default 3000)
```

## Files

```
apps/web/
├── .env.example                # Template with all variables
├── .env                        # Your local config (gitignored)
└── src/lib/config/
    ├── env.ts                  # Validation schema and exports
    └── README.md               # This file
```

## Adding New Variables

1. **Update Schema** (`env.ts`):
```typescript
const envSchema = z.object({
  // ... existing vars
  NEW_FEATURE_API_KEY: z.string().optional(),
});
```

2. **Add to Template** (`.env.example`):
```bash
# New Feature
# NEW_FEATURE_API_KEY=your-api-key
```

3. **Export Helper** (optional):
```typescript
export const newFeatureConfig = {
  apiKey: env.NEW_FEATURE_API_KEY,
};
```

4. **Use in Code**:
```typescript
import { env } from '@/lib/config/env';

if (env.NEW_FEATURE_API_KEY) {
  // Use the feature
}
```
