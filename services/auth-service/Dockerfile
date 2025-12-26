# Multi-stage build for Auth Service

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY packages/@aura/database/package.json ./packages/@aura/database/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy source code
COPY services/auth-service ./services/auth-service
COPY prisma ./prisma
COPY tsconfig.base.json ./

# Generate Prisma client
RUN cd packages/@aura/database && pnpm prisma generate

# Build the service
WORKDIR /app/services/auth-service
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 authservice

# Install production dependencies only
RUN npm install -g pnpm

COPY --from=builder /app/services/auth-service/package.json ./
COPY --from=builder /app/services/auth-service/node_modules ./node_modules
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/packages/@aura/database/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER authservice

# Expose ports
EXPOSE 3001 50051

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start the service
CMD ["node", "dist/index.js"]
