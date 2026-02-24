# Multi-stage build for Auth Service
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/@aura/database/package.json ./packages/@aura/database/
COPY services/auth-service/package.json ./services/auth-service/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @auraos/auth-service...

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/services ./services

# Copy source code and config
COPY packages/@aura/database ./packages/@aura/database
COPY services/auth-service ./services/auth-service
COPY tsconfig.base.json tsconfig.json ./

# Generate Prisma client
RUN pnpm --filter @aura/database prisma generate

# Build the service
RUN pnpm --filter @auraos/auth-service build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl curl
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 authservice

ENV NODE_ENV=production

# Copy built files and dependencies
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/package.json ./services/auth-service/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/@aura/database/package.json ./packages/@aura/database/

WORKDIR /app/services/auth-service

USER authservice

EXPOSE 3001 50051

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
