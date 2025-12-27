/**
 * Employee API Consumer Contract Tests
 * Week 15-16: Contract Testing & API Testing
 *
 * Consumer-driven contract tests for Employee API
 * Defines expectations from the web client perspective
 */

import { MatchersV3 } from '@pact-foundation/pact';
import {
  createEmployeeApiProvider,
  responseMatchers,
  requestMatchers,
  employeeMatchers,
  commonMatchers,
  cleanupPactTests,
} from '../pact-setup';

const { like, eachLike, integer, string } = MatchersV3;

describe('Employee API Consumer Contract Tests', () => {
  const provider = createEmployeeApiProvider();
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

  describe('GET /api/v1/employees', () => {
    it('should return a paginated list of employees', async () => {
      // Define the expected interaction
      await provider.addInteraction({
        state: 'employees exist in the system',
        uponReceiving: 'a request for all employees',
        withRequest: {
          method: 'GET',
          path: '/api/v1/employees',
          query: {
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
              items: eachLike(employeeMatchers.employeeListItem()),
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

      // Execute the actual request
      const response = await fetch(`${API_URL}/api/v1/employees?page=1&limit=10`, {
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.items).toBeInstanceOf(Array);
      expect(data.data.pagination).toHaveProperty('page');
      expect(data.data.pagination).toHaveProperty('total');
    });

    it('should return employees filtered by department', async () => {
      await provider.addInteraction({
        state: 'employees in Engineering department exist',
        uponReceiving: 'a request for employees in Engineering department',
        withRequest: {
          method: 'GET',
          path: '/api/v1/employees',
          query: {
            department: 'Engineering',
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
                ...employeeMatchers.employeeListItem(),
                department: string('Engineering'),
              }),
              pagination: {
                page: integer(1),
                limit: integer(10),
                total: integer(25),
                totalPages: integer(3),
                hasNext: true,
                hasPrev: false,
              },
            },
            message: like('Success'),
          },
        },
      });

      const response = await fetch(
        `${API_URL}/api/v1/employees?department=Engineering&page=1&limit=10`,
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
      expect(data.data.items[0].department).toBe('Engineering');
    });

    it('should return employees matching search query', async () => {
      await provider.addInteraction({
        state: 'employee named John Doe exists',
        uponReceiving: 'a request to search for employees named John',
        withRequest: {
          method: 'GET',
          path: '/api/v1/employees',
          query: {
            search: 'John',
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
                ...employeeMatchers.employeeListItem(),
                firstName: string('John'),
              }),
              pagination: {
                page: integer(1),
                limit: integer(10),
                total: integer(5),
                totalPages: integer(1),
                hasNext: false,
                hasPrev: false,
              },
            },
            message: like('Success'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/employees?search=John&page=1&limit=10`, {
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.items[0].firstName).toBe('John');
    });

    it('should return 401 when not authenticated', async () => {
      await provider.addInteraction({
        state: 'user is not authenticated',
        uponReceiving: 'a request without authentication token',
        withRequest: {
          method: 'GET',
          path: '/api/v1/employees',
          headers: {
            Accept: 'application/json',
          },
        },
        willRespondWith: responseMatchers.unauthorized(),
      });

      const response = await fetch(`${API_URL}/api/v1/employees`, {
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('should return a single employee by ID', async () => {
      await provider.addInteraction({
        state: 'employee with ID 1 exists',
        uponReceiving: 'a request for employee with ID 1',
        withRequest: {
          method: 'GET',
          path: '/api/v1/employees/1',
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
            data: employeeMatchers.employee(),
            message: like('Success'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/employees/1`, {
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('employeeId');
      expect(data.data).toHaveProperty('firstName');
      expect(data.data).toHaveProperty('email');
    });

    it('should return 404 when employee does not exist', async () => {
      await provider.addInteraction({
        state: 'employee with ID 999999 does not exist',
        uponReceiving: 'a request for non-existent employee',
        withRequest: {
          method: 'GET',
          path: '/api/v1/employees/999999',
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: responseMatchers.notFound(),
      });

      const response = await fetch(`${API_URL}/api/v1/employees/999999`, {
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/employees', () => {
    it('should create a new employee', async () => {
      await provider.addInteraction({
        state: 'user has permission to create employees',
        uponReceiving: 'a request to create a new employee',
        withRequest: {
          method: 'POST',
          path: '/api/v1/employees',
          headers: {
            ...requestMatchers.authHeader(),
            ...requestMatchers.jsonContentType(),
            Accept: 'application/json',
          },
          body: employeeMatchers.createEmployeeRequest(),
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: {
            success: true,
            data: employeeMatchers.employee(),
            message: like('Employee created successfully'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/employees`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          dateOfBirth: '1990-01-15',
          gender: 'Male',
          departmentId: 1,
          positionId: 1,
          employmentType: 'Full-time',
          joiningDate: '2020-01-01',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.message).toContain('created');
    });

    it('should return 400 when validation fails', async () => {
      await provider.addInteraction({
        state: 'user has permission to create employees',
        uponReceiving: 'a request with invalid employee data',
        withRequest: {
          method: 'POST',
          path: '/api/v1/employees',
          headers: {
            ...requestMatchers.authHeader(),
            ...requestMatchers.jsonContentType(),
            Accept: 'application/json',
          },
          body: {
            firstName: '',
            email: 'invalid-email',
          },
        },
        willRespondWith: responseMatchers.badRequest(
          eachLike({
            field: string('firstName'),
            message: string('First name is required'),
          })
        ),
      });

      const response = await fetch(`${API_URL}/api/v1/employees`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName: '',
          email: 'invalid-email',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.errors).toBeInstanceOf(Array);
    });

    it('should return 403 when user lacks permission', async () => {
      await provider.addInteraction({
        state: 'user does not have permission to create employees',
        uponReceiving: 'a request from unauthorized user',
        withRequest: {
          method: 'POST',
          path: '/api/v1/employees',
          headers: {
            ...requestMatchers.authHeader(),
            ...requestMatchers.jsonContentType(),
            Accept: 'application/json',
          },
          body: employeeMatchers.createEmployeeRequest(),
        },
        willRespondWith: responseMatchers.forbidden(),
      });

      const response = await fetch(`${API_URL}/api/v1/employees`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify(employeeMatchers.createEmployeeRequest()),
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PUT /api/v1/employees/:id', () => {
    it('should update an existing employee', async () => {
      await provider.addInteraction({
        state: 'employee with ID 1 exists and user has permission to update',
        uponReceiving: 'a request to update employee with ID 1',
        withRequest: {
          method: 'PUT',
          path: '/api/v1/employees/1',
          headers: {
            ...requestMatchers.authHeader(),
            ...requestMatchers.jsonContentType(),
            Accept: 'application/json',
          },
          body: {
            firstName: string('John Updated'),
            lastName: string('Doe Updated'),
            phoneNumber: string('+9876543210'),
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
              ...employeeMatchers.employee(),
              firstName: string('John Updated'),
              lastName: string('Doe Updated'),
            },
            message: like('Employee updated successfully'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/employees/1`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName: 'John Updated',
          lastName: 'Doe Updated',
          phoneNumber: '+9876543210',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.firstName).toBe('John Updated');
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('should delete an employee', async () => {
      await provider.addInteraction({
        state: 'employee with ID 1 exists and user has permission to delete',
        uponReceiving: 'a request to delete employee with ID 1',
        withRequest: {
          method: 'DELETE',
          path: '/api/v1/employees/1',
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
            data: null,
            message: like('Employee deleted successfully'),
          },
        },
      });

      const response = await fetch(`${API_URL}/api/v1/employees/1`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted');
    });

    it('should return 404 when deleting non-existent employee', async () => {
      await provider.addInteraction({
        state: 'employee with ID 999999 does not exist',
        uponReceiving: 'a request to delete non-existent employee',
        withRequest: {
          method: 'DELETE',
          path: '/api/v1/employees/999999',
          headers: {
            ...requestMatchers.authHeader(),
            Accept: 'application/json',
          },
        },
        willRespondWith: responseMatchers.notFound(),
      });

      const response = await fetch(`${API_URL}/api/v1/employees/999999`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer eyJhbGc...',
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
