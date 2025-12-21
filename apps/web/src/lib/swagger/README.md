# API Documentation with Swagger/OpenAPI

## Overview

AuraOS uses OpenAPI 3.0 specification with Swagger UI to provide interactive API documentation. This allows developers to explore, understand, and test API endpoints directly from the browser.

## Accessing Documentation

### Local Development
```
http://localhost:3006/api-docs
```

### Production
```
https://your-domain.com/api-docs
```

### OpenAPI JSON Spec
```
http://localhost:3006/api/docs
```

## Features

- ✅ **Interactive API Testing** - Try out endpoints directly from the browser
- ✅ **Authentication Support** - Test authenticated endpoints with JWT tokens
- ✅ **Request/Response Examples** - See example payloads for all endpoints
- ✅ **Schema Validation** - View data models and validation rules
- ✅ **Auto-generated** - Documentation updates automatically with code changes
- ✅ **OpenAPI 3.0** - Industry-standard API specification format

## Project Structure

```
src/lib/swagger/
├── config.ts              # Main Swagger configuration
├── paths/                 # API endpoint documentation
│   ├── auth.ts           # Authentication endpoints
│   ├── users.ts          # User management endpoints
│   ├── licenses.ts       # License management endpoints
│   └── ...
└── README.md             # This file

src/app/
├── api/docs/route.ts     # JSON spec endpoint
└── (marketing)/api-docs/page.tsx  # Swagger UI page
```

## Documenting APIs

### Basic Endpoint Documentation

Add JSDoc comments with `@swagger` tags above your route handler:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users
 *     description: Get a paginated list of users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
```

### Using Separate Documentation Files

For better organization, create separate files in `src/lib/swagger/paths/`:

```typescript
// src/lib/swagger/paths/products.ts
/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List products
 *     responses:
 *       200:
 *         description: Success
 */

export {};
```

Then reference it in `config.ts`:

```typescript
const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: [
    './src/app/api/**/route.ts',
    './src/lib/swagger/paths/**/*.ts',  // ← Includes your docs
  ],
};
```

### Documenting Request Bodies

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 */
```

### Documenting Path Parameters

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 */
```

### Documenting Query Parameters

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 */
```

### Using Schema References

Define reusable schemas in `config.ts`:

```typescript
components: {
  schemas: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        status: { type: 'string', enum: ['Active', 'Inactive'] },
      },
    },
  },
}
```

Then reference in your docs:

```typescript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
```

### Documenting Authentication

For endpoints requiring authentication:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       401:
 *         description: Not authenticated
 */
```

For public endpoints (no auth required):

```typescript
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     security: []  # ← Explicitly disable auth requirement
 */
```

### Documenting Error Responses

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
```

## Common Schemas

### Standard Response Format

```typescript
// Success response
{
  success: {
    type: 'boolean',
    example: true,
  },
  data: {
    type: 'object',
    // ... your data schema
  },
  message: {
    type: 'string',
    example: 'Operation successful',
  },
}

// Error response
{
  success: {
    type: 'boolean',
    example: false,
  },
  error: {
    type: 'string',
    example: 'An error occurred',
  },
}

// Validation error
{
  success: {
    type: 'boolean',
    example: false,
  },
  errors: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string', example: 'email' },
        message: { type: 'string', example: 'Invalid email' },
      },
    },
  },
}
```

### Pagination Response

```typescript
{
  success: { type: 'boolean' },
  data: {
    type: 'array',
    items: { $ref: '#/components/schemas/YourModel' },
  },
  meta: {
    type: 'object',
    properties: {
      total: { type: 'integer', example: 100 },
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
      totalPages: { type: 'integer', example: 10 },
    },
  },
}
```

## Testing APIs from Swagger UI

### 1. Authenticate

1. Click **"Authorize"** button at the top right
2. Login to get a token: POST `/api/auth/login`
3. Copy the `accessToken` from response
4. In the Authorize dialog, enter: `Bearer {your-token}`
5. Click **"Authorize"**, then **"Close"**

### 2. Try an Endpoint

1. Click on any endpoint to expand it
2. Click **"Try it out"**
3. Fill in required parameters
4. Click **"Execute"**
5. View the response below

### 3. Use Example Values

Swagger UI auto-fills examples from the schema. You can edit these values before executing.

## Best Practices

### 1. Consistent Naming

```typescript
// ✅ Good - Clear, descriptive
tags: ['Users', 'Authentication', 'Licenses']

// ❌ Bad - Vague, inconsistent
tags: ['user', 'Auth', 'lic']
```

### 2. Comprehensive Examples

```typescript
// ✅ Good - Shows realistic data
example: 'user@example.com'

// ❌ Bad - Vague placeholder
example: 'string'
```

### 3. Document All Status Codes

```typescript
// ✅ Good - All possible responses
responses:
  200: { description: 'Success' }
  400: { description: 'Validation error' }
  401: { description: 'Unauthorized' }
  403: { description: 'Forbidden' }
  404: { description: 'Not found' }
  500: { description: 'Server error' }

// ❌ Bad - Only success case
responses:
  200: { description: 'Success' }
```

### 4. Use Schemas for Reusability

```typescript
// ✅ Good - Reusable schema
schema:
  $ref: '#/components/schemas/User'

// ❌ Bad - Inline duplication
schema:
  type: 'object'
  properties:
    id: { type: 'string' }
    // ... repeated everywhere
```

### 5. Group Related Endpoints

```typescript
// ✅ Good - Organized by resource
tags: ['Users']  // All user-related endpoints

// ❌ Bad - Mixed organization
tags: ['API']  // Too broad, everything in one tag
```

## Advanced Features

### Multiple Examples

```typescript
examples:
  admin:
    summary: Admin user
    value: {
      email: 'admin@example.com',
      role: 'admin',
    }
  regular:
    summary: Regular user
    value: {
      email: 'user@example.com',
      role: 'user',
    }
```

### Deprecated Endpoints

```typescript
/**
 * @swagger
 * /api/old-endpoint:
 *   get:
 *     deprecated: true
 *     description: Use /api/new-endpoint instead
 */
```

### External Documentation

```typescript
externalDocs: {
  description: 'Find more info here',
  url: 'https://docs.auraos.com/api',
}
```

## Generating Client SDKs

Use OpenAPI spec to generate client libraries:

```bash
# TypeScript
npx openapi-generator-cli generate -i http://localhost:3006/api/docs -g typescript-axios -o ./sdk/typescript

# Python
npx openapi-generator-cli generate -i http://localhost:3006/api/docs -g python -o ./sdk/python

# Java
npx openapi-generator-cli generate -i http://localhost:3006/api/docs -g java -o ./sdk/java
```

## Troubleshooting

### Documentation Not Showing

**Issue**: Endpoints missing from Swagger UI

**Solutions**:
1. Check file paths in `apis` array in `config.ts`
2. Ensure JSDoc comments use `@swagger` tag
3. Verify YAML syntax is valid
4. Restart dev server

### Schema Errors

**Issue**: `$ref` not resolving

**Solution**: Ensure schema is defined in `components.schemas` in `config.ts`

### Authentication Not Working

**Issue**: 401 errors when testing authenticated endpoints

**Solutions**:
1. Click "Authorize" button
2. Enter: `Bearer {token}` (not just the token)
3. Ensure token hasn't expired (15 min default)
4. Get fresh token from `/api/auth/login`

## Maintenance

### Updating Documentation

1. Edit relevant file in `src/lib/swagger/paths/`
2. Documentation updates automatically
3. Refresh browser to see changes
4. No build step required in dev mode

### Adding New Endpoints

1. Create new file: `src/lib/swagger/paths/resource.ts`
2. Add Swagger comments
3. Export empty object: `export {};`
4. Documentation appears immediately

### Versioning

When making breaking API changes:

1. Update version in `config.ts`:
   ```typescript
   info: {
     version: '2.0.0',
   }
   ```

2. Consider API versioning strategy:
   - `/api/v1/users`
   - `/api/v2/users`

## Resources

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [OpenAPI Generator](https://openapi-generator.tech/)

---

**Last Updated**: 2025-12-20
**OpenAPI Version**: 3.0.0
**Documented Endpoints**: 15+ (Authentication, Users, Licenses, Master Data)
