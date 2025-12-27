/**
 * Payroll API Consumer Contract Tests
 * Week 15-16: Contract Testing & API Testing
 *
 * Consumer-driven contract tests for Payroll API
 */

import { MatchersV3 } from '@pact-foundation/pact';
import {
  createPayrollApiProvider,
  responseMatchers,
  requestMatchers,
  payrollMatchers,
  cleanupPactTests,
} from '../pact-setup';

const { like, eachLike, integer, string } = MatchersV3;

describe('Payroll API Consumer Contract Tests', () => {
  const provider = createPayrollApiProvider();
  const API_URL = `http://localhost:${provider.opts.port}`;

  beforeAll(async () => {
    await provider.setup();
  });

  afterEach(async () => {
    await provider.verify();
  });

  afterAll(async () => {
    await cleanupPactTests(provider);
  });

  describe('GET /api/v1/payroll/payslips', () => {
    it('should return payslips for an employee', async () => {
      await provider.addInteraction({
        state: 'payslips exist for employee ID 1',
        uponReceiving: 'a request for payslips of employee ID 1',
        withRequest: {
          method: 'GET',
          path: '/api/v1/payroll/payslips',
          query: {
            employeeId: '1',
            page: '1',
            limit: '10',
          },
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              items: eachLike(payrollMatchers.payslip()),
              pagination: {
                page: integer(1),
                limit: integer(10),
                total: integer(12),
                totalPages: integer(2),
                hasNext: true,
                hasPrev: false,
              },
            },
            message: like('Success'),
          },
        },
      });

      const response = await fetch(
        `${API_URL}/api/v1/payroll/payslips?employeeId=1&page=1&limit=10`,
        {
          headers: {
            Authorization: 'Bearer eyJhbGc...',
            Accept: 'application/json',
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items).toBeInstanceOf(Array);
      expect(data.data.items[0]).toHaveProperty('basicSalary');
      expect(data.data.items[0]).toHaveProperty('netSalary');
    });

    it('should filter payslips by month', async () => {
      await provider.addInteraction({
        state: 'payslips exist for January 2024',
        uponReceiving: 'a request for January 2024 payslips',
        withRequest: {
          method: 'GET',
          path: '/api/v1/payroll/payslips',
          query: {
            month: '2024-01',
            page: '1',
            limit: '10',
          },
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              items: eachLike({
                ...payrollMatchers.payslip(),
                month: string('2024-01'),
              }),
              pagination: {
                page: integer(1),
                limit: integer(10),
                total: integer(100),
                totalPages: integer(10),
                hasNext: true,
                hasPrev: false,
              },
            },
            message: like('Success'),
          },
        },
      });

      const response = await fetch(
        `${API_URL}/api/v1/payroll/payslips?month=2024-01&page=1&limit=10`,
        {
          headers: {
            Authorization: 'Bearer eyJhbGc...',
            Accept: 'application/json',
          },
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items[0].month).toBe('2024-01');
    });
  });

  describe('GET /api/v1/payroll/payslips/:id', () => {
    it('should return a single payslip by ID', async () => {
      await provider.addInteraction({
        state: 'payslip with ID 1 exists',
        uponReceiving: 'a request for payslip with ID 1',
        withRequest: {
          method: 'GET',
          path: '/api/v1/payroll/payslips/1',
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: payrollMatchers.payslip(),
            message: like('Success'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/payroll/payslips/1`, {
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('basicSalary');
    });
  });

  describe('POST /api/v1/payroll/runs', () => {
    it('should initiate a payroll run', async () => {
      await provider.addInteraction({
        state: 'user has permission to run payroll',
        uponReceiving: 'a request to initiate payroll run',
        withRequest: {
          method: 'POST',
          path: '/api/v1/payroll/runs',
          headers: {
            ...requestMatchers.authHeader(),
            ...requestMatchers.jsonContentType(),
            Accept: 'application/json',
          },
          body: {
            month: string('2024-02'),
            departmentIds: eachLike(integer(1)),
          },
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: payrollMatchers.payrollRun(),
            message: like('Payroll run initiated successfully'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/payroll/runs`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          month: '2024-02',
          departmentIds: [1],
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('totalEmployees');
    });

    it('should return 403 when user lacks payroll permission', async () => {
      await provider.addInteraction({
        state: 'user does not have permission to run payroll',
        uponReceiving: 'an unauthorized payroll run request',
        withRequest: {
          method: 'POST',
          path: '/api/v1/payroll/runs',
          headers: {
            ...requestMatchers.authHeader(),
            ...requestMatchers.jsonContentType(),
            Accept: 'application/json',
          },
          body: {
            month: string('2024-02'),
          },
        },
        willRespondWith: responseMatchers.forbidden(),
      });

      const response = await fetch(`${API_URL}/api/v1/payroll/runs`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          month: '2024-02',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/payroll/runs/:id', () => {
    it('should return payroll run details', async () => {
      await provider.addInteraction({
        state: 'payroll run with ID 1 exists',
        uponReceiving: 'a request for payroll run ID 1',
        withRequest: {
          method: 'GET',
          path: '/api/v1/payroll/runs/1',
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: payrollMatchers.payrollRun(),
            message: like('Success'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/payroll/runs/1`, {
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('month');
      expect(data.data).toHaveProperty('totalEmployees');
      expect(data.data).toHaveProperty('status');
    });
  });

  describe('POST /api/v1/payroll/payslips/:id/download', () => {
    it('should generate payslip PDF download URL', async () => {
      await provider.addInteraction({
        state: 'payslip with ID 1 exists',
        uponReceiving: 'a request to download payslip PDF',
        withRequest: {
          method: 'POST',
          path: '/api/v1/payroll/payslips/1/download',
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: {
              downloadUrl: string('https://storage.example.com/payslips/1.pdf'),
              expiresAt: like('2024-02-01T00:00:00Z'),
            },
            message: like('Download URL generated'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/payroll/payslips/1/download`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('downloadUrl');
      expect(data.data.downloadUrl).toContain('.pdf');
    });
  });
});
