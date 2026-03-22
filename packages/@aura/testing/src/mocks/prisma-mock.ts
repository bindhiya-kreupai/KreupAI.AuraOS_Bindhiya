/**
 * Mock PrismaClient for unit tests
 *
 * Uses a Proxy to intercept all property accesses and return jest-compatible
 * mock functions. Works with vitest and jest.
 *
 * Usage:
 *   import { createPrismaMock, PrismaMock } from '@aura/testing';
 *
 *   let prisma: PrismaMock;
 *   beforeEach(() => { prisma = createPrismaMock(); });
 *
 *   it('fetches employee', async () => {
 *     const emp = createEmployee();
 *     prisma.employee.findUnique.mockResolvedValueOnce(emp);
 *     const result = await myService.getEmployee(emp.id, prisma);
 *     expect(prisma.employee.findUnique).toHaveBeenCalledWith({ where: { id: emp.id } });
 *   });
 *
 * @module @aura/testing
 */

// ---------------------------------------------------------------------------
// Mock function type (compatible with jest and vitest)
// ---------------------------------------------------------------------------

export interface MockFn<TArgs extends unknown[] = unknown[], TReturn = unknown> {
  (...args: TArgs): TReturn;
  mockResolvedValue(value: Awaited<TReturn>): this;
  mockResolvedValueOnce(value: Awaited<TReturn>): this;
  mockRejectedValue(error: unknown): this;
  mockRejectedValueOnce(error: unknown): this;
  mockReturnValue(value: TReturn): this;
  mockReturnValueOnce(value: TReturn): this;
  mockImplementation(fn: (...args: TArgs) => TReturn): this;
  mockImplementationOnce(fn: (...args: TArgs) => TReturn): this;
  mockClear(): this;
  mockReset(): this;
  calls: TArgs[];
  results: Array<{ type: 'return' | 'throw'; value: unknown }>;
}

// ---------------------------------------------------------------------------
// Internal mock function factory (no jest/vitest dependency)
// ---------------------------------------------------------------------------

function createMockFn<TArgs extends unknown[] = unknown[], TReturn = unknown>(): MockFn<TArgs, TReturn> {
  const resolvedValues: Array<Awaited<TReturn>> = [];
  const rejectedErrors: unknown[] = [];
  const implementations: Array<((...args: TArgs) => TReturn) | null> = [];
  let defaultResolvedValue: Awaited<TReturn> | undefined = undefined;
  let defaultRejectedError: unknown = undefined;
  let defaultImpl: ((...args: TArgs) => TReturn) | null = null;

  const calls: TArgs[] = [];
  const results: Array<{ type: 'return' | 'throw'; value: unknown }> = [];

  const fn = function (...args: TArgs): TReturn {
    calls.push(args);

    const impl = implementations.shift();
    const rejected = rejectedErrors.shift();
    const resolved = resolvedValues.shift();

    if (rejected !== undefined) {
      const err = rejected;
      results.push({ type: 'throw', value: err });
      return Promise.reject(err) as unknown as TReturn;
    }
    if (impl) {
      const result = impl(...args);
      results.push({ type: 'return', value: result });
      return result;
    }
    if (resolved !== undefined) {
      results.push({ type: 'return', value: resolved });
      return Promise.resolve(resolved) as unknown as TReturn;
    }
    if (defaultRejectedError !== undefined) {
      results.push({ type: 'throw', value: defaultRejectedError });
      return Promise.reject(defaultRejectedError) as unknown as TReturn;
    }
    if (defaultImpl) {
      const result = defaultImpl(...args);
      results.push({ type: 'return', value: result });
      return result;
    }
    const defaultReturn = Promise.resolve(defaultResolvedValue) as unknown as TReturn;
    results.push({ type: 'return', value: defaultReturn });
    return defaultReturn;
  } as unknown as MockFn<TArgs, TReturn>;

  fn.calls = calls;
  fn.results = results;

  fn.mockResolvedValue = (value) => { defaultResolvedValue = value; return fn; };
  fn.mockResolvedValueOnce = (value) => { resolvedValues.push(value); return fn; };
  fn.mockRejectedValue = (error) => { defaultRejectedError = error; return fn; };
  fn.mockRejectedValueOnce = (error) => { rejectedErrors.push(error); return fn; };
  fn.mockReturnValue = (value) => { defaultImpl = () => value; return fn; };
  fn.mockReturnValueOnce = (value) => { implementations.push(() => value); return fn; };
  fn.mockImplementation = (impl) => { defaultImpl = impl; return fn; };
  fn.mockImplementationOnce = (impl) => { implementations.push(impl); return fn; };
  fn.mockClear = () => { calls.length = 0; results.length = 0; return fn; };
  fn.mockReset = () => {
    calls.length = 0;
    results.length = 0;
    resolvedValues.length = 0;
    rejectedErrors.length = 0;
    implementations.length = 0;
    defaultResolvedValue = undefined;
    defaultRejectedError = undefined;
    defaultImpl = null;
    return fn;
  };

  return fn;
}

// ---------------------------------------------------------------------------
// Model mock (intercepts findUnique, findMany, create, update, delete, etc.)
// ---------------------------------------------------------------------------

const PRISMA_MODEL_METHODS = [
  'findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow',
  'findMany', 'create', 'createMany', 'update', 'updateMany',
  'upsert', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy',
] as const;

export type PrismaModelMock = {
  [K in typeof PRISMA_MODEL_METHODS[number]]: MockFn;
};

function createModelMock(): PrismaModelMock {
  const mock = {} as PrismaModelMock;
  for (const method of PRISMA_MODEL_METHODS) {
    mock[method] = createMockFn();
  }
  return mock;
}

// ---------------------------------------------------------------------------
// PrismaMock type
// ---------------------------------------------------------------------------

const PRISMA_MODELS = [
  'employee', 'leave', 'leaveRequest', 'payrollRun', 'payslip',
  'attendance', 'department', 'designation', 'tenant', 'user',
  'role', 'permission', 'workflow', 'workflowInstance', 'notification',
  'document', 'auditLog', 'complianceRecord',
] as const;

export type PrismaMock = {
  [K in typeof PRISMA_MODELS[number]]: PrismaModelMock;
} & {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (prisma: PrismaMock) => Promise<T>): Promise<T>;
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
  $executeRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<number>;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a type-safe mock PrismaClient for unit tests.
 */
export function createPrismaMock(): PrismaMock {
  const mock = {
    $connect: createMockFn<[], Promise<void>>(),
    $disconnect: createMockFn<[], Promise<void>>(),
    $transaction: createMockFn(),
    $queryRaw: createMockFn(),
    $executeRaw: createMockFn(),
  } as unknown as PrismaMock;

  // Auto-init transaction to pass through
  (mock.$transaction as MockFn).mockImplementation(
    (async (fn: (p: PrismaMock) => Promise<unknown>) => fn(mock)) as (...args: unknown[]) => unknown
  );

  // Create model mocks
  for (const model of PRISMA_MODELS) {
    (mock as Record<string, unknown>)[model] = createModelMock();
  }

  return mock;
}
