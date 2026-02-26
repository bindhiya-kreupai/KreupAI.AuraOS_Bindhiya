/**
 * @module useInfiniteList
 * @description Generic React Query hook wrapping useInfiniteQuery for paginated lists.
 *              Supports cursor-based and offset-based pagination, plus debounced search/filter.
 * @project AURA HCM Platform
 *
 * @example
 * // Cursor-based pagination (e.g. employees)
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage, total } = useInfiniteList({
 *   queryKey: queryKeys.employees.list({ department: 'Engineering' }),
 *   queryFn: ({ pageParam }) =>
 *     EmployeeService.getEmployees({ cursor: pageParam, limit: 20, department: 'Engineering' }),
 *   paginationMode: 'cursor',
 *   getNextPageParam: (lastPage) => lastPage.nextCursor,
 *   searchDebounceMs: 300,
 * });
 *
 * // Offset-based pagination (e.g. expense reports)
 * const { data, fetchNextPage, hasNextPage } = useInfiniteList({
 *   queryKey: queryKeys.expenses.list({ status: 'pending_approval' }),
 *   queryFn: ({ pageParam }) =>
 *     ExpenseService.getExpenseReports({ page: pageParam, pageSize: 25 }),
 *   paginationMode: 'offset',
 *   pageSize: 25,
 * });
 */

'use client';

import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type PaginationMode = 'cursor' | 'offset';

/** Shape of a page response for offset-based pagination */
export interface OffsetPage<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Shape of a page response for cursor-based pagination */
export interface CursorPage<TItem> {
  items: TItem[];
  total?: number;
  nextCursor?: string | null;
  hasMore?: boolean;
}

export type PageData<TItem> = OffsetPage<TItem> | CursorPage<TItem>;

export interface UseInfiniteListOptions<
  TItem,
  TFilters extends Record<string, unknown> = Record<string, unknown>,
> {
  /** React Query key for this query */
  queryKey: QueryKey;

  /** Async function that fetches a page of data */
  queryFn: (context: { pageParam: string | number; filters: TFilters }) => Promise<PageData<TItem>>;

  /** Pagination strategy */
  paginationMode?: PaginationMode;

  /**
   * For cursor-based: extract the cursor from the last page.
   * For offset-based: defaults to incrementing the page number.
   */
  getNextPageParam?: (
    lastPage: PageData<TItem>,
    allPages: PageData<TItem>[]
  ) => string | number | undefined | null;

  /** Number of items per page (used for offset mode) */
  pageSize?: number;

  /** Initial filters / search params */
  initialFilters?: TFilters;

  /** Debounce time in ms for search/filter updates (default: 300) */
  searchDebounceMs?: number;

  /** Whether the query is enabled */
  enabled?: boolean;

  /** Additional react-query options */
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      PageData<TItem>,
      Error,
      InfiniteData<PageData<TItem>>,
      PageData<TItem>,
      QueryKey,
      string | number
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >;
}

export interface UseInfiniteListReturn<
  TItem,
  TFilters extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Flattened array of all items across all loaded pages */
  data: TItem[];

  /** Total item count reported by the server (if available) */
  total: number | undefined;

  /** Load the next page */
  fetchNextPage: () => void;

  /** Whether more pages are available */
  hasNextPage: boolean;

  /** Whether the next page is currently loading */
  isFetchingNextPage: boolean;

  /** Whether the initial load is in progress */
  isLoading: boolean;

  /** Whether any fetch (initial or next page) is in progress */
  isFetching: boolean;

  /** Error from the most recent failed fetch */
  error: Error | null;

  /** Current filter state */
  filters: TFilters;

  /** Update one or more filters (triggers debounced refetch) */
  setFilters: (updates: Partial<TFilters>) => void;

  /** Reset all filters to initial values */
  resetFilters: () => void;

  /** The debounced search query (if you use a dedicated search field) */
  search: string;

  /** Update the search string */
  setSearch: (query: string) => void;

  /** Refetch from the beginning */
  refetch: () => void;
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function flattenPages<TItem>(pages: PageData<TItem>[]): TItem[] {
  return pages.flatMap((page) => page.items ?? []);
}

function getTotalFromPages<TItem>(pages: PageData<TItem>[]): number | undefined {
  if (!pages.length) return undefined;
  const last = pages[pages.length - 1];
  return 'total' in last ? (last as { total?: number }).total : undefined;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useInfiniteList<
  TItem,
  TFilters extends Record<string, unknown> = Record<string, unknown>,
>(options: UseInfiniteListOptions<TItem, TFilters>): UseInfiniteListReturn<TItem, TFilters> {
  const {
    queryKey,
    queryFn,
    paginationMode = 'offset',
    getNextPageParam,
    _pageSize = 20,
    initialFilters = {} as TFilters,
    searchDebounceMs = 300,
    enabled = true,
    queryOptions,
  } = options;

  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [search, setSearchRaw] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), searchDebounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchDebounceMs]);

  // Derive the full query key including filters + debounced search
  const fullQueryKey: QueryKey = [
    ...(Array.isArray(queryKey) ? queryKey : [queryKey]),
    filters,
    debouncedSearch,
  ];

  // Default getNextPageParam implementations
  const resolvedGetNextPageParam =
    getNextPageParam ??
    ((lastPage: PageData<TItem>, allPages: PageData<TItem>[]) => {
      if (paginationMode === 'cursor') {
        const page = lastPage as CursorPage<TItem>;
        return page.nextCursor ?? undefined;
      }
      // Offset mode: compute next page number
      const page = lastPage as OffsetPage<TItem>;
      if (!page.hasMore) return undefined;
      return allPages.length + 1;
    });

  const query = useInfiniteQuery<
    PageData<TItem>,
    Error,
    InfiniteData<PageData<TItem>>,
    QueryKey,
    string | number
  >({
    queryKey: fullQueryKey,
    queryFn: ({ pageParam }) =>
      queryFn({
        pageParam: pageParam ?? (paginationMode === 'offset' ? 1 : ''),
        filters: { ...filters, search: debouncedSearch } as TFilters,
      }),
    getNextPageParam: resolvedGetNextPageParam as (
      lastPage: PageData<TItem>,
      allPages: PageData<TItem>[],
      lastPageParam: string | number,
      allPageParams: (string | number)[]
    ) => string | number | undefined | null,
    initialPageParam: paginationMode === 'offset' ? 1 : '',
    enabled,
    ...queryOptions,
  });

  // Derive flat data
  const pages = query.data?.pages ?? [];
  const data = flattenPages<TItem>(pages);
  const total = getTotalFromPages<TItem>(pages);

  const setFilters = useCallback((updates: Partial<TFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearchRaw('');
    setDebouncedSearch('');
  }, [initialFilters]);

  const setSearch = useCallback((q: string) => {
    setSearchRaw(q);
  }, []);

  return {
    data,
    total,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    filters,
    setFilters,
    resetFilters,
    search,
    setSearch,
    refetch: query.refetch,
  };
}

export default useInfiniteList;
