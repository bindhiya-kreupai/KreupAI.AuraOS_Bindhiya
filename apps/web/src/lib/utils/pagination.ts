/**
 * Cursor-Based Pagination Utilities
 *
 * Provides efficient cursor-based pagination for large datasets.
 * More efficient than offset-based pagination for deep pagination scenarios.
 */

import { logger } from '@/lib/logger';

// Pagination configuration
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

/**
 * Cursor format: base64 encoded JSON with id and timestamp
 */
export interface CursorData {
  id: string;
  createdAt?: string;
  [key: string]: string | number | undefined;
}

export interface PaginationParams {
  /** Cursor for the next page */
  cursor?: string;
  /** Number of items per page */
  limit?: number;
  /** Direction: 'forward' or 'backward' */
  direction?: 'forward' | 'backward';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: string | null;
    previousCursor: string | null;
    totalCount?: number;
  };
}

export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

export interface OffsetPaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Encode cursor data to base64 string
 */
export function encodeCursor(data: CursorData): string {
  try {
    const json = JSON.stringify(data);
    return Buffer.from(json).toString('base64url');
  } catch (error) {
    logger.error({ error, data }, 'Failed to encode cursor');
    throw new Error('Failed to encode cursor');
  }
}

/**
 * Decode base64 cursor string to cursor data
 */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8');
    return JSON.parse(json) as CursorData;
  } catch (error) {
    logger.warn({ error, cursor }, 'Failed to decode cursor');
    return null;
  }
}

/**
 * Validate and normalize pagination params
 */
export function normalizePaginationParams(params: PaginationParams): {
  cursor: CursorData | null;
  limit: number;
  direction: 'forward' | 'backward';
} {
  let limit = params.limit ?? DEFAULT_PAGE_SIZE;
  limit = Math.min(Math.max(limit, MIN_PAGE_SIZE), MAX_PAGE_SIZE);

  const cursor = params.cursor ? decodeCursor(params.cursor) : null;
  const direction = params.direction || 'forward';

  return { cursor, limit, direction };
}

/**
 * Create Prisma cursor query options
 */
export function createCursorQuery<T extends { id: string; createdAt?: Date }>(
  params: PaginationParams,
  orderBy: { field: keyof T; direction: 'asc' | 'desc' } = { field: 'createdAt' as keyof T, direction: 'desc' }
): {
  cursor?: { id: string };
  take: number;
  skip?: number;
  orderBy: Record<string, 'asc' | 'desc'>;
} {
  const { cursor, limit, direction } = normalizePaginationParams(params);

  const query: {
    cursor?: { id: string };
    take: number;
    skip?: number;
    orderBy: Record<string, 'asc' | 'desc'>;
  } = {
    take: direction === 'backward' ? -(limit + 1) : limit + 1,
    orderBy: { [orderBy.field]: orderBy.direction } as Record<string, 'asc' | 'desc'>,
  };

  if (cursor) {
    query.cursor = { id: cursor.id };
    query.skip = 1; // Skip the cursor item itself
  }

  return query;
}

/**
 * Process cursor-paginated results
 */
export function processCursorResults<T extends { id: string; createdAt?: Date }>(
  results: T[],
  params: PaginationParams
): PaginatedResult<T> {
  const { limit, direction } = normalizePaginationParams(params);

  // Check if there are more results than requested
  const hasMore = results.length > limit;

  // Trim to requested limit
  let data = hasMore ? results.slice(0, limit) : results;

  // If going backward, reverse the results
  if (direction === 'backward') {
    data = data.reverse();
  }

  // Generate cursors
  const firstItem = data[0];
  const lastItem = data[data.length - 1];

  const nextCursor =
    hasMore && lastItem
      ? encodeCursor({
          id: lastItem.id,
          createdAt: lastItem.createdAt?.toISOString(),
        })
      : null;

  const previousCursor =
    params.cursor && firstItem
      ? encodeCursor({
          id: firstItem.id,
          createdAt: firstItem.createdAt?.toISOString(),
        })
      : null;

  return {
    data,
    pagination: {
      hasNextPage: hasMore,
      hasPreviousPage: !!params.cursor,
      nextCursor,
      previousCursor,
    },
  };
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationFromURL(searchParams: URLSearchParams): PaginationParams {
  const cursor = searchParams.get('cursor') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
  const direction = (searchParams.get('direction') as 'forward' | 'backward') || 'forward';

  return { cursor, limit, direction };
}

/**
 * Parse offset pagination params from URL search params
 */
export function parseOffsetPaginationFromURL(searchParams: URLSearchParams): OffsetPaginationParams {
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : DEFAULT_PAGE_SIZE;

  return {
    page: Math.max(1, page),
    limit: Math.min(Math.max(limit, MIN_PAGE_SIZE), MAX_PAGE_SIZE),
  };
}

/**
 * Calculate offset pagination
 */
export function calculateOffsetPagination(params: OffsetPaginationParams, totalCount: number): {
  skip: number;
  take: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const page = params.page || 1;
  let limit = params.limit || DEFAULT_PAGE_SIZE;
  limit = Math.min(Math.max(limit, MIN_PAGE_SIZE), MAX_PAGE_SIZE);

  const totalPages = Math.ceil(totalCount / limit);
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit, totalPages };
}

/**
 * Create offset pagination response
 */
export function createOffsetPaginationResponse<T>(
  data: T[],
  params: OffsetPaginationParams,
  totalCount: number
): OffsetPaginatedResult<T> {
  const { page, limit, totalPages } = calculateOffsetPagination(params, totalCount);

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Cursor pagination helper for Prisma
 *
 * Usage:
 * ```typescript
 * const result = await paginateCursor(
 *   prisma.user,
 *   { cursor, limit: 20 },
 *   { where: { tenantId: 'xxx' } }
 * );
 * ```
 */
export async function paginateCursor<T extends { id: string; createdAt?: Date }>(
  model: {
    findMany: (args: {
      where?: Record<string, unknown>;
      cursor?: { id: string };
      take?: number;
      skip?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => Promise<T[]>;
  },
  params: PaginationParams,
  queryOptions: {
    where?: Record<string, unknown>;
    orderBy?: { field: keyof T; direction: 'asc' | 'desc' };
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
  } = {}
): Promise<PaginatedResult<T>> {
  const cursorQuery = createCursorQuery<T>(params, queryOptions.orderBy);

  const results = await model.findMany({
    ...queryOptions,
    ...cursorQuery,
  });

  return processCursorResults(results, params);
}

/**
 * Offset pagination helper for Prisma
 *
 * Usage:
 * ```typescript
 * const result = await paginateOffset(
 *   prisma.user,
 *   { page: 1, limit: 20 },
 *   { where: { tenantId: 'xxx' } }
 * );
 * ```
 */
export async function paginateOffset<T>(
  model: {
    findMany: (args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
    }) => Promise<T[]>;
    count: (args: { where?: Record<string, unknown> }) => Promise<number>;
  },
  params: OffsetPaginationParams,
  queryOptions: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
  } = {}
): Promise<OffsetPaginatedResult<T>> {
  // Get total count
  const totalCount = await model.count({ where: queryOptions.where });

  // Calculate pagination
  const { skip, take } = calculateOffsetPagination(params, totalCount);

  // Get data
  const data = await model.findMany({
    ...queryOptions,
    skip,
    take,
  });

  return createOffsetPaginationResponse(data, params, totalCount);
}

export default {
  encodeCursor,
  decodeCursor,
  normalizePaginationParams,
  createCursorQuery,
  processCursorResults,
  parsePaginationFromURL,
  parseOffsetPaginationFromURL,
  calculateOffsetPagination,
  createOffsetPaginationResponse,
  paginateCursor,
  paginateOffset,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
};
