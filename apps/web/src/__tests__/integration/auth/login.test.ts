/**
 * Login API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import { mockUsers } from '@/__tests__/fixtures';
import type { PrismaClient } from '@prisma/client';

describe('POST /api/auth/login', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDb();
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await teardownTestDb(prisma);
  });

  beforeEach(async () => {
    // Clear sessions before each test
    await prisma.userSession.deleteMany({});
  });

  it('should successfully login with valid credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
        password: 'User123!', // Original password before hashing
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('accessToken');
    expect(data.data).toHaveProperty('refreshToken');
    expect(data.data.user).toMatchObject({
      id: mockUsers.user1.id,
      email: mockUsers.user1.email,
    });
  });

  it('should return 401 for invalid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should return 401 for invalid password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
        password: 'WrongPassword123!',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should return 403 for inactive user', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: mockUsers.inactiveUser.email,
        password: 'User123!',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Account is not active');
  });

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for missing password', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should create user session on successful login', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-agent': 'Test Browser/1.0',
        'x-forwarded-for': '192.168.1.100',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
        password: 'User123!',
      }),
    });

    await POST(request);

    const session = await prisma.userSession.findFirst({
      where: { userId: mockUsers.user1.id },
    });

    expect(session).toBeDefined();
    expect(session?.status).toBe('Active');
    expect(session?.ipAddress).toBe('192.168.1.100');
  });

  it('should create audit log on successful login', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
        password: 'User123!',
      }),
    });

    await POST(request);

    const auditLog = await prisma.auditLog.findFirst({
      where: {
        userId: mockUsers.user1.id,
        action: 'LOGIN',
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(auditLog).toBeDefined();
    expect(auditLog?.module).toBe('Authentication');
  });

  it('should update lastLogin timestamp', async () => {
    const beforeLogin = await prisma.user.findUnique({
      where: { id: mockUsers.user1.id },
      select: { lastLogin: true },
    });

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
        password: 'User123!',
      }),
    });

    await POST(request);

    const afterLogin = await prisma.user.findUnique({
      where: { id: mockUsers.user1.id },
      select: { lastLogin: true },
    });

    expect(afterLogin?.lastLogin).not.toEqual(beforeLogin?.lastLogin);
    expect(afterLogin?.lastLogin).toBeInstanceOf(Date);
  });

  it('should enforce rate limiting', async () => {
    const requests = [];

    // Make 11 requests (limit is 10 per 5 minutes)
    for (let i = 0; i < 11; i++) {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({
          email: mockUsers.user1.email,
          password: 'User123!',
        }),
      });

      requests.push(POST(request));
    }

    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];

    expect(lastResponse.status).toBe(429); // Rate limit exceeded
  });

  it('should include rate limit headers', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: mockUsers.user1.email,
        password: 'User123!',
      }),
    });

    const response = await POST(request);

    expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
    expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
    expect(response.headers.has('X-RateLimit-Reset')).toBe(true);
  });
});
