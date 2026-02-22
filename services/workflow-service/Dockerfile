# Multi-stage build for Workflow Service
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/workflow-service/package.json ./services/workflow-service/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @auraos/workflow-service...

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services ./services

# Copy source code and config
COPY services/workflow-service ./services/workflow-service
COPY tsconfig.base.json tsconfig.json ./

# Build the service
RUN pnpm --filter @auraos/workflow-service build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl curl
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workflowservice

ENV NODE_ENV=production

# Copy built files and dependencies
COPY --from=builder /app/services/workflow-service/dist ./services/workflow-service/dist
COPY --from=builder /app/services/workflow-service/package.json ./services/workflow-service/
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/services/workflow-service

USER workflowservice

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3010/health || exit 1

CMD ["node", "dist/index.js"]
