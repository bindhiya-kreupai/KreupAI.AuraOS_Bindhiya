/**
 * @module FeatureFlagProvider
 * @description React context provider for feature flags with auto-refresh,
 *              useFeatureFlag hook, useFeatureFlags hook, and FeatureGate component.
 * @project AURA HCM Platform
 */

'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  FeatureFlagService,
  type FeatureFlag,
  type FlagContext,
} from '@/services/featureFlagService';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface FeatureFlagContextValue {
  flags: Record<string, FeatureFlag>;
  loading: boolean;
  error: string | null;
  isEnabled: (key: string, context?: FlagContext) => boolean;
  refresh: () => Promise<void>;
  lastRefreshed: Date | null;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  loading: true,
  error: null,
  isEnabled: () => false,
  refresh: async () => {},
  lastRefreshed: null,
});

// ============================================================================
// PROVIDER
// ============================================================================

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface FeatureFlagProviderProps {
  children: ReactNode;
  /**
   * Optional initial context for flag evaluation (user, tenant, role)
   */
  context?: FlagContext;
  /**
   * Fallback values for flags when loading or error occurs
   * Record<flagKey, defaultEnabled>
   */
  defaults?: Record<string, boolean>;
  /**
   * Refresh interval in ms. Defaults to 5 minutes.
   */
  refreshIntervalMs?: number;
}

export function FeatureFlagProvider({
  children,
  context,
  defaults = {},
  refreshIntervalMs = REFRESH_INTERVAL_MS,
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      const data = await FeatureFlagService.getFlags();
      const flagMap: Record<string, FeatureFlag> = {};
      data.forEach((f) => {
        flagMap[f.key] = f;
      });
      setFlags(flagMap);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError('Failed to load feature flags. Using fallback values.');
      console.error('[FeatureFlagProvider] Failed to fetch flags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshIntervalMs <= 0) return;
    const timer = setInterval(() => {
      fetchFlags();
    }, refreshIntervalMs);
    return () => clearInterval(timer);
  }, [fetchFlags, refreshIntervalMs]);

  /**
   * Synchronous flag check using cached flags.
   * Falls back to defaults if flag not found or loading.
   */
  const isEnabled = useCallback(
    (key: string, evalContext?: FlagContext): boolean => {
      const flag = flags[key];

      // Loading or not found — use default
      if (!flag) return defaults[key] ?? false;

      // Disabled
      if (!flag.isEnabled) return false;

      const t = flag.targeting;
      const ctx = evalContext ?? context;

      // User whitelist
      if (ctx?.userId && t.userWhitelist?.includes(ctx.userId)) return true;

      // Tenant whitelist
      if (ctx?.tenantId && t.tenantWhitelist?.includes(ctx.tenantId)) return true;

      // Role whitelist
      if (ctx?.role && t.roleWhitelist?.includes(ctx.role)) return true;

      // Percentage rollout
      if (t.percentageRollout?.enabled) {
        const pct = t.percentageRollout.percentage;
        if (pct >= 100) return true;
        if (pct <= 0) return false;
        // Deterministic hash
        const userId = ctx?.userId ?? 'anonymous';
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
          hash = (hash << 5) - hash + userId.charCodeAt(i);
          hash |= 0;
        }
        return Math.abs(hash) % 100 < pct;
      }

      // No targeting — fully enabled
      return true;
    },
    [flags, context, defaults]
  );

  const contextValue = useMemo(
    () => ({
      flags,
      loading,
      error,
      isEnabled,
      refresh: fetchFlags,
      lastRefreshed,
    }),
    [flags, loading, error, isEnabled, fetchFlags, lastRefreshed]
  );

  return <FeatureFlagContext.Provider value={contextValue}>{children}</FeatureFlagContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Returns whether a specific feature flag is enabled for the current context.
 *
 * @example
 * const isEnabled = useFeatureFlag('ai_performance_insights');
 * if (isEnabled) { ... }
 */
export function useFeatureFlag(key: string, context?: FlagContext): boolean {
  const ctx = useContext(FeatureFlagContext);
  return ctx.isEnabled(key, context);
}

/**
 * Returns all feature flags and their current state.
 *
 * @example
 * const { flags, loading, refresh } = useFeatureFlags();
 */
export function useFeatureFlags(): {
  flags: Record<string, FeatureFlag>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastRefreshed: Date | null;
  isEnabled: (key: string, context?: FlagContext) => boolean;
} {
  return useContext(FeatureFlagContext);
}

// ============================================================================
// FEATURE GATE COMPONENT
// ============================================================================

interface FeatureGateProps {
  /**
   * Feature flag key to check
   */
  flag: string;
  /**
   * Optional context for flag evaluation
   */
  context?: FlagContext;
  /**
   * Content to render when flag is enabled
   */
  children: ReactNode;
  /**
   * Optional fallback content when flag is disabled (default: null)
   */
  fallback?: ReactNode;
  /**
   * If true, renders fallback while loading instead of nothing
   */
  showFallbackWhileLoading?: boolean;
}

/**
 * Conditionally renders children based on a feature flag state.
 *
 * @example
 * <FeatureGate flag="ai_performance_insights">
 *   <AIInsightsPanel />
 * </FeatureGate>
 *
 * @example with fallback
 * <FeatureGate flag="advanced_analytics_v3" fallback={<LegacyAnalytics />}>
 *   <NewAnalyticsPanel />
 * </FeatureGate>
 */
export function FeatureGate({
  flag,
  context,
  children,
  fallback = null,
  showFallbackWhileLoading = false,
}: FeatureGateProps) {
  const { isEnabled, loading } = useContext(FeatureFlagContext);

  if (loading && showFallbackWhileLoading) {
    return <>{fallback}</>;
  }

  if (loading) {
    return null;
  }

  return isEnabled(flag, context) ? <>{children}</> : <>{fallback}</>;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FeatureFlagProvider;
