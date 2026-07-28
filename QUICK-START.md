# Quick Start Guide

This guide will help you set up the KreupAI AuraOS development environment from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool           | Version   | Installation                                           |
| -------------- | --------- | ------------------------------------------------------ |
| **Node.js**    | >= 20.0.0 | [nodejs.org](https://nodejs.org/)                      |
| **pnpm**       | >= 8.15.0 | `npm install -g pnpm`                                  |
| **PostgreSQL** | >= 14     | [postgresql.org](https://www.postgresql.org/download/) |
| **Git**        | Latest    | [git-scm.com](https://git-scm.com/)                    |

### Optional (for full functionality)

| Tool                     | Purpose                      |
| ------------------------ | ---------------------------- |
| **Redis** >= 7.0         | Caching layer                |
| **RabbitMQ** >= 3.12     | Message queue                |
| **Elasticsearch** >= 8.0 | Search functionality         |
| **Docker**               | Containerized infrastructure |

## Step 1: Clone the Repository

```bash
git clone https://github.com/KreupAI-Technologies/KreupAI.AuraOS.git
cd KreupAI.AuraOS
```

## Step 2: Install Dependencies

```bash
# Install all dependencies using pnpm
pnpm install
```

This will install dependencies for all packages and applications in the monorepo.

## Step 3: Environment Configuration

### 3.1 Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### 3.2 Configure Required Variables

Edit the `.env` file and set the following required variables:

```env
# Database (Required)
DATABASE_URL="postgresql://username:password@localhost:5432/auraos?schema=public"

# Authentication (Required)
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3.3 Optional Configuration

For additional features, configure these optional variables:

```env
# Redis (Caching)
REDIS_URL="redis://:auraos_redis_2024@localhost:6379"

# RabbitMQ (Message Queue)
RABBITMQ_HOST="localhost"
RABBITMQ_PORT="5672"
RABBITMQ_USER="guest"
RABBITMQ_PASSWORD="guest"

# Elasticsearch (Search)
ELASTICSEARCH_NODE="http://localhost:9200"
```

## Step 4: Database Setup

### 4.1 Create Database

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE auraos;"
```

### 4.2 Generate Prisma Client

```bash
pnpm prisma generate
```

### 4.3 Push Schema to Database

```bash
pnpm prisma db push
```

### 4.4 (Optional) Seed Database

```bash
pnpm prisma db seed
```

## Step 5: Start Development Server

```bash
# Start all applications
pnpm dev
```

Or start specific applications:

```bash
# Web application only
pnpm dev:web

# Start on a specific port
PORT=3000 pnpm dev:web
```

## Step 6: Verify Installation

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the AuraOS login page
3. Check the console for any errors

## Common Commands

### Development

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
```

### Database

```bash
pnpm prisma generate  # Generate Prisma client
pnpm prisma db push   # Push schema changes
pnpm prisma studio    # Open database GUI
pnpm prisma migrate   # Run migrations
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run with coverage report
pnpm test:e2e         # Run E2E tests
```

### Code Quality

```bash
pnpm lint             # Check for linting errors
pnpm lint:fix         # Auto-fix linting issues
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier
```

## Using Docker (Alternative Setup)

If you prefer using Docker for infrastructure:

```bash
# Start infrastructure services
docker-compose -f docker-compose.infrastructure.yml up -d

# This starts:
# - PostgreSQL on port 5432
# - Redis on port 6379
# - RabbitMQ on ports 5672, 15672
# - Elasticsearch on port 9200
```

Update your `.env` to use Docker services:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auraos?schema=public"
REDIS_URL="redis://:auraos_redis_2024@localhost:6379"
```

## Project Structure Overview

```
KreupAI.AuraOS/
├── apps/
│   └── web/                 # Main web application
│       ├── src/
│       │   ├── app/         # Next.js App Router
│       │   ├── components/  # React components
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Utility libraries
│       │   ├── services/    # API services
│       │   └── stores/      # State management
│       └── package.json
├── packages/@aura/
│   ├── database/            # Prisma schema & client
│   ├── ui/                  # Shared UI components
│   ├── auth/                # Authentication utilities
│   ├── config/              # Shared configuration
│   └── types/               # TypeScript types
├── services/                # Backend microservices
├── docs/                    # Documentation
└── package.json             # Root package.json
```

## Troubleshooting

### Issue: "Cannot find module '@aura/database'"

```bash
# Rebuild all packages
pnpm prisma generate
pnpm build
```

### Issue: Database connection errors

1. Verify PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in `.env`
3. Ensure database exists: `psql -U postgres -c "\l"`

### Issue: Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

### Issue: Prisma schema errors

```bash
# Validate schema
pnpm prisma validate

# Format schema
pnpm prisma format

# Reset database (CAUTION: deletes all data)
pnpm prisma db push --force-reset
```

### Issue: Node.js version mismatch

```bash
# Check Node version
node -v

# Use nvm to switch versions
nvm use 20
```

## Next Steps

1. **Explore the API**: Check `http://localhost:3000/api/docs` for API documentation
2. **Read Architecture Docs**: See [docs/BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md)
3. **Configure Authentication**: See [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)
4. **Set Up Testing**: See [docs/testing/TESTING-STANDARDS.md](./docs/testing/TESTING-STANDARDS.md)

## Getting Help

- **Documentation**: Browse the `docs/` folder
- **Issues**: Open a GitHub issue
- **Team**: Reach out to the development team

---

Happy coding!
