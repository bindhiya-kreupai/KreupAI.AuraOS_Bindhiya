#!/bin/sh
set -e

echo "🚀 Starting AuraOS..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
timeout=60
elapsed=0
until node -e "require('@aura/database').prisma.\$connect().then(() => process.exit(0)).catch(() => process.exit(1))" 2>/dev/null || [ $elapsed -ge $timeout ]; do
  echo "  Database not ready, waiting... ($elapsed/$timeout seconds)"
  sleep 2
  elapsed=$((elapsed + 2))
done

if [ $elapsed -ge $timeout ]; then
  echo "❌ Database connection timeout after ${timeout} seconds"
  exit 1
fi

echo "✅ Database is ready"

# Run database migrations
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "📦 Running database migrations..."
  cd /app/packages/@aura/database
  pnpm prisma migrate deploy
  cd /app
  echo "✅ Migrations completed"
fi

# Seed database (only if flag is set)
if [ "${SEED_DATABASE}" = "true" ]; then
  echo "🌱 Seeding database..."
  cd /app/packages/@aura/database
  pnpm prisma db seed
  cd /app
  echo "✅ Database seeded"
fi

# Start the application
echo "🎯 Starting Next.js application..."
cd /app/apps/web
exec node node_modules/.bin/next start -p ${PORT:-3000}
