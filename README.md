# KreupAI AuraOS - Enterprise HCM Platform

[![Build Status](https://img.shields.io/github/actions/workflow/status/KreupAI-Technologies/KreupAI.AuraOS/ci.yml?branch=main)](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.1-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

**AuraOS** is a comprehensive, enterprise-grade Human Capital Management (HCM) platform built with modern technologies. It provides end-to-end HR solutions including employee management, payroll, attendance, leave management, performance reviews, and more.

## Key Features

- **47+ HR Modules** - Complete coverage of HR operations
- **444+ API Endpoints** - Comprehensive REST API
- **Multi-Tenant Architecture** - Secure tenant isolation
- **Enterprise Security** - OAuth2, SAML SSO, MFA support
- **Real-time Analytics** - Built-in dashboards and reporting
- **Mobile Support** - React Native mobile application
- **AI Integration** - AI-powered automation and insights

## Technology Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| **Frontend**   | Next.js 14.1, React 18, Tailwind CSS |
| **Mobile**     | React Native, Expo 50                |
| **Backend**    | Node.js, Fastify (microservices)     |
| **Database**   | PostgreSQL with Prisma ORM           |
| **Cache**      | Redis                                |
| **Search**     | Elasticsearch                        |
| **Queue**      | RabbitMQ                             |
| **Monitoring** | Datadog APM, Sentry                  |

## Project Structure

```
KreupAI.AuraOS/
├── apps/                    # Frontend applications
│   ├── web/                 # Next.js web application
│   ├── mobile/              # React Native mobile app
│   └── admin/               # Admin dashboard (planned)
├── packages/@aura/           # Shared libraries
│   ├── database/            # Prisma schemas & client
│   ├── ui/                  # Component library
│   ├── auth/                # Authentication utilities
│   ├── config/              # Shared configuration
│   └── types/               # TypeScript definitions
├── services/                # Backend microservices
│   ├── gateway/             # API Gateway
│   ├── auth-service/        # Authentication service
│   ├── employee-service/    # Employee management
│   ├── payroll-service/     # Payroll processing
│   └── ...                  # 10+ more services
├── infrastructure/          # IaC (Kubernetes, Terraform)
├── docs/                    # Documentation
└── tests/                   # Test suites
```

## Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.15.0
- **PostgreSQL** >= 14
- **Redis** >= 7.0 (optional, for caching)

### Installation

```bash
# Clone the repository
git clone https://github.com/KreupAI-Technologies/KreupAI.AuraOS.git
cd KreupAI.AuraOS

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma db push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3006`.

For detailed setup instructions, see [QUICK-START.md](./QUICK-START.md).

## Documentation

| Document                                                       | Description              |
| -------------------------------------------------------------- | ------------------------ |
| [QUICK-START.md](./QUICK-START.md)                             | Step-by-step setup guide |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                           | Contribution guidelines  |
| [docs/API-DOCUMENTATION.md](./docs/API-DOCUMENTATION.md)       | API reference            |
| [docs/BACKEND_ARCHITECTURE.md](./docs/BACKEND_ARCHITECTURE.md) | Backend architecture     |
| [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)             | Authentication system    |

## Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:web          # Start web app only

# Building
pnpm build            # Build all packages and apps
pnpm build:web        # Build web app only

# Testing
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage
pnpm test:e2e         # Run E2E tests (Playwright)

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm type-check       # Run TypeScript type checking

# Database
pnpm prisma generate  # Generate Prisma client
pnpm prisma db push   # Push schema to database
pnpm prisma studio    # Open Prisma Studio
```

## Core Modules

### HR Operations

- **Core HR** - Employee profiles, organization structure
- **Attendance** - Clock in/out, shift management
- **Leave Management** - Leave policies, approvals, balances
- **Payroll** - Salary processing, tax calculations

### Talent Management

- **Recruitment** - Job postings, applicant tracking
- **Onboarding** - New hire workflows
- **Performance** - Reviews, goals, feedback
- **Learning & Development** - Training management

### Administration

- **User Management** - Role-based access control
- **Audit Logging** - Comprehensive audit trails
- **Analytics** - Dashboards and reports
- **Integrations** - Third-party connectors

## Security

AuraOS implements enterprise-grade security:

- **Authentication**: JWT, OAuth2, SAML SSO
- **Multi-Factor Authentication**: TOTP-based MFA
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 for sensitive data
- **Audit Logging**: Complete audit trails
- **Tenant Isolation**: Data segregation per tenant

## Contributingcd "C:\Users\hp\OneDrive\Documents\kreupAI auraOS\KreupAI.AuraOS"

pnpm install

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/KreupAI-Technologies/KreupAI.AuraOS/issues)
- **Email**: support@kreupai.com

## License

This project is proprietary software. All rights reserved by KreupAI Technologies.

---

Built with care by the **KreupAI Team**
