# API Versioning Strategy

Complete guide for API versioning in AuraOS HRMS platform.

## Table of Contents

- [Overview](#overview)
- [Versioning Approach](#versioning-approach)
- [Version Negotiation](#version-negotiation)
- [Supported Versions](#supported-versions)
- [Version Lifecycle](#version-lifecycle)
- [Usage Examples](#usage-examples)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)
- [FAQ](#faq)

## Overview

AuraOS implements a **URL-based API versioning strategy** with support for multiple version negotiation methods. This approach provides clear, explicit versioning while maintaining backward compatibility and enabling smooth migrations.

### Why API Versioning?

- **Backward Compatibility**: Support multiple client versions simultaneously
- **Gradual Migration**: Allow clients to migrate at their own pace
- **Breaking Changes**: Introduce new features without breaking existing integrations
- **Deprecation Management**: Clear communication about version sunsets
- **Flexibility**: Multiple ways to specify desired API version

## Versioning Approach

### Semantic Versioning

We use **major version numbering** (v1, v2, v3, etc.):

- **Major Version** (v1 → v2): Breaking changes, new features, significant refactoring
- **Minor/Patch Updates**: Released within the same major version without versioning

**Example:**
```
v1 - Initial release (December 2025)
v2 - Future major update (TBD)
```

### Current Versions

| Version | Status     | Release Date | Sunset Date | Notes                          |
|---------|------------|--------------|-------------|--------------------------------|
| **v1**  | ✅ Active  | 2025-12-21   | -           | Current stable version         |

## Version Negotiation

AuraOS supports **three methods** for specifying API version (in priority order):

### 1. URL Path (Recommended)

The most explicit and recommended approach:

```bash
# Users API v1
GET https://api.auraos.com/api/v1/users

# Licenses API v1
GET https://api.auraos.com/api/v1/licenses
```

**Pros:**
- Clearest intent
- Works with all HTTP clients
- Easy to debug
- Visible in logs

**Cons:**
- Requires path updates when migrating

### 2. Header-Based

Use the `Accept-Version` header:

```bash
curl https://api.auraos.com/api/users \
  -H "Accept-Version: v1"
```

**Pros:**
- Clean URLs
- Easy to change versions
- Good for testing different versions

**Cons:**
- Less visible
- Requires header support

### 3. Query Parameter

Use the `version` query parameter:

```bash
GET https://api.auraos.com/api/users?version=v1
```

**Pros:**
- Simple to implement
- Works in browsers
- Easy for testing

**Cons:**
- Clutters URL
- Can conflict with other params

### 4. Default Version

If no version is specified, the API defaults to **v1**:

```bash
# Defaults to v1
GET https://api.auraos.com/api/users
```

**Priority Order:**
```
URL Path > Accept-Version Header > Query Parameter > Default (v1)
```

## Supported Versions

### v1 (Current)

**Status:** ✅ Active
**Release Date:** December 21, 2025
**Sunset Date:** None

**Features:**
- User Management (CRUD)
- License Management
- Master Data APIs
- Authentication & Authorization (JWT, RBAC)
- Audit Logging
- Rate Limiting
- Tenant Isolation
- Query Performance Monitoring
- Health Checks
- Session Management
- Role Management
- Password Policies
- SSO Configuration
- MFA Configuration

**Breaking Changes:** None (initial release)

### Future Versions

When v2 is released, this section will document:
- New features
- Breaking changes
- Migration requirements
- Deprecation timeline for v1

## Version Lifecycle

### 1. Active

**Definition:** Fully supported, recommended for new integrations

**Characteristics:**
- Regular bug fixes
- Security updates
- Feature enhancements
- Full support

**Current:** v1

### 2. Deprecated

**Definition:** Still functional but scheduled for sunset

**Characteristics:**
- Security fixes only
- No new features
- Deprecation headers in responses
- Sunset date announced
- Migration guide available

**Headers Returned:**
```http
X-API-Deprecated: true
Deprecation: This API version is deprecated. Please migrate to the latest version.
Sunset: 2026-12-31
Link: </api/v2>; rel="successor-version"
```

**Current:** None

### 3. Sunset

**Definition:** Version is EOL and no longer supported

**Characteristics:**
- Returns 410 Gone
- No support
- All clients must migrate

**Current:** None

## Usage Examples

### Making Versioned Requests

#### Using URL Path (Recommended)

```typescript
// TypeScript/JavaScript
const response = await fetch('https://api.auraos.com/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const users = await response.json();
console.log('API Version:', response.headers.get('X-API-Version'));
```

```python
# Python
import requests

response = requests.get(
    'https://api.auraos.com/api/v1/users',
    headers={'Authorization': f'Bearer {token}'}
)

print(f"API Version: {response.headers.get('X-API-Version')}")
users = response.json()
```

```bash
# cURL
curl https://api.auraos.com/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### Using Accept-Version Header

```typescript
const response = await fetch('https://api.auraos.com/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Accept-Version': 'v1',
  },
});
```

```bash
curl https://api.auraos.com/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept-Version: v1"
```

#### Using Query Parameter

```typescript
const response = await fetch('https://api.auraos.com/api/users?version=v1', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Version Discovery

#### Get All Available Versions

```bash
GET /api/versions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current": "v1",
    "default": "v1",
    "supported": ["v1"],
    "active": ["v1"],
    "deprecated": [],
    "versions": {
      "v1": {
        "version": "v1",
        "releaseDate": "2025-12-21",
        "status": "active",
        "changelog": [
          "Initial API release",
          "User management endpoints",
          "License management",
          "Authentication & authorization"
        ],
        "breakingChanges": []
      }
    },
    "announcements": [
      {
        "version": "v1",
        "type": "release",
        "date": "2025-12-21",
        "title": "API v1 Released",
        "message": "Initial release of AuraOS API",
        "actionRequired": false
      }
    ]
  }
}
```

#### Get Migration Guide

```bash
GET /api/versions/migration?from=v1&to=v1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "from": "v1",
    "to": "v1",
    "steps": [
      "No migration needed - versions are the same"
    ],
    "breakingChanges": [],
    "checklist": [
      {
        "task": "Review changelog",
        "required": true,
        "description": "Review all changes in v1"
      }
    ]
  }
}
```

### Response Headers

All API responses include version information:

```http
HTTP/1.1 200 OK
X-API-Version: v1
Content-Type: application/json

{
  "success": true,
  "data": { ... }
}
```

For deprecated versions:

```http
HTTP/1.1 200 OK
X-API-Version: v1
X-API-Deprecated: true
Deprecation: This API version is deprecated. Please migrate to the latest version.
Sunset: 2026-12-31
Link: </api/v2>; rel="successor-version"
```

## Migration Guide

### When to Migrate

Migrate to a new API version when:

1. **Your current version is deprecated** - Sunset date announced
2. **New features required** - Only available in newer version
3. **Performance improvements** - Significant optimizations in newer version
4. **Security enhancements** - Critical security fixes

### Migration Process

#### Step 1: Discover Version Information

```bash
# Get all version information
curl https://api.auraos.com/api/versions

# Get migration guide
curl "https://api.auraos.com/api/versions/migration?from=v1&to=v2"
```

#### Step 2: Review Breaking Changes

Check the migration guide for:
- Breaking changes
- New required fields
- Removed endpoints
- Changed response formats

#### Step 3: Test in Development

```bash
# Test with new version using header (easy to toggle)
curl https://api.auraos.com/api/users \
  -H "Accept-Version: v2"

# Compare with current version
curl https://api.auraos.com/api/users \
  -H "Accept-Version: v1"
```

#### Step 4: Update Code

Update all API calls to use new version:

```typescript
// Before
const API_BASE = 'https://api.auraos.com/api/v1';

// After
const API_BASE = 'https://api.auraos.com/api/v2';
```

#### Step 5: Update Tests

Ensure all integration tests pass with new version:

```typescript
describe('API v2 Integration', () => {
  it('should fetch users', async () => {
    const response = await fetch('/api/v2/users');
    expect(response.headers.get('X-API-Version')).toBe('v2');
  });
});
```

#### Step 6: Deploy Gradually

Use feature flags or gradual rollout:

```typescript
const apiVersion = featureFlags.useV2API ? 'v2' : 'v1';
const response = await fetch(`/api/${apiVersion}/users`);
```

#### Step 7: Monitor

Watch for:
- Error rates
- Response times
- Deprecation warnings in logs

### Rollback Plan

If issues occur:

```typescript
// Quick rollback - change version
const API_VERSION = 'v1'; // Rollback to v1
const response = await fetch(`/api/${API_VERSION}/users`);
```

## Best Practices

### For API Consumers

1. **Always specify version explicitly**
   ```typescript
   // ✅ Good - Explicit version
   fetch('/api/v1/users');

   // ❌ Bad - Relying on default
   fetch('/api/users');
   ```

2. **Use URL path versioning** for production
   ```typescript
   // ✅ Recommended - Clear and explicit
   const API_BASE = 'https://api.auraos.com/api/v1';

   // ❌ Less preferred - Hidden in headers
   headers: { 'Accept-Version': 'v1' }
   ```

3. **Check version headers** in responses
   ```typescript
   const version = response.headers.get('X-API-Version');
   if (response.headers.get('X-API-Deprecated')) {
     console.warn(`API version ${version} is deprecated!`);
   }
   ```

4. **Monitor for deprecation warnings**
   ```typescript
   if (response.headers.get('Sunset')) {
     const sunsetDate = response.headers.get('Sunset');
     logger.warn(`API version will sunset on ${sunsetDate}`);
   }
   ```

5. **Stay informed** about version announcements
   ```bash
   # Periodically check for announcements
   curl https://api.auraos.com/api/versions
   ```

### For API Developers

1. **Never break backward compatibility** within a major version

2. **Use semantic versioning** for major changes only

3. **Provide migration guides** before deprecation

4. **Give ample notice** - Minimum 6 months before sunset

5. **Support at least 2 versions** simultaneously during transitions

6. **Document all breaking changes** thoroughly

7. **Test both versions** in CI/CD pipeline

## FAQ

### Q: What happens if I don't specify a version?

**A:** The API defaults to v1 (current stable version). However, we recommend always specifying the version explicitly to avoid surprises when defaults change.

### Q: Can I use different versions for different endpoints?

**A:** Yes! Each request can specify its own version:

```typescript
// Users on v1
await fetch('/api/v1/users');

// Licenses on v2 (when available)
await fetch('/api/v2/licenses');
```

### Q: How long will v1 be supported?

**A:** v1 will be supported for at least 12 months after v2 is released. A deprecation notice and sunset date will be announced at least 6 months in advance.

### Q: What if I request an unsupported version?

**A:** You'll receive a 400 Bad Request with details:

```json
{
  "success": false,
  "error": "Unsupported API version",
  "message": "API version 'v99' is not supported",
  "supportedVersions": ["v1"],
  "latestVersion": "v1"
}
```

### Q: How do I know when a new version is released?

**A:** Check `/api/versions` endpoint or monitor the `announcements` field for release notifications.

### Q: Will there be a v0?

**A:** No. We started with v1 as the first stable, production-ready version.

### Q: Can I mix versions in the same application?

**A:** Technically yes, but **not recommended**. Stick to one version per application for consistency and easier maintenance.

### Q: How are minor updates handled?

**A:** Minor updates (bug fixes, performance improvements, new optional fields) are released within the same major version without requiring version changes.

### Q: What about webhooks?

**A:** Webhooks will also be versioned. You'll configure the desired version when setting up webhooks.

## Additional Resources

- **API Documentation**: [Swagger UI](/api-docs)
- **Version Information**: [GET /api/versions](/api/versions)
- **Migration Guides**: [GET /api/versions/migration](/api/versions/migration)
- **Changelog**: See version metadata in `/api/versions`
- **Support**: support@auraos.com

---

**Last Updated:** December 21, 2025
**Current Version:** v1
**Next Version:** TBD
