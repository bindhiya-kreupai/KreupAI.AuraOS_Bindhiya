/**
 * @module useOptimisticMutation
 * @description Generic React Query hook with optimistic update support, auto-rollback on error,
 *              toast notifications, and configurable query key invalidation.
 * @project AURA HCM Platform
 *
 * @example
 * // Leave approval
 * const mutation = useOptimisticMutation({
 *   mutationFn: (id: string) => LeaveService.approve(id),
 *   queryKey: queryKeys.leaves.list({}),
 *   optimisticUpdate: (old, id) =>
 *     old.map(l => l.id === id ? { ...l, status: 'approved' } : l),
 *   successMessage: 'Leave approved',
 *   errorMessage: 'Failed to approve leave',
 * });
 *
 * // Expense approval
 * const expenseMutation = useOptimisticMutation({
 *   mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
 *     ExpenseService.approveReport(id, 'mgr-001', { comments }),
 *   queryKey: queryKeys.expenses.list({}),
 *   optimisticUpdate: (old, vars) =>
 *     old.map(e => e.id === vars.id ? { ...e, status: 'approved' } : e),
 *   successMessage: 'Expense report approved',
 *   errorMessage: 'Failed to approve expense report',
 * });
 */

'use client';

import {
  useMutation,
  useQueryClient,
  type MutationFunction,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification-store';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UseOptimisticMutationOptions<TData, TVariables, TContext = unknown> {
  /** The async function that performs the mutation */
  mutationFn: MutationFunction<TData, TVariables>;

  /**
   * The React Query key(s) whose cached data will be optimistically updated.
   * Supports a single QueryKey or an array of QueryKeys.
   */
  queryKey: QueryKey | QueryKey[];

  /**
   * Function that applies the optimistic update to cached data.
   * Receives the current cached data and the mutation variables.
   * Return the new data that should be shown while the mutation is in-flight.
   */
  optimisticUpdate?: (currentData: TData, variables: TVariables) => TData;

  /**
   * Query keys to invalidate after a successful mutation.
   * Defaults to invalidating the same queryKey(s).
   */
  invalidateKeys?: QueryKey[];

  /** Toast message shown on success */
  successMessage?: string;

  /** Toast message shown on error */
  errorMessage?: string;

  /** Optional callback when mutation succeeds */
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;

  /** Optional callback when mutation fails */
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;

  /** Additional react-query mutation options */
  mutationOptions?: Omit<
    UseMutationOptions<TData, Error, TVariables, TContext>,
    'mutationFn' | 'onMutate' | 'onError' | 'onSuccess' | 'onSettled'
  >;
}

interface OptimisticContext<TData> {
  previousData: Map<string, TData | undefined>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useOptimisticMutation<TData, TVariables, TContext = OptimisticContext<TData>>(
  options: UseOptimisticMutationOptions<TData, TVariables, TContext>
) {
  const {
    mutationFn,
    queryKey,
    optimisticUpdate,
    invalidateKeys,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    mutationOptions,
  } = options;

  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  // Normalize queryKey(s) to an array for uniform handling
  const queryKeys: QueryKey[] =
    Array.isArray(queryKey[0]) || queryKey.length === 0 ? (queryKey as QueryKey[]) : [queryKey];

  return useMutation<TData, Error, TVariables, OptimisticContext<TData>>({
    mutationFn,

    // ── Optimistic Update ──────────────────────────────────────────────────────
    onMutate: async (variables) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await Promise.all(queryKeys.map((k) => queryClient.cancelQueries({ queryKey: k })));

      // Snapshot previous values for rollback
      const previousData = new Map<string, TData | undefined>();

      if (optimisticUpdate) {
        for (const key of queryKeys) {
          const keyStr = JSON.stringify(key);
          const previous = queryClient.getQueryData<TData>(key);
          previousData.set(keyStr, previous);

          if (previous !== undefined) {
            queryClient.setQueryData<TData>(key, (old) => {
              if (old === undefined) return old;
              return optimisticUpdate(old, variables);
            });
          }
        }
      }

      return { previousData } as OptimisticContext<TData>;
    },

    // ── Rollback on Error ──────────────────────────────────────────────────────
    onError: (error, variables, context) => {
      // Roll back optimistic updates
      if (context?.previousData) {
        for (const key of queryKeys) {
          const keyStr = JSON.stringify(key);
          const previous = context.previousData.get(keyStr);
          if (previous !== undefined) {
            queryClient.setQueryData(key, previous);
          }
        }
      }

      // Show error toast
      if (errorMessage) {
        addNotification({
          type: 'error',
          title: 'Action Failed',
          message: errorMessage || error.message,
        });
      }

      onError?.(error, variables, context as TContext | undefined);
    },

    // ── Success Notification ───────────────────────────────────────────────────
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: successMessage,
        });
      }

      onSuccess?.(data, variables, context as TContext | undefined);
    },

    // ── Invalidate Queries ─────────────────────────────────────────────────────
    onSettled: async () => {
      const keysToInvalidate = invalidateKeys ?? queryKeys;
      await Promise.all(
        keysToInvalidate.map((k) => queryClient.invalidateQueries({ queryKey: k }))
      );
    },

    ...mutationOptions,
  });
}

export default useOptimisticMutation;
