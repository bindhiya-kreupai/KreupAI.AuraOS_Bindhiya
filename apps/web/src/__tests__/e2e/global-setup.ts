/**
 * Playwright Global Setup
 * Week 5: E2E Testing Setup
 *
 * This file runs before all tests and sets up:
 * - Test database with clean state
 * - Test user accounts
 * - Authentication state
 */

import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global E2E test setup...');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Clean up test data
    console.log('🧹 Cleaning up test database...');
    await prisma.userSession.deleteMany({});
    await prisma.auditLog.deleteMany({});

    // Create test tenant
    console.log('🏢 Creating test tenant...');
    const testTenant = await prisma.tenant.upsert({
      where: { id: 'test-tenant-e2e' },
      update: {},
      create: {
        id: 'test-tenant-e2e',
        name: 'E2E Test Tenant',
        subdomain: 'e2e-test',
        status: 'Active',
        maxUsers: 100,
        currentUsers: 0,
      },
    });

    // Create test users
    console.log('👤 Creating test users...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Test@1234', 10);

    // Admin user
    await prisma.user.upsert({
      where: { email: 'admin@e2etest.com' },
      update: {},
      create: {
        id: 'test-admin-user',
        email: 'admin@e2etest.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        status: 'Active',
        emailVerified: true,
        tenantId: testTenant.id,
      },
    });

    // Regular user
    await prisma.user.upsert({
      where: { email: 'user@e2etest.com' },
      update: {},
      create: {
        id: 'test-regular-user',
        email: 'user@e2etest.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        status: 'Active',
        emailVerified: true,
        tenantId: testTenant.id,
      },
    });

    // Manager user
    await prisma.user.upsert({
      where: { email: 'manager@e2etest.com' },
      update: {},
      create: {
        id: 'test-manager-user',
        email: 'manager@e2etest.com',
        password: hashedPassword,
        firstName: 'Manager',
        lastName: 'User',
        status: 'Active',
        emailVerified: true,
        tenantId: testTenant.id,
      },
    });

    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;
