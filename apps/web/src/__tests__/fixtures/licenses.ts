/**
 * License Test Fixtures
 */

export const mockLicenses = {
  active: {
    id: 'lic-1',
    tenantId: 'tenant-1',
    type: 'Professional' as const,
    totalSeats: 100,
    usedSeats: 45,
    status: 'Active' as const,
    expiresAt: new Date('2026-12-31T23:59:59Z'),
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-12-15T00:00:00Z'),
  },

  enterprise: {
    id: 'lic-2',
    tenantId: 'tenant-1',
    type: 'Enterprise' as const,
    totalSeats: 500,
    usedSeats: 250,
    status: 'Active' as const,
    expiresAt: new Date('2027-06-30T23:59:59Z'),
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-12-01T00:00:00Z'),
  },

  trial: {
    id: 'lic-trial',
    tenantId: 'tenant-1',
    type: 'Trial' as const,
    totalSeats: 10,
    usedSeats: 8,
    status: 'Active' as const,
    expiresAt: new Date('2025-12-31T23:59:59Z'),
    createdAt: new Date('2025-12-01T00:00:00Z'),
    updatedAt: new Date('2025-12-15T00:00:00Z'),
  },

  expired: {
    id: 'lic-expired',
    tenantId: 'tenant-1',
    type: 'Professional' as const,
    totalSeats: 50,
    usedSeats: 30,
    status: 'Expired' as const,
    expiresAt: new Date('2025-01-01T23:59:59Z'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  },

  suspended: {
    id: 'lic-suspended',
    tenantId: 'tenant-1',
    type: 'Enterprise' as const,
    totalSeats: 200,
    usedSeats: 150,
    status: 'Suspended' as const,
    expiresAt: new Date('2026-06-30T23:59:59Z'),
    createdAt: new Date('2024-06-01T00:00:00Z'),
    updatedAt: new Date('2025-11-01T00:00:00Z'),
  },

  fullCapacity: {
    id: 'lic-full',
    tenantId: 'tenant-2',
    type: 'Professional' as const,
    totalSeats: 25,
    usedSeats: 25,
    status: 'Active' as const,
    expiresAt: new Date('2026-03-31T23:59:59Z'),
    createdAt: new Date('2025-03-01T00:00:00Z'),
    updatedAt: new Date('2025-12-10T00:00:00Z'),
  },

  tenant2: {
    id: 'lic-tenant2',
    tenantId: 'tenant-2',
    type: 'Enterprise' as const,
    totalSeats: 300,
    usedSeats: 120,
    status: 'Active' as const,
    expiresAt: new Date('2027-12-31T23:59:59Z'),
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-12-01T00:00:00Z'),
  },
};

export const mockLicensesList = Object.values(mockLicenses);
