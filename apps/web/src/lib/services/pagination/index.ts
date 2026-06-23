/**
 * Shared pagination helper (closes audit 2026-06-17 Pattern 3).
 *
 * The audit found that compliance-service list endpoints universally
 * used `take: 500` with no skip / cursor / total / page meta. This
 * module is the canonical shape — every list service should accept
 * `PaginationInput` and return `PaginatedResult<T>`.
 *
 * Conventions:
 *   - Page numbering starts at 1.
 *   - `pageSize` is clamped to [1, MAX_PAGE_SIZE] so callers can't
 *     turn pagination into "take everything".
 *   - `hasNextPage` is computed from total to avoid an extra round trip.
 *   - Sort is a list of `(field, dir)` pairs so callers can multi-sort
 *     without inventing their own parsing.
 *
 * Standard usage (one liner per service):
 *
 *     async list(input: ListInput) {
 *         const page = normalisePaging(input);
 *         const [items, total] = await Promise.all([
 *             prisma.thing.findMany({ where, ...prismaPageArgs(page), orderBy: prismaOrderBy(page) }),
 *             prisma.thing.count({ where }),
 *         ]);
 *         return buildPaginatedResult(items, total, page);
 *     }
 */

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 500;

export interface PaginationInput {
  page?: number;
  pageSize?: number;
  sort?: Array<{ field: string; dir?: 'asc' | 'desc' }>;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

interface NormalisedPaging {
  page: number;
  pageSize: number;
  sort: Array<{ field: string; dir: 'asc' | 'desc' }>;
  skip: number;
  take: number;
}

/**
 * Clamp / default page + pageSize and normalise sort directions.
 * The returned shape is what `prismaPageArgs` / `prismaOrderBy` expect.
 */
export function normalisePaging(input: PaginationInput | undefined): NormalisedPaging {
  const rawPage = Number.isFinite(input?.page) ? Math.floor(input!.page!) : 1;
  const page = rawPage < 1 ? 1 : rawPage;

  const rawSize = Number.isFinite(input?.pageSize)
    ? Math.floor(input!.pageSize!)
    : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));

  const sort = (input?.sort ?? []).map((s) => ({
    field: s.field,
    dir: (s.dir === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
  }));

  return { page, pageSize, sort, skip: (page - 1) * pageSize, take: pageSize };
}

/** Prisma findMany pagination args extracted from a normalised page. */
export function prismaPageArgs(page: NormalisedPaging): { skip: number; take: number } {
  return { skip: page.skip, take: page.take };
}

/**
 * Prisma orderBy array built from the normalised sort. Returns
 * `undefined` when no sort fields were provided so callers can spread
 * the result safely.
 */
export function prismaOrderBy(
  page: NormalisedPaging
): Array<Record<string, 'asc' | 'desc'>> | undefined {
  if (page.sort.length === 0) return undefined;
  return page.sort.map((s) => ({ [s.field]: s.dir }));
}

/** Build the standard PaginatedResult envelope. */
export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: NormalisedPaging
): PaginatedResult<T> {
  return {
    items,
    total,
    page: page.page,
    pageSize: page.pageSize,
    hasNextPage: page.skip + items.length < total,
  };
}

/** Compute just the meta block (useful for separate API envelopes). */
export function buildPaginationMeta(total: number, page: NormalisedPaging): PaginationMeta {
  return {
    page: page.page,
    pageSize: page.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / page.pageSize)),
    hasNextPage: page.skip + Math.min(page.pageSize, total - page.skip) < total,
  };
}
