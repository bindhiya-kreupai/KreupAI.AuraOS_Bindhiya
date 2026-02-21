# AuraOS — AI Coding Agent Instructions

## Architecture Overview

AuraOS is an enterprise HCM (Human Capital Management) platform built as a **pnpm + Turborepo monorepo** with three workspace groups: `apps/*`, `packages/@aura/*`, and `services/*`.

- **`apps/web`** — Next.js 14 App Router frontend (primary app, port 3006). Route groups: `(modules)/` for 47+ HR modules, `(marketing)/` for public pages, `api/` for 65+ REST API route groups.
- **`services/*`** — 10 standalone **Fastify v4** microservices (auth, employee, payroll, scheduling, etc.) each with `src/{routes,services,middleware,lib,dto}/` structure.
- **`packages/@aura/*`** — 11 shared packages (`database`, `ui`, `types`, `auth`, `config`, `events`, `messaging`, `monitoring`, `search`, `i18n`, `utils`) consumed via `workspace:*`.
- **`apps/mobile`** — React Native / Expo mobile app.

**Data flows:** Client → Next.js App Router → API routes (`createProtectedRoute` wrapper) → Service layer (`apps/web/src/lib/services/`) → Prisma ORM → PostgreSQL. Microservices communicate via RabbitMQ and gRPC. Redis for caching and rate limiting.

## Critical Conventions

### Zero Enumeration Policy
Never hardcode enums. All configurable values come from the database via `ConfigService`:
```typescript
// ❌ WRONG: enum LeaveType { SICK, CASUAL }
// ✅ RIGHT: const leaveTypes = await ConfigService.getConfigItems('LEAVE_TYPES', tenantId);
```

### Multi-Tenant Isolation
Every database query MUST be scoped by `tenantId` from the authenticated user context. Never query without tenant filtering.

### API Route Pattern
Use `createProtectedRoute` from `@/lib/api/route-wrapper` for all new API routes:
```typescript
import { createProtectedRoute } from '@/lib/api/route-wrapper';
export const GET = createProtectedRoute(handler, {
  requiredPermissions: ['employees:read'],
  rateLimit: 'API_USER',
  querySchema: zodSchema, // Zod validation
});
```
Permission format: `resource:action` (e.g., `users:read`, `payroll:write`). `SUPER_ADMIN` role bypasses checks.

### Service Layer
Services live in `apps/web/src/lib/services/`. Extend `BaseService` (`base-service.ts`) for Prisma access, audit logging, transactions, and pagination helpers. Return typed `ServiceResult<T>` responses.

### Bilingual Error Messages
API errors include both English and Arabic: `{ message: "...", messageAr: "..." }`.

### Two API Auth Wrappers
The codebase has two API route wrappers — use the one that matches surrounding code:

| Wrapper | Location | Usage |
|---------|----------|-------|
| `withEnhancedAuth` | `@/lib/auth` | **Dominant** (~200+ routes). Lightweight — injects `{ user, permissions, tenantId }` but no built-in validation or rate limiting. |
| `createProtectedRoute` | `@/lib/api/route-wrapper` | **Newer/preferred** (~24 routes). Batteries-included — adds Zod validation, rate limiting presets, standardized `ApiResponse` wrapping. |

For **new** routes, prefer `createProtectedRoute`. When editing **existing** routes using `withEnhancedAuth`, keep the same wrapper for consistency unless migrating the whole file.

## Tech Stack & Patterns

| Concern | Implementation |
|---------|---------------|
| **Validation** | Zod schemas (API routes + services) |
| **Database** | Single Prisma schema at `packages/@aura/database/prisma/schema.prisma` (~5800 lines). UUID PKs, `createdAt`/`updatedAt` audit fields on all models. |
| **Auth** | JWT with refresh tokens, MFA via `otplib`, OAuth2/SAML SSO |
| **UI Components** | `@aura/ui` package (Radix UI + CVA + Tailwind Merge + Lucide icons) |
| **Styling** | Tailwind CSS with custom "Aurora" theme — named colors (`celestial-indigo`, `quantum-rose`, etc.) + CSS variable tokens |
| **Logging** | Pino (structured JSON) everywhere — both Next.js and Fastify services |
| **Monitoring** | Datadog APM (`dd-trace`) + Sentry for error tracking |
| **State (client)** | Zustand stores in `apps/web/src/stores/` |

## Developer Workflows

```bash
pnpm install            # Install all workspace dependencies
pnpm dev                # Start all apps/services concurrently (Turborepo)
pnpm build              # Build all packages (topological order via turbo)
pnpm lint               # Lint all workspaces
pnpm test               # Run all tests (vitest for web, jest for auth-service)
pnpm format             # Prettier format
```

**Database commands** (run from `packages/@aura/database`):
```bash
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to DB
pnpm db:migrate:dev     # Create migration
pnpm db:studio          # Open Prisma Studio
pnpm db:seed            # Seed data
```

**Docker** (via Makefile): `make dev` (full dev stack), `make up`, `make down`, `make db-migrate`.

### Testing
- **Unit/Integration:** Vitest (`apps/web`) — 70% coverage threshold. Run: `pnpm test` in workspace.
- **E2E:** Playwright — `apps/web/playwright.config.ts`. Cross-browser (Chrome, Firefox, Safari).
- **Contract:** Pact — `pact-config.json` + `docker-compose.pact.yml`.
- Auth-service uses **Jest** (`ts-jest`), employee-service uses **Vitest**.

### Commit Convention
Conventional Commits: `<type>(<scope>): <description>`
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`. Scopes: module names (`leave`, `payroll`, `employee`, `api`).
Branch naming: `feature/`, `fix/`, `hotfix/`, `refactor/`, `docs/` prefixes.

## Key Directories

| Path | Purpose |
|------|---------|
| `apps/web/src/app/api/` | Next.js API routes (65+ groups) |
| `apps/web/src/app/(modules)/` | HR module pages (47+ modules) |
| `apps/web/src/lib/services/` | Business logic service layer (50+ services) |
| `apps/web/src/lib/api/route-wrapper.ts` | `createProtectedRoute` — canonical API wrapper |
| `apps/web/src/lib/services/base-service.ts` | `BaseService` abstract class |
| `apps/web/src/lib/middleware/` | Rate limiting, auth, CSRF, caching, audit |
| `apps/web/src/components/` | Components organized by feature domain |
| `apps/web/src/hooks/` | 20+ custom React hooks |
| `packages/@aura/database/prisma/schema.prisma` | Single source of truth for data model |
| `packages/@aura/ui/` | Shared component library |
| `services/*/src/` | Fastify microservice source (`routes/`, `services/`, `middleware/`) |
| `docs/aura-architecture.md` | Canonical architecture & configuration guidelines |

## Creating a New Fastify Microservice

Follow the `services/auth-service/` structure (the most mature service):

```
services/my-service/src/
├── index.ts       # Datadog APM init → createServer() → server.listen() → graceful shutdown
├── server.ts      # Fastify factory: helmet, cors, rate-limit (Redis), routes, error handler
├── config/        # Environment-based configuration
├── routes/        # Route handlers (prefix: /api/v1/my-service)
├── services/      # Business logic
├── dto/           # Zod schemas for request/response validation
├── middleware/     # Fastify hooks (auth, tenant extraction)
├── lib/           # Prisma client, Redis client singletons
└── utils/         # Logger (Pino), helpers
```

**Bootstrap pattern** in `index.ts`: init Datadog conditionally → call `createServer()` → `server.listen({ port, host })` → register `SIGINT`/`SIGTERM` for graceful shutdown (disconnect Prisma + Redis). Always register `uncaughtException`/`unhandledRejection` handlers. Routes use prefix `/api/v1/<service-name>`.

## Industry Verticals

Industry-specific API routes live under `apps/web/src/app/api/industry/` with a consistent structure:

```
api/industry/
├── [type]/          # Dynamic catch-all for cross-cutting operations
├── aviation/        # pilot-training/, cabin-crew/, ground-operations/
├── healthcare/      # credentialing/, nurse-rostering/, locum/
├── manufacturing/   # production/, equipment/, maintenance/, safety/
└── retail/          # stores/, commissions/, seasonal-hiring/
```

Each vertical has an `alerts/` subdirectory and a `compliance/` subdirectory. When adding a new vertical, follow this pattern and add corresponding services in `apps/web/src/lib/services/industry/`.

## Testing Patterns

### Test Setup (`apps/web/src/__tests__/setup.ts`)
- Globally mocks `@aura/database` via `vi.mock` — stubs all Prisma model methods (`findMany`, `findUnique`, `create`, `update`, `delete`, `count`, `aggregate`, `upsert`, `findFirst`) for every model.
- Mocks `$transaction` with a callback pattern.
- Sets `NODE_ENV=test`, provides test `JWT_SECRET` and `DATABASE_URL`.

### Test Helpers (`apps/web/src/__tests__/helpers/`)
| Helper | Purpose |
|--------|---------|
| `test-data.ts` | Factory functions: `createTestUser()`, `createTestTenant()` — uses real Prisma for integration tests |
| `api-test-utils.ts` | `createTestRequest()` (builds `NextRequest`), `generateTestToken()` (JWT), assertion helpers for status codes and error shapes |
| `test-db.ts` | `setupTestDatabase()` / `teardownTestDatabase()` — creates separate `PrismaClient` pointing to `auraos_test` DB |

### Running Tests
```bash
cd apps/web && pnpm test              # Unit tests (Vitest)
cd apps/web && pnpm test -- --coverage # With coverage (70% threshold)
cd apps/web && pnpm playwright test    # E2E tests
cd services/auth-service && pnpm test  # Jest for auth-service
```

### Prisma Client Singleton (`packages/@aura/database/src/client.ts`)
Uses `globalThis` to survive Next.js hot reloads. Includes slow-query middleware (warns at >100ms) and Prisma event listeners for errors/warnings. Re-exports all `@prisma/client` types. Always import from `@aura/database`, never directly from `@prisma/client`.
