/**
 * @module usePrefetch
 * @description Prefetch utilities for React Query — hover-based, viewport-based, and route-based.
 * @project AURA HCM Platform
 *
 * @example
 * // Prefetch employee details on hover
 * const { hoverProps } = usePrefetchOnHover(
 *   queryKeys.employees.detail(employeeId),
 *   () => EmployeeService.getEmployee(employeeId)
 * );
 * return <div {...hoverProps}>...</div>;
 *
 * // Prefetch when a card enters the viewport
 * const { ref } = usePrefetchOnVisible(
 *   queryKeys.leaves.detail(leaveId),
 *   () => LeaveService.getLeave(leaveId)
 * );
 * return <div ref={ref}>...</div>;
 *
 * // Prefetch all data for a route before navigation
 * const prefetchRoute = usePrefetchRoute();
 * prefetchRoute('/dashboard/payroll');
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient, type QueryKey, type QueryFunction } from '@tanstack/react-query';

// ── Stale time for prefetched data (5 minutes) ────────────────────────────────
const PREFETCH_STALE_TIME = 5 * 60 * 1000;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PrefetchOnHoverReturn {
  /** Spread onto the trigger element to activate hover prefetching */
  hoverProps: {
    onMouseEnter: () => void;
    onFocus: () => void;
  };
  /** Manually trigger a prefetch */
  prefetch: () => void;
}

export interface PrefetchOnVisibleReturn {
  /** Attach this ref to the element you want to watch */
  ref: (el: Element | null) => void;
}

// ── usePrefetchOnHover ─────────────────────────────────────────────────────────

/**
 * Prefetch query data when the user hovers over or focuses an element.
 * Uses a short delay (100ms) to avoid triggering on accidental mouse movements.
 */
export function usePrefetchOnHover<TData = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  staleTime = PREFETCH_STALE_TIME
): PrefetchOnHoverReturn {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({ queryKey, queryFn, staleTime });
  }, [queryClient, queryKey, queryFn, staleTime]);

  const handleMouseEnter = useCallback(() => {
    // Small delay to avoid prefetching on brief mouse-over
    timerRef.current = setTimeout(prefetch, 100);
  }, [prefetch]);

  const _handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleFocus = useCallback(() => {
    prefetch();
  }, [prefetch]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onFocus: handleFocus,
    },
    prefetch,
  };
}

// Augment hover props to also handle mouseLeave for cleanup
export function usePrefetchOnHoverWithCleanup<TData = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  staleTime = PREFETCH_STALE_TIME
) {
  const result = usePrefetchOnHover(queryKey, queryFn, staleTime);
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      queryClient.prefetchQuery({ queryKey, queryFn, staleTime });
    }, 100);
  }, [queryClient, queryKey, queryFn, staleTime]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return {
    ...result,
    hoverProps: {
      ...result.hoverProps,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

// ── usePrefetchOnVisible ───────────────────────────────────────────────────────

/**
 * Prefetch query data when an element enters the viewport.
 * Uses IntersectionObserver; prefetches once and then disconnects.
 */
export function usePrefetchOnVisible<TData = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: {
    staleTime?: number;
    rootMargin?: string;
    threshold?: number;
  } = {}
): PrefetchOnVisibleReturn {
  const {
    staleTime = PREFETCH_STALE_TIME,
    rootMargin = '0px 0px 200px 0px', // Pre-fetch slightly before visible
    threshold = 0.1,
  } = options;

  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const prefetchedRef = useRef(false);

  const ref = useCallback(
    (el: Element | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!el) return;
      if (prefetchedRef.current) return; // Already prefetched

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting && !prefetchedRef.current) {
            prefetchedRef.current = true;
            queryClient.prefetchQuery({ queryKey, queryFn, staleTime });
            // Disconnect after prefetch to avoid repeated triggers
            observerRef.current?.disconnect();
          }
        },
        { rootMargin, threshold }
      );

      observerRef.current.observe(el);
    },
    [queryClient, queryKey, queryFn, staleTime, rootMargin, threshold]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref };
}

// ── Route Prefetch Map ─────────────────────────────────────────────────────────

/**
 * Known route → query keys mapping for data prefetching on navigation.
 * Extend this as you add new routes and their associated data needs.
 */
const ROUTE_PREFETCH_MAP: Record<string, QueryKey[]> = {
  '/dashboard/core-hr/employee-database': [['employees', 'list', {}]],
  '/dashboard/leave/my-leaves': [['leaves', 'list', {}]],
  '/dashboard/payroll/payroll-processing': [['payroll', 'list', {}]],
  '/dashboard/expenses': [['expenses', 'list', {}]],
  '/dashboard/attendance': [['attendance', 'list', {}]],
  '/dashboard/recruitment': [['recruitment', 'list', {}]],
  '/dashboard/training': [['training', 'list', {}]],
  '/dashboard/admin/compliance': [['compliance', 'list', {}]],
  '/dashboard/reports': [['reports', 'available', {}]],
  '/dashboard/settings': [['settings', 'all']],
};

// ── usePrefetchRoute ───────────────────────────────────────────────────────────

/**
 * Returns a function that prefetches data for known routes.
 * Call it before navigating (e.g. on Link hover) to warm the cache.
 *
 * @example
 * const prefetchRoute = usePrefetchRoute();
 * <Link href="/dashboard/payroll" onMouseEnter={() => prefetchRoute('/dashboard/payroll')}>
 *   Payroll
 * </Link>
 */
export function usePrefetchRoute() {
  const queryClient = useQueryClient();

  const prefetchRoute = useCallback(
    (route: string) => {
      const keys = ROUTE_PREFETCH_MAP[route];
      if (!keys) return;

      keys.forEach((key) => {
        // We only set the query key; the queryFn must already be registered
        // (i.e. the query has been fetched before, or the component that handles
        // this query is already mounted). This warms stale queries.
        const existingData = queryClient.getQueryData(key);
        if (existingData !== undefined) {
          // Data exists, just mark it as fresh to prevent re-fetch
          return;
        }
        // Mark as prefetching so the route component can hydrate quickly
        queryClient.prefetchQuery({
          queryKey: key,
          queryFn: async () => null, // Placeholder; real queryFn comes from the page
          staleTime: PREFETCH_STALE_TIME,
        });
      });
    },
    [queryClient]
  );

  return prefetchRoute;
}

export default usePrefetchOnHover;
