/**
 * E2E Test User Fixtures
 * Week 5: E2E Testing Setup
 *
 * Provides consistent test user data across all E2E tests
 */

export interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
}

export const testUsers: Record<string, TestUser> = {
  admin: {
    id: 'test-admin-user',
    email: 'admin@e2etest.com',
    password: 'Test@1234',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },

  manager: {
    id: 'test-manager-user',
    email: 'manager@e2etest.com',
    password: 'Test@1234',
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
  },

  user: {
    id: 'test-regular-user',
    email: 'user@e2etest.com',
    password: 'Test@1234',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
  },
};

export const testTenant = {
  id: 'test-tenant-e2e',
  name: 'E2E Test Tenant',
  subdomain: 'e2e-test',
};
