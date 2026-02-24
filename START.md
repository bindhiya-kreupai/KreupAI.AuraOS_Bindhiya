# Quick Start - Run from Root

All commands are run from the **root directory** (`KreupAI.AuraOS/`).

## Initial Setup (First Time Only)

```bash
# 1. Verify your environment
pnpm verify

# 2. Update database credentials in .env
# Edit .env and update DATABASE_URL with your PostgreSQL credentials

# 3. Push database schema
cd packages/@aura/database && pnpm prisma db push && cd ../../..

# 4. (Optional) Seed database
cd packages/@aura/database && pnpm db:seed && cd ../../..
```

## Start Development

```bash
# Start all applications and services
pnpm dev

# Or start specific apps/services
pnpm dev --filter=web                 # Web app only
pnpm dev --filter=auth-service        # Auth service only
pnpm dev --filter=employee-service    # Employee service only
```

## Access Applications

Once running, access:

- **Web App**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Employee Service**: http://localhost:3002
- **Notification Service**: http://localhost:3003
- **Document Service**: http://localhost:3004
- **Payroll Service**: http://localhost:3005

## Common Commands

```bash
# Verify setup
pnpm verify

# Development
pnpm dev                              # Start all
pnpm dev --filter=web                 # Start web only

# Build
pnpm build                            # Build all
pnpm build --filter=web               # Build web only

# Testing
pnpm test                             # Run all tests
pnpm lint                             # Lint code
pnpm lint:fix                         # Fix lint issues

# Database
cd packages/@aura/database && pnpm prisma studio    # Open Prisma Studio
cd packages/@aura/database && pnpm prisma db push   # Push schema
cd packages/@aura/database && pnpm db:seed          # Seed data
```

## Troubleshooting

### Dependencies not installed
```bash
NODE_ENV=development pnpm install --force --ignore-scripts
```

### Prisma client not generated
```bash
cd packages/@aura/database && pnpm prisma generate && cd ../../..
```

### Port already in use
```bash
# Kill process on port (e.g., 3000)
npx kill-port 3000
```

### Database connection error
```bash
# Verify DATABASE_URL in .env is correct
# Ensure PostgreSQL is running
# Test connection: psql "your-database-url"
```

## Documentation

- **Complete Setup**: See [SETUP.md](./SETUP.md)
- **API Docs**: See [docs/API-DOCUMENTATION.md](./docs/API-DOCUMENTATION.md)
- **Architecture**: See [docs/BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md)

---

**Ready to develop! Run `pnpm dev` to start.**
