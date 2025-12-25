/**
 * Database Seeding Helper for Tests
 *
 * Provides utilities to seed test database with fixture data
 */

import type { PrismaClient } from '@prisma/client';
import {
  mockUsersList,
  mockLicensesList,
  mockCountries,
  mockStates,
  mockCities,
  mockCurrencies,
  mockLanguages,
} from '../fixtures';

/**
 * Seed database with test data
 */
export async function seedDatabase(prisma: PrismaClient) {
  console.log('🌱 Seeding test database...');

  try {
    // Clear existing data in reverse dependency order
    await clearDatabase(prisma);

    // Seed master data first (no dependencies)
    await seedMasterData(prisma);

    // Seed tenants
    await seedTenants(prisma);

    // Seed roles
    await seedRoles(prisma);

    // Seed licenses
    await seedLicenses(prisma);

    // Seed users
    await seedUsers(prisma);

    console.log('✅ Test database seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed test database:', error);
    throw error;
  }
}

/**
 * Clear all data from test database
 */
export async function clearDatabase(prisma: PrismaClient) {
  console.log('🧹 Clearing test database...');

  try {
    // Delete in reverse dependency order
    await prisma.auditLog.deleteMany({});
    await prisma.userSession.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.license.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.state.deleteMany({});
    await prisma.country.deleteMany({});
    await prisma.currency.deleteMany({});
    await prisma.language.deleteMany({});

    console.log('✅ Test database cleared');
  } catch (error) {
    console.error('❌ Failed to clear test database:', error);
    throw error;
  }
}

/**
 * Seed master data (countries, states, cities, currencies, languages)
 */
async function seedMasterData(prisma: PrismaClient) {
  console.log('  → Seeding master data...');

  // Countries
  await prisma.country.createMany({
    data: mockCountries,
    skipDuplicates: true,
  });

  // States
  await prisma.state.createMany({
    data: mockStates,
    skipDuplicates: true,
  });

  // Cities
  await prisma.city.createMany({
    data: mockCities,
    skipDuplicates: true,
  });

  // Currencies
  await prisma.currency.createMany({
    data: mockCurrencies,
    skipDuplicates: true,
  });

  // Languages
  await prisma.language.createMany({
    data: mockLanguages,
    skipDuplicates: true,
  });

  console.log('  ✓ Master data seeded');
}

/**
 * Seed tenants
 */
async function seedTenants(prisma: PrismaClient) {
  console.log('  → Seeding tenants...');

  await prisma.tenant.createMany({
    data: [
      {
        id: 'tenant-1',
        name: 'Acme Corporation',
        status: 'Active',
        subdomain: 'acme',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
      {
        id: 'tenant-2',
        name: 'Tech Innovations Inc',
        status: 'Active',
        subdomain: 'techinnovations',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('  ✓ Tenants seeded');
}

/**
 * Seed roles
 */
async function seedRoles(prisma: PrismaClient) {
  console.log('  → Seeding roles...');

  await prisma.role.createMany({
    data: [
      {
        id: 'role-admin',
        name: 'Administrator',
        description: 'Full system access',
        permissions: JSON.stringify({
          users: ['create', 'read', 'update', 'delete'],
          roles: ['create', 'read', 'update', 'delete'],
          licenses: ['create', 'read', 'update', 'delete'],
          settings: ['read', 'update'],
        }),
        isSystemRole: true,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
      {
        id: 'role-user',
        name: 'User',
        description: 'Standard user access',
        permissions: JSON.stringify({
          profile: ['read', 'update'],
          dashboard: ['read'],
        }),
        isSystemRole: true,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
      {
        id: 'role-manager',
        name: 'Manager',
        description: 'Team management access',
        permissions: JSON.stringify({
          users: ['read', 'update'],
          reports: ['read', 'create'],
          dashboard: ['read'],
        }),
        isSystemRole: false,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('  ✓ Roles seeded');
}

/**
 * Seed licenses
 */
async function seedLicenses(prisma: PrismaClient) {
  console.log('  → Seeding licenses...');

  await prisma.license.createMany({
    data: mockLicensesList,
    skipDuplicates: true,
  });

  console.log('  ✓ Licenses seeded');
}

/**
 * Seed users (without employee data for now)
 */
async function seedUsers(prisma: PrismaClient) {
  console.log('  → Seeding users...');

  const usersWithoutEmployee = mockUsersList.map(({ employee, ...user }) => user);

  await prisma.user.createMany({
    data: usersWithoutEmployee,
    skipDuplicates: true,
  });

  console.log('  ✓ Users seeded');
}

/**
 * Reset database to clean state and reseed
 */
export async function resetDatabase(prisma: PrismaClient) {
  await clearDatabase(prisma);
  await seedDatabase(prisma);
}

/**
 * Seed specific entity type
 */
export async function seedEntity(
  prisma: PrismaClient,
  entity: 'users' | 'licenses' | 'countries' | 'states' | 'cities' | 'currencies' | 'languages',
  data: any[]
) {
  switch (entity) {
    case 'users':
      await prisma.user.createMany({ data, skipDuplicates: true });
      break;
    case 'licenses':
      await prisma.license.createMany({ data, skipDuplicates: true });
      break;
    case 'countries':
      await prisma.country.createMany({ data, skipDuplicates: true });
      break;
    case 'states':
      await prisma.state.createMany({ data, skipDuplicates: true });
      break;
    case 'cities':
      await prisma.city.createMany({ data, skipDuplicates: true });
      break;
    case 'currencies':
      await prisma.currency.createMany({ data, skipDuplicates: true });
      break;
    case 'languages':
      await prisma.language.createMany({ data, skipDuplicates: true });
      break;
  }
}
