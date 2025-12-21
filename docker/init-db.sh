#!/bin/bash
set -e

# Initialize AuraOS database
echo "Initializing AuraOS database..."

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable required extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Set timezone
    SET timezone = 'UTC';

    -- Log initialization
    SELECT 'AuraOS database initialized successfully' AS message;
EOSQL

echo "Database initialization complete!"
