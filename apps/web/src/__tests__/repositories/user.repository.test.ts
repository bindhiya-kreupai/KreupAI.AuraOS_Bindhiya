/**
 * User Repository Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '@/lib/repositories';
import { prisma } from '@aura/database';

vi.mock('@aura/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('UserRepository', () => {
  let repository: UserRepository;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed_password',
    tenantId: 'tenant-1',
    status: 'Active' as const,
    mfaEnabled: false,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafeUser = {
    id: 'user-1',
    email: 'test@example.com',
    status: 'Active' as const,
    tenantId: 'tenant-1',
    mfaEnabled: false,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    employee: null,
  };

  beforeEach(() => {
    repository = new UserRepository();
    vi.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByEmailSafe', () => {
    it('should find user without password field', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockSafeUser);

      const result = await repository.findByEmailSafe('test@example.com');

      expect(result).toEqual(mockSafeUser);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Object),
      });
    });
  });

  describe('findByIdSafe', () => {
    it('should find user by ID without password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockSafeUser);

      const result = await repository.findByIdSafe('user-1');

      expect(result).toEqual(mockSafeUser);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });
  });

  describe('findByTenant', () => {
    it('should find users by tenant with pagination', async () => {
      const mockUsers = [mockSafeUser];
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      const result = await repository.findByTenant({
        tenantId: 'tenant-1',
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter users by search query', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockSafeUser]);
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      await repository.findByTenant({
        tenantId: 'tenant-1',
        search: 'test',
        page: 1,
        limit: 10,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            email: {
              contains: 'test',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should filter users by status', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([mockSafeUser]);
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      await repository.findByTenant({
        tenantId: 'tenant-1',
        status: 'Active',
        page: 1,
        limit: 10,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            status: 'Active',
          }),
        })
      );
    });
  });

  describe('existsByEmail', () => {
    it('should return true if user exists', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      const result = await repository.existsByEmail('test@example.com');

      expect(result).toBe(true);
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        take: 1,
      });
    });

    it('should return false if user does not exist', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const result = await repository.existsByEmail('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create user without returning password', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'hashed_password',
        tenantId: 'tenant-1',
      };

      vi.mocked(prisma.user.create).mockResolvedValue(mockSafeUser);

      const result = await repository.createUser(userData);

      expect(result).toEqual(mockSafeUser);
      expect(result).not.toHaveProperty('password');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
        select: expect.any(Object),
      });
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const updateData = { status: 'Inactive' as const };
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockSafeUser,
        ...updateData,
      });

      const result = await repository.updateUser('user-1', updateData);

      expect(result.status).toBe('Inactive');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateData,
        select: expect.any(Object),
      });
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser);

      await repository.updateLastLogin('user-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          lastLogin: expect.any(Date),
        },
      });
    });
  });

  describe('deactivateUser', () => {
    it('should set user status to Inactive', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockSafeUser,
        status: 'Inactive',
      });

      const result = await repository.deactivateUser('user-1');

      expect(result.status).toBe('Inactive');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { status: 'Inactive' },
        select: expect.any(Object),
      });
    });
  });

  describe('countByTenant', () => {
    it('should count users by tenant', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(5);

      const result = await repository.countByTenant('tenant-1');

      expect(result).toBe(5);
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
      });
    });

    it('should count users by tenant and status', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(3);

      const result = await repository.countByTenant('tenant-1', 'Active');

      expect(result).toBe(3);
      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', status: 'Active' },
      });
    });
  });

  describe('findByIds', () => {
    it('should find multiple users by IDs', async () => {
      const mockUsers = [mockSafeUser];
      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

      const result = await repository.findByIds(['user-1', 'user-2']);

      expect(result).toEqual(mockUsers);
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['user-1', 'user-2'] } },
        select: expect.any(Object),
      });
    });
  });
});
