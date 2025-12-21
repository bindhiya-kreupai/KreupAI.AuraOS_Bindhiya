# Redis Caching Documentation

## Overview

Redis caching is integrated into AuraOS to significantly improve application performance by reducing database queries and API response times. The caching layer provides:

- **Automatic fallback**: If Redis is unavailable, the app falls back to database queries
- **Type-safe operations**: Full TypeScript support
- **Intelligent invalidation**: Automatic cache invalidation on data updates
- **Key namespacing**: Organized cache keys by entity type
- **Connection resilience**: Automatic reconnection and error handling

## Benefits

- **Performance**: 10-100x faster than database queries
- **Scalability**: Reduces database load, allowing more concurrent users
- **Cost Reduction**: Fewer database queries = lower infrastructure costs
- **User Experience**: Faster page loads and API responses

## Setup

### 1. Install Redis

#### Local Development (macOS)
```bash
# Using Homebrew
brew install redis

# Start Redis
brew services start redis

# Or run manually
redis-server
```

#### Local Development (Linux)
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# CentOS/RHEL
sudo yum install redis
sudo systemctl start redis
```

#### Local Development (Docker)
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 2. Configure Environment

Add to your `.env` file:

```bash
# Redis connection URL
REDIS_URL=redis://localhost:6379

# Enable/disable Redis caching
REDIS_ENABLED=true
```

### 3. Verify Connection

Check if Redis is running:

```bash
# Test connection
redis-cli ping
# Should return: PONG

# View all keys
redis-cli keys "*"

# Monitor commands in real-time
redis-cli monitor
```

## Architecture

```
API Route
    ↓
Service Layer
    ↓
Cache Service (getOrSet)
    ↓
Redis ← Cache HIT (fast path)
    ↓
Repository ← Cache MISS (slow path)
    ↓
Database
```

## Usage

### Basic Caching

```typescript
import { cacheService, CacheKeys, DEFAULT_TTL } from '@/lib/cache';

// Get or fetch user
const user = await cacheService.getOrSet(
  CacheKeys.user(userId),
  async () => {
    // This function only runs on cache miss
    return await userRepository.findById(userId);
  },
  DEFAULT_TTL // 1 hour
);
```

### Service Layer Integration

```typescript
// lib/services/user.service.ts
import { cacheService, CacheKeys, DEFAULT_TTL } from '@/lib/cache';
import { userRepository } from '@/lib/repositories';

export class UserService {
  async getUserById(userId: string): Promise<ServiceResponse> {
    try {
      const user = await cacheService.getOrSet(
        CacheKeys.user(userId),
        () => userRepository.findByIdSafe(userId),
        DEFAULT_TTL
      );

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return { success: true, data: user };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user');
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  async updateUser(
    userId: string,
    data: UpdateUserInput
  ): Promise<ServiceResponse> {
    try {
      const updated = await userRepository.updateUser(userId, data);

      // Invalidate cache after update
      await cacheService.invalidateUser(userId);

      return { success: true, data: updated };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to update user');
      return { success: false, error: 'Failed to update user' };
    }
  }
}
```

### Repository Pattern with Caching

```typescript
// lib/repositories/user.repository.ts
import { cacheService, CacheKeys, DEFAULT_TTL } from '@/lib/cache';

export class UserRepository extends BaseRepository<User> {
  async findByIdCached(id: string): Promise<User | null> {
    return cacheService.getOrSet(
      CacheKeys.user(id),
      () => this.findByIdSafe(id),
      DEFAULT_TTL
    );
  }

  async findByEmailCached(email: string): Promise<User | null> {
    return cacheService.getOrSet(
      CacheKeys.userByEmail(email),
      () => this.findByEmailSafe(email),
      DEFAULT_TTL
    );
  }
}
```

## Cache Keys

### Pre-defined Keys

```typescript
import { CacheKeys } from '@/lib/cache';

// User keys
CacheKeys.user(userId)                    // user:123
CacheKeys.userByEmail(email)              // user:email:john@example.com
CacheKeys.usersByTenant(tenantId, page)   // user:tenant:t1:page:1

// Session keys
CacheKeys.session(token)                  // session:abc123
CacheKeys.userSessions(userId)            // session:user:123

// Tenant keys
CacheKeys.tenant(id)                      // tenant:123
CacheKeys.tenantByCode(code)              // tenant:code:ACME

// Master data keys
CacheKeys.countries()                     // master:countries
CacheKeys.states(countryId)               // master:states:US
CacheKeys.cities(stateId)                 // master:cities:CA
```

### Custom Keys

```typescript
// Create custom cache keys
const customKey = `analytics:${tenantId}:${year}:${month}`;

await cacheService.getOrSet(
  customKey,
  () => fetchAnalyticsData(tenantId, year, month),
  LONG_TTL
);
```

## TTL (Time To Live)

Different data types should have different TTL values:

```typescript
import { SHORT_TTL, DEFAULT_TTL, LONG_TTL } from '@/lib/cache';

// 5 minutes - Frequently changing data
await redis.set(CacheKeys.userSessions(userId), sessions, SHORT_TTL);

// 1 hour (default) - Moderately stable data
await redis.set(CacheKeys.user(userId), user, DEFAULT_TTL);

// 24 hours - Rarely changing data
await redis.set(CacheKeys.countries(), countries, LONG_TTL);

// Custom TTL
const ONE_WEEK = 604800; // 7 days in seconds
await redis.set(key, data, ONE_WEEK);
```

## Cache Invalidation

### Single Entity

```typescript
import { cacheService, CacheKeys } from '@/lib/cache';

// Invalidate user cache after update
await cacheService.invalidate(CacheKeys.user(userId));

// Invalidate multiple specific keys
await cacheService.invalidateMany([
  CacheKeys.user(userId),
  CacheKeys.userByEmail(email),
]);
```

### Related Entities

```typescript
// Invalidate all user-related caches
await cacheService.invalidateUser(userId);
// Clears: user:123, user:*:123, permission:user:123, session:user:123

// Invalidate all tenant-related caches
await cacheService.invalidateTenant(tenantId);
// Clears: tenant:*, user:tenant:*, company:tenant:*, license:tenant:*

// Invalidate all company-related caches
await cacheService.invalidateCompany(companyId);
// Clears: company:123, employee:company:123:*, department:company:123
```

### Pattern-Based Invalidation

```typescript
// Invalidate all pages of a paginated list
await cacheService.invalidatePattern('user:tenant:t1:page:*');

// Invalidate all caches for a specific prefix
await cacheService.invalidatePattern('session:*');

// ⚠️ Use with caution - can be slow with many keys
```

## Best Practices

### 1. Cache Read-Heavy Data

```typescript
// ✅ GOOD - Rarely changes, frequently accessed
await cacheService.getOrSet(
  CacheKeys.countries(),
  () => masterDataRepository.findCountries(),
  LONG_TTL
);

// ❌ BAD - Frequently changes
await cacheService.getOrSet(
  `realtime-stock-price:${symbol}`,
  () => fetchStockPrice(symbol),
  DEFAULT_TTL // Too long!
);
```

### 2. Invalidate on Write Operations

```typescript
// Always invalidate cache after updates
async updateUser(userId: string, data: any) {
  const updated = await userRepository.updateUser(userId, data);

  // CRITICAL: Invalidate cache
  await cacheService.invalidateUser(userId);

  return updated;
}
```

### 3. Use Appropriate TTL

```typescript
// Frequently changing data - Short TTL
session: SHORT_TTL (5 minutes)
user online status: SHORT_TTL

// Moderately stable data - Default TTL
user profile: DEFAULT_TTL (1 hour)
department list: DEFAULT_TTL

// Rarely changing data - Long TTL
master data: LONG_TTL (24 hours)
company list: LONG_TTL
```

### 4. Handle Cache Failures Gracefully

```typescript
// The cache service automatically falls back to database
const user = await cacheService.getOrSet(
  CacheKeys.user(userId),
  () => userRepository.findById(userId), // Always runs on failure
  DEFAULT_TTL
);
```

### 5. Don't Cache Sensitive Data

```typescript
// ❌ BAD - Don't cache passwords or tokens
await redis.set('password:' + userId, hashedPassword);

// ✅ GOOD - Cache non-sensitive user data
await redis.set(CacheKeys.user(userId), safeUserData);
```

### 6. Use Namespaces

```typescript
// ✅ GOOD - Namespaced keys
const key = `${CachePrefix.USER}:${userId}`;

// ❌ BAD - No namespace
const key = userId; // Might conflict with other IDs
```

## Advanced Patterns

### Cache-Aside Pattern (Lazy Loading)

```typescript
// This is what getOrSet does internally
async function getCachedUser(userId: string) {
  // 1. Try to get from cache
  const cached = await redis.get(CacheKeys.user(userId));
  if (cached) return cached;

  // 2. Fetch from database
  const user = await userRepository.findById(userId);

  // 3. Store in cache
  await redis.set(CacheKeys.user(userId), user, DEFAULT_TTL);

  return user;
}
```

### Write-Through Pattern

```typescript
// Update database and cache together
async function updateUserWithCache(userId: string, data: any) {
  // 1. Update database
  const updated = await userRepository.updateUser(userId, data);

  // 2. Update cache (not invalidate)
  await redis.set(CacheKeys.user(userId), updated, DEFAULT_TTL);

  return updated;
}
```

### Stale-While-Revalidate Pattern

```typescript
// Return stale data immediately, refresh in background
async function getWithStaleWhileRevalidate<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
) {
  const cached = await redis.get<T>(key);

  if (cached) {
    // Check if cache is about to expire
    const cacheTTL = await redis.ttl(key);

    if (cacheTTL < ttl / 10) {
      // Less than 10% TTL remaining - refresh in background
      fetchFn().then((fresh) => {
        redis.set(key, fresh, ttl);
      });
    }

    return cached; // Return stale data immediately
  }

  // No cache - fetch and store
  const fresh = await fetchFn();
  await redis.set(key, fresh, ttl);
  return fresh;
}
```

### Cache Stampede Prevention

```typescript
// Prevent multiple requests from fetching the same data simultaneously
const locks = new Map<string, Promise<any>>();

async function getWithLock<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // Check if fetch is already in progress
  if (locks.has(key)) {
    return locks.get(key)!;
  }

  // Start fetch and store promise
  const fetchPromise = fetchFn().then(async (data) => {
    await redis.set(key, data, ttl);
    locks.delete(key);
    return data;
  });

  locks.set(key, fetchPromise);
  return fetchPromise;
}
```

## Monitoring & Debugging

### Check Redis Status

```typescript
import { cacheService } from '@/lib/cache';

const stats = await cacheService.getStats();
console.log(stats);
// { isConnected: true, keysCount: 1234 }
```

### Monitor Cache Hit Rate

```typescript
// Add logging to track cache effectiveness
let hits = 0;
let misses = 0;

async function getOrSetWithMetrics<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await redis.get<T>(key);

  if (cached) {
    hits++;
    logger.info({ key, hitRate: hits / (hits + misses) }, 'Cache HIT');
    return cached;
  }

  misses++;
  logger.info({ key, hitRate: hits / (hits + misses) }, 'Cache MISS');

  const fresh = await fetchFn();
  await redis.set(key, fresh, ttl);
  return fresh;
}
```

### View All Cach Keys

```bash
# Redis CLI
redis-cli keys "*"

# Count keys by prefix
redis-cli keys "user:*" | wc -l
redis-cli keys "session:*" | wc -l

# View key value
redis-cli get "user:123"

# View key TTL
redis-cli ttl "user:123"
```

### Monitor Redis in Real-Time

```bash
# Monitor all commands
redis-cli monitor

# Redis stats
redis-cli --stat

# Memory usage
redis-cli info memory
```

## Performance Optimization

### 1. Pipeline Multiple Operations

```typescript
// Instead of multiple await calls
await redis.set('key1', 'value1', TTL);
await redis.set('key2', 'value2', TTL);
await redis.set('key3', 'value3', TTL);

// Use pipeline (not exposed in current implementation)
const client = redis.getClient();
if (client) {
  const pipeline = client.pipeline();
  pipeline.setex('key1', TTL, JSON.stringify('value1'));
  pipeline.setex('key2', TTL, JSON.stringify('value2'));
  pipeline.setex('key3', TTL, JSON.stringify('value3'));
  await pipeline.exec();
}
```

### 2. Use Compression for Large Objects

```typescript
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

async function setCompressed(key: string, value: any, ttl: number) {
  const serialized = JSON.stringify(value);
  const compressed = await gzipAsync(Buffer.from(serialized));
  await redis.set(key, compressed.toString('base64'), ttl);
}

async function getCompressed<T>(key: string): Promise<T | null> {
  const compressed = await redis.get<string>(key);
  if (!compressed) return null;

  const buffer = Buffer.from(compressed, 'base64');
  const decompressed = await gunzipAsync(buffer);
  return JSON.parse(decompressed.toString());
}
```

### 3. Batch Get Operations

```typescript
// Fetch multiple users in one operation
async function getUsersBatch(userIds: string[]): Promise<User[]> {
  const keys = userIds.map((id) => CacheKeys.user(id));

  const client = redis.getClient();
  if (!client) {
    return userRepository.findByIds(userIds);
  }

  const cached = await client.mget(...keys);
  const users: User[] = [];
  const missedIds: string[] = [];

  cached.forEach((value, index) => {
    if (value) {
      users.push(JSON.parse(value));
    } else {
      missedIds.push(userIds[index]);
    }
  });

  // Fetch missed users from database
  if (missedIds.length > 0) {
    const freshUsers = await userRepository.findByIds(missedIds);
    users.push(...freshUsers);

    // Cache them
    freshUsers.forEach((user) => {
      redis.set(CacheKeys.user(user.id), user, DEFAULT_TTL);
    });
  }

  return users;
}
```

## Testing

### Mock Redis in Tests

```typescript
// __tests__/setup.ts
vi.mock('@/lib/cache', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(true),
    del: vi.fn().mockResolvedValue(true),
    isReady: vi.fn().mockReturnValue(false), // Disabled in tests
  },
  cacheService: {
    getOrSet: vi.fn().mockImplementation((key, fetchFn) => fetchFn()),
    invalidate: vi.fn().mockResolvedValue(true),
  },
}));
```

### Integration Tests with Real Redis

```typescript
import { redis, cacheService } from '@/lib/cache';

describe('Cache Integration', () => {
  beforeAll(async () => {
    // Ensure Redis is connected
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterEach(async () => {
    // Clear test data
    await cacheService.clearAll();
  });

  it('should cache and retrieve data', async () => {
    const key = 'test:user:123';
    const data = { id: '123', name: 'Test User' };

    await redis.set(key, data, 60);
    const cached = await redis.get(key);

    expect(cached).toEqual(data);
  });
});
```

## Production Considerations

### 1. Redis Configuration

```bash
# /etc/redis/redis.conf

# Memory limit (e.g., 2GB)
maxmemory 2gb

# Eviction policy (remove least recently used)
maxmemory-policy allkeys-lru

# Persistence (optional - faster without)
save ""  # Disable persistence for pure cache

# Connection limits
maxclients 10000
```

### 2. Monitoring

Use Redis monitoring tools:
- **RedisInsight**: GUI for Redis
- **Prometheus + Grafana**: Metrics visualization
- **CloudWatch**: For AWS ElastiCache

### 3. High Availability

For production, use Redis Cluster or managed services:
- **AWS ElastiCache**
- **Azure Cache for Redis**
- **Google Cloud Memorystore**
- **Redis Enterprise Cloud**

### 4. Security

```bash
# Require password
requirepass your-strong-password

# Bind to specific IP
bind 127.0.0.1

# Rename dangerous commands
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
```

## Troubleshooting

### Redis Not Connected

1. Check if Redis is running: `redis-cli ping`
2. Verify `REDIS_URL` in `.env`
3. Check Redis logs: `tail -f /var/log/redis/redis-server.log`
4. The app will fall back to database queries

### Memory Issues

```bash
# Check memory usage
redis-cli info memory

# Clear all keys (careful!)
redis-cli FLUSHALL

# Set eviction policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Slow Performance

1. Monitor slow commands: `redis-cli --latency`
2. Check for large keys: `redis-cli --bigkeys`
3. Enable persistence only if needed
4. Use connection pooling

## Resources

- [Redis Documentation](https://redis.io/documentation)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Caching Best Practices](https://redis.com/redis-best-practices/)
- [Redis University](https://university.redis.com/)
