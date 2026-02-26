/**
 * @file test-data.fixture.ts
 * @description Playwright fixture for test data setup and teardown.
 *              Creates isolated test data per test and cleans up afterwards.
 */

import { test as base, request, type APIRequestContext } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TestEmployee {
  id:         string;
  firstName:  string;
  lastName:   string;
  email:      string;
  department: string;
  jobTitle:   string;
}

export interface TestLeaveRequest {
  id:         string;
  employeeId: string;
  leaveType:  string;
  startDate:  string;
  endDate:    string;
  status:     string;
}

export interface TestDataFixtures {
  /** API request context with admin auth token */
  apiContext: APIRequestContext;
  /** Creates a test employee and returns it; deleted in teardown */
  createTestEmployee: (overrides?: Partial<TestEmployee>) => Promise<TestEmployee>;
  /** Creates a test leave request */
  createTestLeaveRequest: (employeeId: string) => Promise<TestLeaveRequest>;
  /** Cleanup all data created during this test */
  cleanupTestData: () => Promise<void>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return uuidv4().slice(0, 8); }

function randomFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

// ── Extended test ─────────────────────────────────────────────────────────────

export const test = base.extend<TestDataFixtures>({
  /**
   * API request context authenticated as admin.
   */
  apiContext: async ({ playwright }, use) => {
    const baseURL = process.env.API_URL ?? 'http://localhost:4000';

    // Obtain admin token
    const loginResp = await playwright.request.newContext().then((ctx) =>
      ctx.post(`${baseURL}/api/auth/login`, {
        data: {
          email:    process.env.ADMIN_EMAIL    ?? 'admin@auraos.test',
          password: process.env.ADMIN_PASSWORD ?? 'Admin@123456',
        },
      }),
    );

    const token  = (await loginResp.json()).token ?? '';

    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    });

    await use(ctx);
    await ctx.dispose();
  },

  /**
   * Factory fixture to create test employees with auto-cleanup.
   */
  createTestEmployee: async ({ apiContext }, use) => {
    const createdIds: string[] = [];

    const factory = async (overrides: Partial<TestEmployee> = {}): Promise<TestEmployee> => {
      const tag = uid();
      const payload = {
        firstName:   `TestFirst${tag}`,
        lastName:    `TestLast${tag}`,
        email:       `test.${tag}@auraos-e2e.example`,
        department:  'Engineering',
        jobTitle:    'Software Engineer',
        employeeType: 'FULL_TIME',
        hireDate:    '2024-01-15',
        salary:      75_000,
        currency:    'AED',
        ...overrides,
      };

      const resp = await apiContext.post('/api/employees', { data: payload });

      if (!resp.ok()) {
        throw new Error(`Failed to create test employee: ${resp.status()} — ${await resp.text()}`);
      }

      const body = await resp.json();
      createdIds.push(body.id);
      return body as TestEmployee;
    };

    await use(factory);

    // Teardown: delete all created employees
    for (const id of createdIds) {
      await apiContext.delete(`/api/employees/${id}`).catch(() => { /* ignore */ });
    }
  },

  /**
   * Factory fixture to create test leave requests with auto-cleanup.
   */
  createTestLeaveRequest: async ({ apiContext }, use) => {
    const createdIds: string[] = [];

    const factory = async (employeeId: string): Promise<TestLeaveRequest> => {
      const startDate = randomFutureDate(7);
      const endDate   = randomFutureDate(10);
      const payload   = {
        employeeId,
        leaveType:  'ANNUAL',
        startDate,
        endDate,
        reason:     'E2E test leave request',
      };

      const resp = await apiContext.post('/api/leave/requests', { data: payload });

      if (!resp.ok()) {
        throw new Error(`Failed to create leave request: ${resp.status()} — ${await resp.text()}`);
      }

      const body = await resp.json();
      createdIds.push(body.id);
      return body as TestLeaveRequest;
    };

    await use(factory);

    // Teardown: cancel/delete all leave requests
    for (const id of createdIds) {
      await apiContext.patch(`/api/leave/requests/${id}/cancel`).catch(() => { /* ignore */ });
      await apiContext.delete(`/api/leave/requests/${id}`).catch(() => { /* ignore */ });
    }
  },

  /**
   * Manual cleanup hook for complex test data scenarios.
   */
  cleanupTestData: async ({ apiContext }, use) => {
    const cleanupTasks: Array<() => Promise<void>> = [];

    const registerCleanup = async (fn: () => Promise<void>): Promise<void> => {
      cleanupTasks.push(fn);
    };

    // Expose registerCleanup as the fixture value
    await use(registerCleanup as unknown as () => Promise<void>);

    // Run all registered cleanups in reverse order
    for (const task of cleanupTasks.reverse()) {
      await task().catch(() => { /* ignore individual failures */ });
    }
  },
});

export { expect } from '@playwright/test';
