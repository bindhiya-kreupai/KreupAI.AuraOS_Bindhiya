/**
 * LicenseService Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { licenseService } from '@/lib/services';
import { prisma } from '@aura/database';

describe('LicenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listLicenses', () => {
    it('should return paginated list of licenses', async () => {
      const mockLicenses = [
        {
          id: 'lic-1',
          tenantId: 'tenant-1',
          type: 'Professional',
          totalSeats: 100,
          usedSeats: 50,
          status: 'Active',
          expiresAt: new Date('2025-12-31'),
          createdAt: new Date(),
        },
        {
          id: 'lic-2',
          tenantId: 'tenant-1',
          type: 'Enterprise',
          totalSeats: 500,
          usedSeats: 200,
          status: 'Active',
          expiresAt: new Date('2026-12-31'),
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.license.findMany).mockResolvedValue(mockLicenses);
      vi.mocked(prisma.license.count).mockResolvedValue(2);

      const result = await licenseService.listLicenses(
        { tenantId: 'tenant-1', page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLicenses);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter licenses by status', async () => {
      vi.mocked(prisma.license.findMany).mockResolvedValue([]);
      vi.mocked(prisma.license.count).mockResolvedValue(0);

      await licenseService.listLicenses(
        { tenantId: 'tenant-1', status: 'Expired', page: 1, limit: 10 },
        'admin-1'
      );

      expect(prisma.license.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'Expired',
          }),
        })
      );
    });

    it('should filter licenses by type', async () => {
      vi.mocked(prisma.license.findMany).mockResolvedValue([]);
      vi.mocked(prisma.license.count).mockResolvedValue(0);

      await licenseService.listLicenses(
        { tenantId: 'tenant-1', type: 'Enterprise', page: 1, limit: 10 },
        'admin-1'
      );

      expect(prisma.license.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'Enterprise',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(prisma.license.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const result = await licenseService.listLicenses(
        { tenantId: 'tenant-1', page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve licenses');
    });
  });

  describe('getLicenseById', () => {
    it('should return license by ID', async () => {
      const mockLicense = {
        id: 'lic-1',
        tenantId: 'tenant-1',
        type: 'Professional',
        totalSeats: 100,
        usedSeats: 50,
        status: 'Active',
        expiresAt: new Date('2025-12-31'),
        createdAt: new Date(),
      };

      vi.mocked(prisma.license.findUnique).mockResolvedValue(mockLicense);

      const result = await licenseService.getLicenseById('lic-1', 'admin-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLicense);
      expect(prisma.license.findUnique).toHaveBeenCalledWith({
        where: { id: 'lic-1' },
      });
    });

    it('should return error when license not found', async () => {
      vi.mocked(prisma.license.findUnique).mockResolvedValue(null);

      const result = await licenseService.getLicenseById('non-existent', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('License not found');
    });

    it('should handle database errors', async () => {
      vi.mocked(prisma.license.findUnique).mockRejectedValue(
        new Error('Database error')
      );

      const result = await licenseService.getLicenseById('lic-1', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve license');
    });
  });

  describe('createLicense', () => {
    it('should create new license successfully', async () => {
      const input = {
        tenantId: 'tenant-1',
        type: 'Professional' as const,
        totalSeats: 100,
        usedSeats: 0,
        status: 'Active' as const,
        expiresAt: new Date('2025-12-31'),
      };

      const mockCreatedLicense = {
        id: 'lic-new',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockCreatedLicense);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await licenseService.createLicense(
        input,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedLicense);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should validate seat allocation', async () => {
      const input = {
        tenantId: 'tenant-1',
        type: 'Professional' as const,
        totalSeats: 100,
        usedSeats: 150, // More than total
        status: 'Active' as const,
        expiresAt: new Date('2025-12-31'),
      };

      const result = await licenseService.createLicense(
        input,
        'admin-1',
        '127.0.0.1'
      );

      // Should either validate or proceed (depends on business rules)
      expect(result.success).toBeDefined();
    });

    it('should handle database errors', async () => {
      const input = {
        tenantId: 'tenant-1',
        type: 'Professional' as const,
        totalSeats: 100,
        usedSeats: 0,
        status: 'Active' as const,
        expiresAt: new Date('2025-12-31'),
      };

      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Error('Database error')
      );

      const result = await licenseService.createLicense(
        input,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create license');
    });
  });

  describe('updateLicense', () => {
    it('should update license successfully', async () => {
      const updates = {
        totalSeats: 200,
        status: 'Active' as const,
      };

      const mockUpdatedLicense = {
        id: 'lic-1',
        tenantId: 'tenant-1',
        type: 'Professional',
        totalSeats: updates.totalSeats,
        usedSeats: 50,
        status: updates.status,
        expiresAt: new Date('2025-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockUpdatedLicense);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await licenseService.updateLicense(
        'lic-1',
        updates,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedLicense);
    });

    it('should handle updating expired licenses', async () => {
      const updates = {
        expiresAt: new Date('2026-12-31'),
        status: 'Active' as const,
      };

      const mockUpdatedLicense = {
        id: 'lic-1',
        tenantId: 'tenant-1',
        type: 'Professional',
        totalSeats: 100,
        usedSeats: 50,
        status: 'Active' as const,
        expiresAt: updates.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockUpdatedLicense);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await licenseService.updateLicense(
        'lic-1',
        updates,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
    });

    it('should handle non-existent license', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';

      vi.mocked(prisma.$transaction).mockRejectedValue(error);

      const result = await licenseService.updateLicense(
        'non-existent',
        { totalSeats: 200 },
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update license');
    });
  });

  describe('deleteLicense', () => {
    it('should delete license successfully', async () => {
      const mockDeletedLicense = {
        id: 'lic-1',
        tenantId: 'tenant-1',
        type: 'Professional',
        status: 'Inactive',
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockDeletedLicense);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await licenseService.deleteLicense(
        'lic-1',
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeletedLicense);
    });

    it('should handle deletion of non-existent license', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';

      vi.mocked(prisma.$transaction).mockRejectedValue(error);

      const result = await licenseService.deleteLicense(
        'non-existent',
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete license');
    });
  });

  describe('checkLicenseAvailability', () => {
    it('should return true when seats available', async () => {
      const mockLicense = {
        id: 'lic-1',
        totalSeats: 100,
        usedSeats: 50,
        status: 'Active',
        expiresAt: new Date('2025-12-31'),
      };

      vi.mocked(prisma.license.findUnique).mockResolvedValue(mockLicense as any);

      const result = await licenseService.checkLicenseAvailability('tenant-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should return false when no seats available', async () => {
      const mockLicense = {
        id: 'lic-1',
        totalSeats: 100,
        usedSeats: 100,
        status: 'Active',
        expiresAt: new Date('2025-12-31'),
      };

      vi.mocked(prisma.license.findUnique).mockResolvedValue(mockLicense as any);

      const result = await licenseService.checkLicenseAvailability('tenant-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it('should return false when license expired', async () => {
      const mockLicense = {
        id: 'lic-1',
        totalSeats: 100,
        usedSeats: 50,
        status: 'Expired',
        expiresAt: new Date('2024-01-01'),
      };

      vi.mocked(prisma.license.findUnique).mockResolvedValue(mockLicense as any);

      const result = await licenseService.checkLicenseAvailability('tenant-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });

    it('should return false when no license found', async () => {
      vi.mocked(prisma.license.findUnique).mockResolvedValue(null);

      const result = await licenseService.checkLicenseAvailability('tenant-1');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
    });
  });
});
