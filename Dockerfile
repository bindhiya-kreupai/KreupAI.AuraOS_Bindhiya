# AuraOS Production Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-alpine AS deps
LABEL stage=deps

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/@aura/database/package.json ./packages/@aura/database/
COPY packages/@aura/ui/package.json ./packages/@aura/ui/
COPY packages/@aura/config/package.json ./packages/@aura/config/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Builder
FROM node:20-alpine AS builder
LABEL stage=builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/@aura/database/node_modules ./packages/@aura/database/node_modules
COPY --from=deps /app/packages/@aura/ui/node_modules ./packages/@aura/ui/node_modules
COPY --from=deps /app/packages/@aura/config/node_modules ./packages/@aura/config/node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm --filter @aura/database prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the Next.js application
RUN pnpm --filter web build

# Stage 3: Runner
FROM node:20-alpine AS runner
LABEL stage=runner

RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install pnpm (for production dependencies)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy necessary files from builder
COPY --from=builder /app/apps/web/next.config.mjs ./apps/web/
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Copy Prisma schema and generated client
COPY --from=builder /app/packages/@aura/database/prisma ./packages/@aura/database/prisma
COPY --from=builder /app/packages/@aura/database/package.json ./packages/@aura/database/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy other workspace packages
COPY --from=builder /app/packages/@aura/ui/package.json ./packages/@aura/ui/
COPY --from=builder /app/packages/@aura/config/package.json ./packages/@aura/config/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy startup script
COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh && chown nextjs:nodejs /app/start.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["/app/start.sh"]
