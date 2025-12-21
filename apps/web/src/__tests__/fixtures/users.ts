/**
 * User Test Fixtures
 */

export const mockUsers = {
  admin: {
    id: 'user-admin-1',
    email: 'admin@auraos.com',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'Admin123!'
    tenantId: 'tenant-1',
    status: 'Active' as const,
    roleId: 'role-admin',
    mfaEnabled: false,
    lastLogin: new Date('2025-12-15T10:00:00Z'),
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-12-15T10:00:00Z'),
    employee: {
      id: 'emp-admin-1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@auraos.com',
    },
  },

  user1: {
    id: 'user-1',
    email: 'john.doe@auraos.com',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'User123!'
    tenantId: 'tenant-1',
    status: 'Active' as const,
    roleId: 'role-user',
    mfaEnabled: true,
    lastLogin: new Date('2025-12-20T08:00:00Z'),
    createdAt: new Date('2025-01-15T00:00:00Z'),
    updatedAt: new Date('2025-12-20T08:00:00Z'),
    employee: {
      id: 'emp-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@auraos.com',
    },
  },

  user2: {
    id: 'user-2',
    email: 'jane.smith@auraos.com',
    password: '$2a$10$YourHashedPasswordHere',
    tenantId: 'tenant-1',
    status: 'Active' as const,
    roleId: 'role-user',
    mfaEnabled: false,
    lastLogin: new Date('2025-12-19T14:30:00Z'),
    createdAt: new Date('2025-02-01T00:00:00Z'),
    updatedAt: new Date('2025-12-19T14:30:00Z'),
    employee: {
      id: 'emp-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@auraos.com',
    },
  },

  inactiveUser: {
    id: 'user-inactive',
    email: 'inactive@auraos.com',
    password: '$2a$10$YourHashedPasswordHere',
    tenantId: 'tenant-1',
    status: 'Inactive' as const,
    roleId: 'role-user',
    mfaEnabled: false,
    lastLogin: new Date('2025-10-01T00:00:00Z'),
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-11-01T00:00:00Z'),
    employee: {
      id: 'emp-inactive',
      firstName: 'Inactive',
      lastName: 'User',
      email: 'inactive@auraos.com',
    },
  },

  tenant2User: {
    id: 'user-tenant2-1',
    email: 'user@tenant2.com',
    password: '$2a$10$YourHashedPasswordHere',
    tenantId: 'tenant-2',
    status: 'Active' as const,
    roleId: 'role-user',
    mfaEnabled: false,
    lastLogin: new Date('2025-12-18T09:00:00Z'),
    createdAt: new Date('2025-03-01T00:00:00Z'),
    updatedAt: new Date('2025-12-18T09:00:00Z'),
    employee: {
      id: 'emp-tenant2-1',
      firstName: 'Tenant2',
      lastName: 'User',
      email: 'user@tenant2.com',
    },
  },
};

export const mockUsersList = Object.values(mockUsers);
