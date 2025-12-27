/**
 * User Test Data Factory
 * Generates consistent test data for user entities
 */

import { User, UserRole } from '@prisma/client';

let userIdCounter = 1;

export interface UserFactoryOptions {
  id?: string;
  tenantId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  password?: string;
  lastLoginAt?: Date;
}

export const UserFactory = {
  /**
   * Build a single user object (not saved to database)
   */
  build(overrides: UserFactoryOptions = {}): Partial<User> {
    const id = userIdCounter++;

    return {
      id: overrides.id || `user-${id}`,
      tenantId: overrides.tenantId || 'tenant-1',
      email: overrides.email || `user${id}@test.com`,
      firstName: overrides.firstName || `User${id}`,
      lastName: overrides.lastName || `LastName${id}`,
      role: overrides.role || 'EMPLOYEE',
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
      emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
      password: overrides.password || '$2a$10$hashedPasswordForTesting',
      lastLoginAt: overrides.lastLoginAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Build multiple users
   */
  buildMany(count: number, overrides: UserFactoryOptions = {}): Partial<User>[] {
    return Array.from({ length: count }, () => this.build(overrides));
  },

  /**
   * Build user with specific role
   */
  buildAdmin(overrides: UserFactoryOptions = {}) {
    return this.build({
      ...overrides,
      role: 'SUPER_ADMIN',
      email: overrides.email || `admin${userIdCounter}@test.com`
    });
  },

  buildHRManager(overrides: UserFactoryOptions = {}) {
    return this.build({
      ...overrides,
      role: 'HR_MANAGER',
      email: overrides.email || `hrmanager${userIdCounter}@test.com`
    });
  },

  buildEmployee(overrides: UserFactoryOptions = {}) {
    return this.build({
      ...overrides,
      role: 'EMPLOYEE',
      email: overrides.email || `employee${userIdCounter}@test.com`
    });
  },

  buildManager(overrides: UserFactoryOptions = {}) {
    return this.build({
      ...overrides,
      role: 'MANAGER',
      email: overrides.email || `manager${userIdCounter}@test.com`
    });
  },

  /**
   * Build inactive user
   */
  buildInactive(overrides: UserFactoryOptions = {}) {
    return this.build({
      ...overrides,
      isActive: false
    });
  },

  /**
   * Build user without verified email
   */
  buildUnverified(overrides: UserFactoryOptions = {}) {
    return this.build({
      ...overrides,
      emailVerified: false
    });
  },

  /**
   * Reset counter (useful between tests)
   */
  reset() {
    userIdCounter = 1;
  }
};
