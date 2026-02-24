# AuraOS Setup Guide

This guide will help you set up and run the AuraOS HCM platform from the root directory.

## Prerequisites

- **Node.js** >= 20.0.0 (Installed: v20.19.5)
- **pnpm** >= 8.15.0 (Installed: v8.15.0)
- **PostgreSQL** >= 14
- **Redis** >= 7.0 (optional, for caching)
- **RabbitMQ** >= 3.12 (optional, for message queues)
- **Elasticsearch** >= 8.0 (optional, for search)

## Quick Start

The project is now configured and ready to run from the root directory.

### 1. Environment Configuration

A `.env` file has been created from `.env.example`. Update the following key variables:

```bash
# Required: Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require&schema=schema_name"

# Required: JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional but recommended for full functionality
REDIS_URL="redis://localhost:6379"
RABBITMQ_HOST="localhost"
ELASTICSEARCH_NODE="http://localhost:9200"
```

### 2. Database Setup

```bash
# Generate Prisma client (already done)
cd packages/@aura/database && pnpm prisma generate && cd ../../..

# Push schema to database
cd packages/@aura/database && pnpm prisma db push && cd ../../..

# Optional: Seed the database
cd packages/@aura/database && pnpm db:seed && cd ../../..

# Optional: Open Prisma Studio to view data
cd packages/@aura/database && pnpm prisma studio
```

### 3. Running the Application

All commands can be run from the **root directory**:

```bash
# Start all applications in development mode
pnpm dev

# Start only the web application
pnpm dev --filter=web

# Start specific services
pnpm dev --filter=auth-service
pnpm dev --filter=employee-service
```

The application will be available at:
- **Web App**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Employee Service**: http://localhost:3002
- **Notification Service**: http://localhost:3003
- **Document Service**: http://localhost:3004
- **Payroll Service**: http://localhost:3005

### 4. Building for Production

```bash
# Build all packages and apps
pnpm build

# Build specific app
pnpm build --filter=web
```

### 5. Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Project Structure

```
KreupAI.AuraOS/
├── apps/                    # Frontend applications
│   ├── web/                 # Next.js web application (Port 3000)
│   ├── mobile/              # React Native mobile app
│   └── admin/               # Admin dashboard
├── packages/@aura/          # Shared libraries
│   ├── database/            # Prisma schemas & client
│   ├── ui/                  # Component library
│   ├── auth/                # Authentication utilities
│   ├── config/              # Shared configuration
│   ├── types/               # TypeScript definitions
│   ├── events/              # Event bus
│   ├── messaging/           # RabbitMQ wrapper
│   ├── monitoring/          # APM & logging
│   └── search/              # Elasticsearch wrapper
├── services/                # Backend microservices
│   ├── auth-service/        # Authentication service (Port 3001)
│   ├── employee-service/    # Employee management (Port 3002)
│   ├── notification-service/# Notifications (Port 3003)
│   ├── document-service/    # Document management (Port 3004)
│   └── payroll-service/     # Payroll processing (Port 3005)
├── .env                     # Environment variables (configured)
├── .env.example             # Environment template
├── package.json             # Root package configuration
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── turbo.json               # Turborepo configuration
└── SETUP.md                 # This file
```

## Available Scripts (from root)

### Development
- `pnpm dev` - Start all apps in development mode
- `pnpm dev --filter=web` - Start only web app
- `pnpm dev --filter=auth-service` - Start only auth service

### Building
- `pnpm build` - Build all packages and apps
- `pnpm build --filter=web` - Build only web app

### Testing
- `pnpm test` - Run all tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues

### Database
- `cd packages/@aura/database && pnpm prisma generate` - Generate Prisma client
- `cd packages/@aura/database && pnpm prisma db push` - Push schema to database
- `cd packages/@aura/database && pnpm prisma studio` - Open Prisma Studio
- `cd packages/@aura/database && pnpm db:seed` - Seed database

## Common Issues

### 1. NODE_ENV is set to production

If you encounter issues during installation, ensure NODE_ENV is not set to production:

```bash
# Unset NODE_ENV
unset NODE_ENV

# Or install with explicit NODE_ENV
NODE_ENV=development pnpm install --force --ignore-scripts
```

### 2. Husky prepare script fails

The project uses `--ignore-scripts` flag during installation to avoid husky issues on Windows:

```bash
pnpm install --ignore-scripts --force
```

### 3. Database connection issues

Make sure PostgreSQL is running and the DATABASE_URL in `.env` is correct:

```bash
# Test connection
psql "postgresql://user:password@host:port/database"
```

### 4. Port already in use

If a port is already in use, you can:
- Stop the process using that port
- Change the PORT in the service's `.env` file
- Use `npx kill-port <port>` to kill the process

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | Access token expiration | No | 24h |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | No | 7d |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Application port | No | 3006 |
| `REDIS_URL` | Redis connection string | No | redis://localhost:6379 |
| `RABBITMQ_HOST` | RabbitMQ host | No | localhost |
| `ELASTICSEARCH_NODE` | Elasticsearch URL | No | http://localhost:9200 |

## Next Steps

1. **Configure Database**: Update `DATABASE_URL` in `.env` with your PostgreSQL credentials
2. **Run Migrations**: Execute `cd packages/@aura/database && pnpm prisma db push`
3. **Seed Data**: Run `cd packages/@aura/database && pnpm db:seed` (optional)
4. **Start Development**: Run `pnpm dev` from the root directory
5. **Access Application**: Open http://localhost:3000 in your browser

## Documentation

- [Quick Start Guide](./QUICK-START.md)
- [API Documentation](./docs/API-DOCUMENTATION.md)
- [Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)
- [Authentication Guide](./docs/AUTHENTICATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

## Support

For issues or questions:
- GitHub Issues: https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues
- Email: support@kreupai.com
- Documentation: [./docs/](./docs/)

---

**Ready to build enterprise HCM solutions with AuraOS!**
