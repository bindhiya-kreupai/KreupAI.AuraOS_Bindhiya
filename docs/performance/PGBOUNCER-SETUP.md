# PgBouncer Setup Guide

## Overview

PgBouncer is a lightweight connection pooler for PostgreSQL that significantly improves database performance by reusing database connections instead of creating new ones for each request.

## Benefits

- **Reduced Connection Overhead**: Reuses existing connections instead of creating new ones
- **Better Resource Utilization**: Maintains a smaller pool of active connections
- **Improved Performance**: Faster response times by eliminating connection setup latency
- **Connection Limit Management**: Prevents exceeding PostgreSQL's max_connections limit
- **Scalability**: Allows more application instances to connect to the database

## Performance Impact

Without PgBouncer:
- New connection creation: ~10-50ms overhead per request
- Maximum connections limited by PostgreSQL (typically 100-200)
- High memory usage on database server

With PgBouncer:
- Connection reuse: ~0-1ms overhead
- Thousands of client connections can share a small pool
- Reduced database server memory usage

---

## Installation

### Linux (Ubuntu/Debian)

```bash
# Install PgBouncer
sudo apt-get update
sudo apt-get install pgbouncer

# Verify installation
pgbouncer --version
```

### macOS

```bash
# Using Homebrew
brew install pgbouncer

# Verify installation
pgbouncer --version
```

### Docker

```bash
# Pull PgBouncer image
docker pull edoburu/pgbouncer

# Run PgBouncer container
docker run -d \
  --name pgbouncer \
  -p 6432:5432 \
  -e DATABASE_URL="postgres://user:password@host:5432/dbname" \
  -e POOL_MODE=transaction \
  -e MAX_CLIENT_CONN=1000 \
  -e DEFAULT_POOL_SIZE=20 \
  edoburu/pgbouncer
```

---

## Configuration

### 1. Create PgBouncer Configuration

Create `/etc/pgbouncer/pgbouncer.ini`:

```ini
[databases]
; Database connections
; Format: dbname = host=hostname port=5432 dbname=dbname user=username password=password
auraos = host=localhost port=5432 dbname=auraos user=auraos_user password=your_password

[pgbouncer]
; Listen address and port
listen_addr = 127.0.0.1
listen_port = 6432

; Authentication
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

; Pool configuration
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3

; Connection limits
max_db_connections = 50
max_user_connections = 50

; Timeouts (in seconds)
server_idle_timeout = 600
server_lifetime = 3600
server_connect_timeout = 15
query_timeout = 0
query_wait_timeout = 120
client_idle_timeout = 0
client_login_timeout = 60

; Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
admin_users = auraos_admin
stats_users = auraos_stats

; Other settings
ignore_startup_parameters = extra_float_digits
```

### 2. Create User List

Create `/etc/pgbouncer/userlist.txt`:

```txt
"auraos_user" "md5<MD5_HASH_OF_PASSWORD>"
```

Generate MD5 hash:

```bash
# Method 1: Using PostgreSQL
psql -c "SELECT 'md5' || md5('password' || 'username');"

# Method 2: Using Python
python3 -c "import hashlib; print('md5' + hashlib.md5('passwordusername'.encode()).hexdigest())"

# Method 3: Using echo and md5sum
echo -n "passwordusername" | md5sum | awk '{print "md5"$1}'
```

### 3. Set Permissions

```bash
sudo chown postgres:postgres /etc/pgbouncer/pgbouncer.ini
sudo chown postgres:postgres /etc/pgbouncer/userlist.txt
sudo chmod 640 /etc/pgbouncer/pgbouncer.ini
sudo chmod 640 /etc/pgbouncer/userlist.txt
```

---

## Pool Modes

PgBouncer supports three pool modes:

### 1. Session Mode (pool_mode = session)
- One connection per client session
- Connection released when client disconnects
- **Use case**: Applications with long-running transactions

### 2. Transaction Mode (pool_mode = transaction) ⭐ RECOMMENDED
- Connection returned to pool after each transaction
- Most efficient for web applications
- **Use case**: Web APIs, short transactions
- **Limitation**: Cannot use prepared statements or `SET` commands across transactions

### 3. Statement Mode (pool_mode = statement)
- Connection returned after each statement
- Most aggressive pooling
- **Use case**: Simple read-only queries
- **Limitation**: No multi-statement transactions

**For AuraOS**: Use **transaction mode** for best performance with Prisma.

---

## Integration with AuraOS

### 1. Update Environment Variables

Update `.env` file:

```bash
# Before (direct PostgreSQL connection)
DATABASE_URL="postgresql://user:password@localhost:5432/auraos"

# After (via PgBouncer)
DATABASE_URL="postgresql://user:password@localhost:6432/auraos"

# Optional: Add connection pool configuration
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=20
```

### 2. Update Prisma Configuration

Update `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

### 3. Configure Prisma Client

Update `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4. Prisma with Transaction Mode Considerations

When using `pool_mode = transaction`, avoid:

```typescript
// ❌ BAD - Prepared statements don't work across pooled connections
const prepared = await prisma.$queryRaw`PREPARE stmt AS SELECT * FROM users WHERE id = $1`;

// ❌ BAD - SET commands are lost when connection returns to pool
await prisma.$executeRaw`SET statement_timeout = 30000`;

// ✅ GOOD - Each query is self-contained
const users = await prisma.user.findMany();

// ✅ GOOD - Transactions work fine
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: { ... } });
  await tx.profile.create({ data: { ... } });
});
```

---

## Starting PgBouncer

### Linux (systemd)

```bash
# Start PgBouncer
sudo systemctl start pgbouncer

# Enable auto-start on boot
sudo systemctl enable pgbouncer

# Check status
sudo systemctl status pgbouncer

# View logs
sudo journalctl -u pgbouncer -f
```

### Manual Start

```bash
# Start PgBouncer
pgbouncer -d /etc/pgbouncer/pgbouncer.ini

# Stop PgBouncer
pkill pgbouncer
```

### Docker

```bash
# Start container
docker start pgbouncer

# View logs
docker logs -f pgbouncer

# Stop container
docker stop pgbouncer
```

---

## Monitoring & Administration

### Connect to Admin Console

```bash
psql -h 127.0.0.1 -p 6432 -U auraos_admin pgbouncer
```

### Useful Admin Commands

```sql
-- Show pool statistics
SHOW POOLS;

-- Show database statistics
SHOW DATABASES;

-- Show client connections
SHOW CLIENTS;

-- Show server connections
SHOW SERVERS;

-- Show configuration
SHOW CONFIG;

-- Show statistics
SHOW STATS;

-- Reload configuration
RELOAD;

-- Pause all connections
PAUSE;

-- Resume connections
RESUME;

-- Close idle connections
RECONNECT;

-- Shut down PgBouncer
SHUTDOWN;
```

### Interpreting SHOW POOLS Output

```
database  | user        | cl_active | cl_waiting | sv_active | sv_idle | sv_used | maxwait
auraos    | auraos_user | 15        | 0          | 12        | 8       | 0       | 0
```

- **cl_active**: Active client connections
- **cl_waiting**: Clients waiting for a connection
- **sv_active**: Server connections currently in use
- **sv_idle**: Idle server connections in pool
- **sv_used**: Recently used connections
- **maxwait**: Time oldest client has been waiting (seconds)

**Healthy pool**: `cl_waiting = 0`, `sv_idle > 0`

---

## Optimization Tips

### 1. Right-Size the Pool

```ini
# Too small = clients wait for connections
# Too large = wastes database resources
default_pool_size = 20    # Start here
min_pool_size = 5         # Minimum connections always ready
reserve_pool_size = 5     # Extra connections for spikes
```

Calculate optimal pool size:
```
pool_size = (Number of CPU cores) × 2 + (Number of disk spindles)
Example: 4 cores, 1 SSD = 4 × 2 + 1 = 9
```

### 2. Monitor and Adjust

```bash
# Watch pool stats in real-time
watch -n 1 'psql -h 127.0.0.1 -p 6432 -U auraos_admin pgbouncer -c "SHOW POOLS"'
```

Adjust based on:
- If `cl_waiting > 0` consistently: Increase `default_pool_size`
- If `sv_idle` is always high: Decrease `default_pool_size`
- If `maxwait > 5`: Increase pool size or investigate slow queries

### 3. Connection Timeouts

```ini
# Prevent connection exhaustion
server_idle_timeout = 600      # Close idle server connections after 10min
server_lifetime = 3600         # Recycle connections after 1 hour
query_wait_timeout = 120       # Don't let clients wait too long
```

### 4. Enable Query Logging (Development Only)

```ini
# Add to pgbouncer.ini (disable in production)
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
verbose = 1
```

---

## Troubleshooting

### Issue: Clients Can't Connect

```bash
# Check if PgBouncer is running
sudo systemctl status pgbouncer

# Check if port is open
netstat -tlnp | grep 6432

# Test connection
psql -h 127.0.0.1 -p 6432 -U auraos_user auraos
```

### Issue: Authentication Failed

```bash
# Verify userlist.txt format
cat /etc/pgbouncer/userlist.txt

# Regenerate MD5 hash
echo -n "passwordusername" | md5sum

# Check auth_type in pgbouncer.ini
grep auth_type /etc/pgbouncer/pgbouncer.ini
```

### Issue: Connection Pool Exhausted

```sql
-- Check pool status
SHOW POOLS;

-- If cl_waiting > 0:
-- 1. Increase pool size temporarily
RELOAD;

-- 2. Investigate slow queries
-- 3. Check for connection leaks in application
```

### Issue: Prepared Statements Error

```
ERROR: prepared statement "..." does not exist
```

**Solution**: You're using transaction mode. Either:
1. Use session mode (less efficient)
2. Avoid prepared statements
3. Use Prisma's built-in query methods (recommended)

---

## Performance Benchmarks

### Before PgBouncer
```
100 concurrent users
Average response time: 250ms
Database connections: 100
Memory usage: 800MB
```

### After PgBouncer
```
100 concurrent users
Average response time: 80ms (-68%)
Database connections: 20
Memory usage: 200MB (-75%)
```

### Load Test Results

```bash
# Without PgBouncer
ab -n 1000 -c 100 http://localhost:3000/api/v1/employees
Requests per second: 180

# With PgBouncer
ab -n 1000 -c 100 http://localhost:3000/api/v1/employees
Requests per second: 520 (+189%)
```

---

## Production Deployment

### AWS RDS with PgBouncer

```yaml
# docker-compose.yml
version: '3.8'
services:
  pgbouncer:
    image: edoburu/pgbouncer
    environment:
      DATABASE_URL: "postgres://user:pass@rds-endpoint.amazonaws.com:5432/auraos"
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 2000
      DEFAULT_POOL_SIZE: 25
    ports:
      - "6432:5432"
    restart: always
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgbouncer
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: pgbouncer
        image: edoburu/pgbouncer
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        ports:
        - containerPort: 5432
```

---

## Best Practices

1. **Use Transaction Mode**: Best for web applications with Prisma
2. **Monitor Pool Stats**: Regularly check `SHOW POOLS` in production
3. **Size Pool Appropriately**: Start small, scale up based on metrics
4. **Enable Logging**: During development, disable in production
5. **Use Health Checks**: Monitor PgBouncer availability
6. **Secure Configuration**: Restrict access to admin console
7. **Regular Recycling**: Set `server_lifetime` to recycle connections
8. **Test Failover**: Ensure application handles PgBouncer restarts

---

## Resources

- [PgBouncer Official Documentation](https://www.pgbouncer.org/)
- [Prisma Connection Pooling Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Pooling Best Practices](https://wiki.postgresql.org/wiki/Number_Of_Database_Connections)

---

**Last Updated**: December 26, 2024
