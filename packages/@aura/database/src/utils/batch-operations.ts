/**
 * @module BatchOperations
 * @description Utility functions for performing large-scale database operations
 *   in controlled batches. Supports progress callbacks, transaction wrapping,
 *   and structured error collection.
 *
 * Exports:
 *  - `batchCreate(prisma, model, data, options)` — insert records in batches
 *  - `batchUpdate(prisma, model, updates, options)` — update records in batches
 *  - `batchUpsert(prisma, model, data, uniqueKey, options)` — upsert records in batches
 *
 * @project AuraOS Enterprise HCM — Phase 2 GAP Closure
 * @section Task Group C — Sec 25.6
 */

import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

/** Callback invoked after each batch completes. */
export type BatchProgressCallback = (options: {
  completed: number;
  total: number;
  batchIndex: number;
  batchSize: number;
  errors: BatchError[];
}) => void;

/** Structured error from a batch operation. */
export interface BatchError {
  index: number;
  record: unknown;
  error: Error;
}

/** Options common to all batch operations. */
export interface BatchOptions {
  /** Number of records per batch (default: 100). */
  batchSize?: number;
  /**
   * If true, wraps the entire operation in a single Prisma transaction.
   * Caution: large datasets may cause transaction timeouts.
   */
  useTransaction?: boolean;
  /**
   * Timeout in milliseconds for interactive transactions (default: 30_000).
   * Only relevant when useTransaction = true.
   */
  transactionTimeout?: number;
  /** Called after each batch completes. */
  onProgress?: BatchProgressCallback;
  /**
   * If true, errors in individual records are collected and returned
   * rather than thrown immediately (default: false).
   */
  collectErrors?: boolean;
  /**
   * Delay in milliseconds between batches to reduce database pressure (default: 0).
   */
  delayBetweenBatchesMs?: number;
}

/** Result returned by all batch operations. */
export interface BatchResult {
  /** Total records processed (attempted). */
  totalProcessed: number;
  /** Records successfully inserted / updated / upserted. */
  successCount: number;
  /** Records that failed (only populated when collectErrors = true). */
  errorCount: number;
  /** Collected errors (only populated when collectErrors = true). */
  errors: BatchError[];
  /** Time taken in milliseconds. */
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Splits an array into chunks of at most `size` items. */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// batchCreate
// ---------------------------------------------------------------------------

/**
 * Inserts records in batches using `createMany`.
 *
 * @param prisma - PrismaClient instance
 * @param model  - Prisma model name (e.g. 'employee')
 * @param data   - Array of records to insert
 * @param options - Batch configuration
 *
 * @example
 * const result = await batchCreate(prisma, 'skill', skillsData, {
 *   batchSize: 50,
 *   onProgress: ({ completed, total }) => console.log(`${completed}/${total}`),
 * });
 */
export async function batchCreate(
  prisma: PrismaClient,
  model: string,
  data: Record<string, unknown>[],
  options: BatchOptions = {}
): Promise<BatchResult> {
  const {
    batchSize = 100,
    useTransaction = false,
    transactionTimeout = 30_000,
    onProgress,
    collectErrors = false,
    delayBetweenBatchesMs = 0,
  } = options;

  const startTime = Date.now();
  const batches = chunk(data, batchSize);
  const errors: BatchError[] = [];
  let successCount = 0;

  const modelDelegate = (prisma as unknown as Record<string, unknown>)[model] as {
    createMany: (args: { data: unknown[]; skipDuplicates?: boolean }) => Promise<{ count: number }>;
  };

  if (!modelDelegate) {
    throw new Error(`batchCreate: Unknown Prisma model "${model}"`);
  }

  const processBatch = async (batch: Record<string, unknown>[], batchIndex: number) => {
    try {
      const result = await modelDelegate.createMany({
        data: batch,
        skipDuplicates: true,
      });
      successCount += result.count;
    } catch (err) {
      if (collectErrors) {
        batch.forEach((record, idx) => {
          errors.push({
            index: batchIndex * batchSize + idx,
            record,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        });
      } else {
        throw err;
      }
    }

    if (onProgress) {
      const completed = Math.min((batchIndex + 1) * batchSize, data.length);
      onProgress({
        completed,
        total: data.length,
        batchIndex,
        batchSize: batch.length,
        errors: [...errors],
      });
    }

    if (delayBetweenBatchesMs > 0 && batchIndex < batches.length - 1) {
      await sleep(delayBetweenBatchesMs);
    }
  };

  if (useTransaction) {
    await prisma.$transaction(
      async () => {
        for (let i = 0; i < batches.length; i++) {
          await processBatch(batches[i], i);
        }
      },
      { timeout: transactionTimeout }
    );
  } else {
    for (let i = 0; i < batches.length; i++) {
      await processBatch(batches[i], i);
    }
  }

  return {
    totalProcessed: data.length,
    successCount,
    errorCount: errors.length,
    errors,
    durationMs: Date.now() - startTime,
  };
}

// ---------------------------------------------------------------------------
// batchUpdate
// ---------------------------------------------------------------------------

/**
 * Updates records in batches. Each update entry should contain a `where` clause
 * and a `data` payload.
 *
 * @param prisma   - PrismaClient instance
 * @param model    - Prisma model name
 * @param updates  - Array of `{ where, data }` update operations
 * @param options  - Batch configuration
 *
 * @example
 * const result = await batchUpdate(prisma, 'employee', [
 *   { where: { id: 'abc' }, data: { status: 'Active' } },
 *   { where: { id: 'def' }, data: { status: 'Inactive' } },
 * ]);
 */
export async function batchUpdate(
  prisma: PrismaClient,
  model: string,
  updates: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }>,
  options: BatchOptions = {}
): Promise<BatchResult> {
  const {
    batchSize = 100,
    useTransaction = false,
    transactionTimeout = 30_000,
    onProgress,
    collectErrors = false,
    delayBetweenBatchesMs = 0,
  } = options;

  const startTime = Date.now();
  const batches = chunk(updates, batchSize);
  const errors: BatchError[] = [];
  let successCount = 0;

  const modelDelegate = (prisma as unknown as Record<string, unknown>)[model] as {
    update: (args: { where: unknown; data: unknown }) => Promise<unknown>;
  };

  if (!modelDelegate) {
    throw new Error(`batchUpdate: Unknown Prisma model "${model}"`);
  }

  const processBatch = async (
    batch: Array<{ where: Record<string, unknown>; data: Record<string, unknown> }>,
    batchIndex: number
  ) => {
    for (let i = 0; i < batch.length; i++) {
      const { where, data } = batch[i];
      try {
        await modelDelegate.update({ where, data });
        successCount++;
      } catch (err) {
        if (collectErrors) {
          errors.push({
            index: batchIndex * batchSize + i,
            record: { where, data },
            error: err instanceof Error ? err : new Error(String(err)),
          });
        } else {
          throw err;
        }
      }
    }

    if (onProgress) {
      const completed = Math.min((batchIndex + 1) * batchSize, updates.length);
      onProgress({
        completed,
        total: updates.length,
        batchIndex,
        batchSize: batch.length,
        errors: [...errors],
      });
    }

    if (delayBetweenBatchesMs > 0 && batchIndex < batches.length - 1) {
      await sleep(delayBetweenBatchesMs);
    }
  };

  if (useTransaction) {
    await prisma.$transaction(
      async () => {
        for (let i = 0; i < batches.length; i++) {
          await processBatch(batches[i], i);
        }
      },
      { timeout: transactionTimeout }
    );
  } else {
    for (let i = 0; i < batches.length; i++) {
      await processBatch(batches[i], i);
    }
  }

  return {
    totalProcessed: updates.length,
    successCount,
    errorCount: errors.length,
    errors,
    durationMs: Date.now() - startTime,
  };
}

// ---------------------------------------------------------------------------
// batchUpsert
// ---------------------------------------------------------------------------

/**
 * Upserts records in batches using `upsert` with a unique key.
 *
 * @param prisma     - PrismaClient instance
 * @param model      - Prisma model name
 * @param data       - Array of records to upsert
 * @param uniqueKey  - Field name used as the unique identifier for `where`
 * @param options    - Batch configuration
 *
 * @example
 * const result = await batchUpsert(prisma, 'skill', skillsData, 'code', {
 *   batchSize: 50,
 *   collectErrors: true,
 * });
 * if (result.errors.length) {
 *   console.error('Failed upserts:', result.errors);
 * }
 */
export async function batchUpsert(
  prisma: PrismaClient,
  model: string,
  data: Record<string, unknown>[],
  uniqueKey: string,
  options: BatchOptions = {}
): Promise<BatchResult> {
  const {
    batchSize = 100,
    useTransaction = false,
    transactionTimeout = 30_000,
    onProgress,
    collectErrors = false,
    delayBetweenBatchesMs = 0,
  } = options;

  const startTime = Date.now();
  const batches = chunk(data, batchSize);
  const errors: BatchError[] = [];
  let successCount = 0;

  const modelDelegate = (prisma as unknown as Record<string, unknown>)[model] as {
    upsert: (args: {
      where: Record<string, unknown>;
      create: unknown;
      update: unknown;
    }) => Promise<unknown>;
  };

  if (!modelDelegate) {
    throw new Error(`batchUpsert: Unknown Prisma model "${model}"`);
  }

  const processBatch = async (
    batch: Record<string, unknown>[],
    batchIndex: number
  ) => {
    for (let i = 0; i < batch.length; i++) {
      const record = batch[i];
      const uniqueValue = record[uniqueKey];

      if (uniqueValue === undefined || uniqueValue === null) {
        if (collectErrors) {
          errors.push({
            index: batchIndex * batchSize + i,
            record,
            error: new Error(`batchUpsert: record at index ${i} is missing uniqueKey "${uniqueKey}"`),
          });
          continue;
        } else {
          throw new Error(`batchUpsert: record at index ${i} is missing uniqueKey "${uniqueKey}"`);
        }
      }

      try {
        // Build the update payload — exclude the unique key field from update data
        // to avoid accidentally updating the identifier itself.
        const updateData = { ...record };
        delete updateData[uniqueKey];

        await modelDelegate.upsert({
          where: { [uniqueKey]: uniqueValue },
          create: record,
          update: updateData,
        });
        successCount++;
      } catch (err) {
        if (collectErrors) {
          errors.push({
            index: batchIndex * batchSize + i,
            record,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        } else {
          throw err;
        }
      }
    }

    if (onProgress) {
      const completed = Math.min((batchIndex + 1) * batchSize, data.length);
      onProgress({
        completed,
        total: data.length,
        batchIndex,
        batchSize: batch.length,
        errors: [...errors],
      });
    }

    if (delayBetweenBatchesMs > 0 && batchIndex < batches.length - 1) {
      await sleep(delayBetweenBatchesMs);
    }
  };

  if (useTransaction) {
    await prisma.$transaction(
      async () => {
        for (let i = 0; i < batches.length; i++) {
          await processBatch(batches[i], i);
        }
      },
      { timeout: transactionTimeout }
    );
  } else {
    for (let i = 0; i < batches.length; i++) {
      await processBatch(batches[i], i);
    }
  }

  return {
    totalProcessed: data.length,
    successCount,
    errorCount: errors.length,
    errors,
    durationMs: Date.now() - startTime,
  };
}

// ---------------------------------------------------------------------------
// Convenience: sequential batch processor with custom handler
// ---------------------------------------------------------------------------

/**
 * Generic batch processor that calls a custom handler for each batch.
 * Useful when you need custom logic per batch (e.g. conditional upserts).
 *
 * @param data      - Full dataset to process
 * @param batchSize - Number of records per batch (default: 100)
 * @param handler   - Async function called with each batch and its index
 *
 * @example
 * await processBatches(skills, 50, async (batch, index) => {
 *   console.log(`Processing batch ${index} with ${batch.length} items`);
 *   for (const skill of batch) {
 *     await prisma.skill.upsert({ where: { code: skill.code }, ... });
 *   }
 * });
 */
export async function processBatches<T>(
  data: T[],
  batchSize: number,
  handler: (batch: T[], batchIndex: number, totalBatches: number) => Promise<void>
): Promise<void> {
  const batches = chunk(data, batchSize);
  for (let i = 0; i < batches.length; i++) {
    await handler(batches[i], i, batches.length);
  }
}
