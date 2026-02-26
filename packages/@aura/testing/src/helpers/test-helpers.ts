/**
 * Common Test Utilities
 *
 * @module @aura/testing
 */

// ---------------------------------------------------------------------------
// Timing helpers
// ---------------------------------------------------------------------------

/**
 * Wait for a specified number of milliseconds.
 * Useful for testing async operations with delays.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait until a condition becomes true, polling every `intervalMs`.
 * Throws if the condition is not met within `timeoutMs`.
 */
export async function waitUntil(
  condition: () => boolean | Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 50
): Promise<void> {
  const start = Date.now();
  while (true) {
    if (await condition()) return;
    if (Date.now() - start > timeoutMs) {
      throw new Error(`waitUntil timed out after ${timeoutMs}ms`);
    }
    await wait(intervalMs);
  }
}

// ---------------------------------------------------------------------------
// Mock HTTP request / response
// ---------------------------------------------------------------------------

export interface MockRequest {
  method: string;
  url: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
  user?: { id: string; tenantId: string; roles: string[] };
  ip: string;
}

export interface MockResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
  send(body: unknown): MockResponse;
  set(key: string, value: string): MockResponse;
  end(): MockResponse;
}

/**
 * Create a mock Express-compatible request object.
 */
export function createMockRequest(
  overrides: Partial<MockRequest> = {}
): MockRequest {
  return {
    method: 'GET',
    url: '/api/test',
    path: '/api/test',
    params: {},
    query: {},
    body: {},
    headers: { 'content-type': 'application/json' },
    ip: '127.0.0.1',
    ...overrides,
  };
}

/**
 * Create a mock Express-compatible response object.
 * Records all interactions for assertions.
 */
export function createMockResponse(): MockResponse & {
  _assertStatus(code: number): void;
  _assertBody(expected: unknown): void;
  _assertHeader(key: string, value: string): void;
} {
  const res = {
    statusCode: 200,
    body: null as unknown,
    headers: {} as Record<string, string>,

    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    send(body: unknown) {
      res.body = body;
      return res;
    },
    set(key: string, value: string) {
      res.headers[key.toLowerCase()] = value;
      return res;
    },
    end() {
      return res;
    },

    // Test assertion helpers
    _assertStatus(code: number) {
      if (res.statusCode !== code) {
        throw new Error(
          `Expected status ${code} but got ${res.statusCode}. Body: ${JSON.stringify(res.body)}`
        );
      }
    },
    _assertBody(expected: unknown) {
      const bodyStr = JSON.stringify(res.body);
      const expectedStr = JSON.stringify(expected);
      if (bodyStr !== expectedStr) {
        throw new Error(`Expected body ${expectedStr} but got ${bodyStr}`);
      }
    },
    _assertHeader(key: string, value: string) {
      const actual = res.headers[key.toLowerCase()];
      if (actual !== value) {
        throw new Error(`Expected header ${key}=${value} but got ${actual}`);
      }
    },
  };

  return res;
}

// ---------------------------------------------------------------------------
// Authenticated request factory
// ---------------------------------------------------------------------------

/**
 * Create a mock request with a pre-populated `user` (simulates JWT middleware).
 */
export function createAuthenticatedRequest(
  user: { id: string; tenantId: string; roles?: string[] },
  overrides: Partial<MockRequest> = {}
): MockRequest {
  return createMockRequest({
    user: { id: user.id, tenantId: user.tenantId, roles: user.roles ?? ['employee'] },
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer test-jwt-token-for-${user.id}`,
    },
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/**
 * Assert that a promise rejects with a specific error type and message.
 */
export async function assertRejects(
  fn: () => Promise<unknown>,
  expectedMessage?: string | RegExp
): Promise<Error> {
  try {
    await fn();
    throw new Error('Expected function to throw but it did not');
  } catch (err) {
    if (err instanceof Error && err.message === 'Expected function to throw but it did not') {
      throw err;
    }
    const error = err instanceof Error ? err : new Error(String(err));
    if (expectedMessage) {
      const matches =
        typeof expectedMessage === 'string'
          ? error.message.includes(expectedMessage)
          : expectedMessage.test(error.message);

      if (!matches) {
        throw new Error(
          `Expected error message matching "${expectedMessage}" but got "${error.message}"`
        );
      }
    }
    return error;
  }
}

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

/**
 * Deep clone an object (simple JSON-based clone).
 * Sufficient for plain test data objects (no dates, functions, or circular refs).
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Pick specified keys from an object.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

/**
 * Omit specified keys from an object.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}
