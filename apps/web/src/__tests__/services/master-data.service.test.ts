/**
 * MasterDataService Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { masterDataService } from '@/lib/services';
import { prisma } from '@aura/database';

describe('MasterDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listEntities - Countries', () => {
    it('should return paginated list of countries', async () => {
      const mockCountries = [
        {
          id: 'country-1',
          name: 'United States',
          code: 'US',
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 'country-2',
          name: 'United Kingdom',
          code: 'GB',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.country.findMany).mockResolvedValue(mockCountries);
      vi.mocked(prisma.country.count).mockResolvedValue(2);

      const result = await masterDataService.listEntities(
        'countries',
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCountries);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter countries by search query', async () => {
      vi.mocked(prisma.country.findMany).mockResolvedValue([]);
      vi.mocked(prisma.country.count).mockResolvedValue(0);

      await masterDataService.listEntities(
        'countries',
        { search: 'United', page: 1, limit: 10 },
        'admin-1'
      );

      expect(prisma.country.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'United', mode: 'insensitive' } },
              { code: { contains: 'United', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should filter countries by active status', async () => {
      vi.mocked(prisma.country.findMany).mockResolvedValue([]);
      vi.mocked(prisma.country.count).mockResolvedValue(0);

      await masterDataService.listEntities(
        'countries',
        { isActive: true, page: 1, limit: 10 },
        'admin-1'
      );

      expect(prisma.country.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });

  describe('listEntities - States', () => {
    it('should return list of states', async () => {
      const mockStates = [
        {
          id: 'state-1',
          name: 'California',
          code: 'CA',
          countryId: 'country-1',
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 'state-2',
          name: 'Texas',
          code: 'TX',
          countryId: 'country-1',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.state.findMany).mockResolvedValue(mockStates);
      vi.mocked(prisma.state.count).mockResolvedValue(2);

      const result = await masterDataService.listEntities(
        'states',
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStates);
    });

    it('should filter states by country', async () => {
      vi.mocked(prisma.state.findMany).mockResolvedValue([]);
      vi.mocked(prisma.state.count).mockResolvedValue(0);

      await masterDataService.listEntities(
        'states',
        { countryId: 'country-1', page: 1, limit: 10 },
        'admin-1'
      );

      expect(prisma.state.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            countryId: 'country-1',
          }),
        })
      );
    });
  });

  describe('listEntities - Cities', () => {
    it('should return list of cities', async () => {
      const mockCities = [
        {
          id: 'city-1',
          name: 'Los Angeles',
          stateId: 'state-1',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.city.findMany).mockResolvedValue(mockCities);
      vi.mocked(prisma.city.count).mockResolvedValue(1);

      const result = await masterDataService.listEntities(
        'cities',
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCities);
    });

    it('should filter cities by state', async () => {
      vi.mocked(prisma.city.findMany).mockResolvedValue([]);
      vi.mocked(prisma.city.count).mockResolvedValue(0);

      await masterDataService.listEntities(
        'cities',
        { stateId: 'state-1', page: 1, limit: 10 },
        'admin-1'
      );

      expect(prisma.city.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stateId: 'state-1',
          }),
        })
      );
    });
  });

  describe('listEntities - Currencies', () => {
    it('should return list of currencies', async () => {
      const mockCurrencies = [
        {
          id: 'curr-1',
          name: 'US Dollar',
          code: 'USD',
          symbol: '$',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.currency.findMany).mockResolvedValue(mockCurrencies);
      vi.mocked(prisma.currency.count).mockResolvedValue(1);

      const result = await masterDataService.listEntities(
        'currencies',
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCurrencies);
    });
  });

  describe('listEntities - Languages', () => {
    it('should return list of languages', async () => {
      const mockLanguages = [
        {
          id: 'lang-1',
          name: 'English',
          code: 'en',
          isActive: true,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.language.findMany).mockResolvedValue(mockLanguages);
      vi.mocked(prisma.language.count).mockResolvedValue(1);

      const result = await masterDataService.listEntities(
        'languages',
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLanguages);
    });
  });

  describe('listEntities - Invalid Entity', () => {
    it('should return error for invalid entity type', async () => {
      const result = await masterDataService.listEntities(
        'invalid-entity' as any,
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid entity type');
    });
  });

  describe('getEntityById', () => {
    it('should return country by ID', async () => {
      const mockCountry = {
        id: 'country-1',
        name: 'United States',
        code: 'US',
        isActive: true,
        createdAt: new Date(),
      };

      vi.mocked(prisma.country.findUnique).mockResolvedValue(mockCountry);

      const result = await masterDataService.getEntityById(
        'countries',
        'country-1',
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCountry);
    });

    it('should return state by ID', async () => {
      const mockState = {
        id: 'state-1',
        name: 'California',
        code: 'CA',
        countryId: 'country-1',
        isActive: true,
        createdAt: new Date(),
      };

      vi.mocked(prisma.state.findUnique).mockResolvedValue(mockState);

      const result = await masterDataService.getEntityById(
        'states',
        'state-1',
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockState);
    });

    it('should return error when entity not found', async () => {
      vi.mocked(prisma.country.findUnique).mockResolvedValue(null);

      const result = await masterDataService.getEntityById(
        'countries',
        'non-existent',
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle invalid entity type', async () => {
      const result = await masterDataService.getEntityById(
        'invalid' as any,
        'id-1',
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid entity type');
    });
  });

  describe('createEntity', () => {
    it('should create country successfully', async () => {
      const input = {
        name: 'Canada',
        code: 'CA',
        isActive: true,
      };

      const mockCreatedCountry = {
        id: 'country-new',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockCreatedCountry);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await masterDataService.createEntity(
        'countries',
        input,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedCountry);
    });

    it('should create state with country reference', async () => {
      const input = {
        name: 'Ontario',
        code: 'ON',
        countryId: 'country-2',
        isActive: true,
      };

      const mockCreatedState = {
        id: 'state-new',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockCreatedState);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await masterDataService.createEntity(
        'states',
        input,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedState);
    });

    it('should handle duplicate entries', async () => {
      const input = {
        name: 'United States',
        code: 'US',
        isActive: true,
      };

      const duplicateError = new Error('Unique constraint violation');
      (duplicateError as any).code = 'P2002';

      vi.mocked(prisma.$transaction).mockRejectedValue(duplicateError);

      const result = await masterDataService.createEntity(
        'countries',
        input,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
    });

    it('should handle invalid entity type', async () => {
      const result = await masterDataService.createEntity(
        'invalid' as any,
        { name: 'Test' },
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid entity type');
    });
  });

  describe('updateEntity', () => {
    it('should update country successfully', async () => {
      const updates = {
        name: 'United States of America',
        isActive: true,
      };

      const mockUpdatedCountry = {
        id: 'country-1',
        name: updates.name,
        code: 'US',
        isActive: updates.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockUpdatedCountry);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await masterDataService.updateEntity(
        'countries',
        'country-1',
        updates,
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedCountry);
    });

    it('should handle non-existent entity', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';

      vi.mocked(prisma.$transaction).mockRejectedValue(error);

      const result = await masterDataService.updateEntity(
        'countries',
        'non-existent',
        { name: 'New Name' },
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
    });

    it('should handle invalid entity type', async () => {
      const result = await masterDataService.updateEntity(
        'invalid' as any,
        'id-1',
        { name: 'Test' },
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid entity type');
    });
  });

  describe('deleteEntity', () => {
    it('should delete country successfully', async () => {
      const mockDeletedCountry = {
        id: 'country-1',
        name: 'United States',
        code: 'US',
        isActive: false,
      };

      const mockTransaction = vi.fn().mockResolvedValue(mockDeletedCountry);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      const result = await masterDataService.deleteEntity(
        'countries',
        'country-1',
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDeletedCountry);
    });

    it('should handle deletion of non-existent entity', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';

      vi.mocked(prisma.$transaction).mockRejectedValue(error);

      const result = await masterDataService.deleteEntity(
        'countries',
        'non-existent',
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
    });

    it('should handle foreign key constraints', async () => {
      const fkError = new Error('Foreign key constraint violation');
      (fkError as any).code = 'P2003';

      vi.mocked(prisma.$transaction).mockRejectedValue(fkError);

      const result = await masterDataService.deleteEntity(
        'countries',
        'country-1',
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
    });

    it('should handle invalid entity type', async () => {
      const result = await masterDataService.deleteEntity(
        'invalid' as any,
        'id-1',
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid entity type');
    });
  });

  describe('Database Errors', () => {
    it('should handle connection errors gracefully', async () => {
      vi.mocked(prisma.country.findMany).mockRejectedValue(
        new Error('Connection timeout')
      );

      const result = await masterDataService.listEntities(
        'countries',
        { page: 1, limit: 10 },
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to retrieve');
    });

    it('should handle transaction errors', async () => {
      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Error('Transaction rollback')
      );

      const result = await masterDataService.createEntity(
        'countries',
        { name: 'Test', code: 'TS', isActive: true },
        'admin-1',
        '127.0.0.1'
      );

      expect(result.success).toBe(false);
    });
  });
});
