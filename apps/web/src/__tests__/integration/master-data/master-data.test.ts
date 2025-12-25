/**
 * Master Data API Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/master-data/[entity]/route';
import { setupTestDb, teardownTestDb, resetDatabase } from '@/__tests__/helpers';
import { mockUsers, mockCountries } from '@/__tests__/fixtures';
import { generateAccessToken } from '@/lib/auth/jwt';
import type { PrismaClient } from '@prisma/client';

describe('Master Data API Integration Tests', () => {
  let prisma: PrismaClient;
  let adminToken: string;

  beforeAll(async () => {
    prisma = await setupTestDb();
    await resetDatabase(prisma);

    adminToken = generateAccessToken({
      userId: mockUsers.admin.id,
      email: mockUsers.admin.email,
      tenantId: mockUsers.admin.tenantId,
      sessionId: 'session-1',
    });
  });

  afterAll(async () => {
    await teardownTestDb(prisma);
  });

  describe('GET /api/master-data/countries', () => {
    it('should list all countries', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'countries' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should filter countries by search query', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries?search=United',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'countries' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      expect(
        data.data.every((country: any) =>
          country.name.toLowerCase().includes('united')
        )
      ).toBe(true);
    });

    it('should filter by active status', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries?isActive=true',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'countries' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((country: any) => country.isActive === true)).toBe(
        true
      );
    });

    it('should paginate results', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries?page=1&limit=2',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'countries' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.length).toBeLessThanOrEqual(2);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(2);
    });
  });

  describe('GET /api/master-data/states', () => {
    it('should list all states', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/states',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'states' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter states by country', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/states?countryId=country-us',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'states' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((state: any) => state.countryId === 'country-us')).toBe(
        true
      );
    });
  });

  describe('GET /api/master-data/cities', () => {
    it('should list all cities', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/cities',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'cities' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter cities by state', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/cities?stateId=state-ca',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'cities' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((city: any) => city.stateId === 'state-ca')).toBe(
        true
      );
    });
  });

  describe('GET /api/master-data/currencies', () => {
    it('should list all currencies', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/currencies',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'currencies' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should include currency symbols', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/currencies',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'currencies' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.every((currency: any) => currency.symbol)).toBe(true);
    });
  });

  describe('GET /api/master-data/languages', () => {
    it('should list all languages', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/languages',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'languages' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/master-data/countries', () => {
    it('should create new country', async () => {
      const newCountry = {
        name: 'Australia',
        code: 'AU',
        isActive: true,
      };

      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(newCountry),
        }
      );

      const response = await POST(request, { params: { entity: 'countries' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Australia');
      expect(data.data.code).toBe('AU');

      // Verify country was created
      const createdCountry = await prisma.country.findFirst({
        where: { code: 'AU' },
      });
      expect(createdCountry).toBeDefined();
    });

    it('should return 400 for duplicate country code', async () => {
      const duplicateCountry = {
        name: 'United States Duplicate',
        code: mockCountries[0].code, // Existing code
        isActive: true,
      };

      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(duplicateCountry),
        }
      );

      const response = await POST(request, { params: { entity: 'countries' } });

      expect(response.status).toBe(400);
    });
  });

  describe('Invalid Entity Type', () => {
    it('should return 400 for invalid entity type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/invalid-entity',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const response = await GET(request, { params: { entity: 'invalid-entity' } });

      expect(response.status).toBe(400);
    });
  });

  describe('Authentication', () => {
    it('should return 401 without authentication', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/master-data/countries',
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: { entity: 'countries' } });

      expect(response.status).toBe(401);
    });
  });
});
