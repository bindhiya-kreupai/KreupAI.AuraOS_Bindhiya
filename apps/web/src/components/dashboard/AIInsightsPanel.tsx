/**
 * @module AIInsightsPanel
 * @description AI-powered insights feed container for the dashboard
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, Filter, ChevronDown, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import type { InsightType } from '@/hooks/useAIInsights';
import { InsightCard } from './InsightCard';

const FILTER_OPTIONS: { value: InsightType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Insights' },
  { value: 'turnover_risk', label: 'Turnover Risk' },
  { value: 'performance_trend', label: 'Performance Trend' },
  { value: 'compliance_alert', label: 'Compliance Alert' },
  { value: 'training_recommendation', label: 'Training' },
];

export const AIInsightsPanel: React.FC = () => {
  const {
    loading,
    error,
    lastRefreshed,
    refresh,
    dismissInsight,
    restoreInsight,
    activeInsights,
    dismissedInsights,
  } = useAIInsights({ autoRefresh: true, refreshInterval: 15 });

  const [filterType, setFilterType] = useState<InsightType | 'all'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Clear cache to force fresh fetch
    try {
      localStorage.removeItem('aura_ai_insights_cache');
    } catch {
      /* noop */
    }
    await refresh();
    setIsRefreshing(false);
  };

  const filteredInsights =
    filterType === 'all' ? activeInsights : activeInsights.filter((i) => i.type === filterType);

  const filteredDismissed =
    filterType === 'all'
      ? dismissedInsights
      : dismissedInsights.filter((i) => i.type === filterType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-celestial-indigo/20 to-quantum-rose/20">
            <Sparkles className="w-4 h-4 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-black dark:text-pearl">AI Insights</h2>
            {lastRefreshed && (
              <p className="text-[9px] text-silver-mist">
                Updated{' '}
                {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-pearl/50 dark:bg-deep-cosmos/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
            >
              <Filter className="w-3 h-3" />
              {FILTER_OPTIONS.find((o) => o.value === filterType)?.label}
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 shadow-lg z-20 py-1">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setFilterType(option.value);
                      setFilterOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1.5 text-[10px] font-medium transition-colors ${
                      filterType === option.value
                        ? 'text-celestial-indigo bg-celestial-indigo/5'
                        : 'text-ink-black dark:text-pearl hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show/Hide Dismissed */}
          {dismissedInsights.length > 0 && (
            <button
              onClick={() => setShowDismissed(!showDismissed)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-pearl/50 dark:bg-deep-cosmos/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
              title={showDismissed ? 'Hide dismissed' : 'Show dismissed'}
            >
              {showDismissed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {dismissedInsights.length}
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium rounded-lg bg-pearl/50 dark:bg-deep-cosmos/50 text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors disabled:opacity-50"
            title="Refresh insights"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Close filter dropdown on outside click */}
      {filterOpen && <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-celestial-indigo" />
          <span className="ml-2 text-xs text-silver-mist">Generating insights...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-quantum-rose/5 border border-quantum-rose/20 rounded-lg p-3 text-center">
          <p className="text-xs text-quantum-rose">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-1 text-[10px] font-medium text-celestial-indigo hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Active Insights */}
      {!loading && !error && (
        <div className="space-y-3">
          {filteredInsights.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="w-6 h-6 text-silver-mist/50 mx-auto mb-2" />
              <p className="text-xs text-silver-mist">
                {filterType !== 'all'
                  ? 'No insights for this filter'
                  : 'All caught up! No new insights.'}
              </p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} onDismiss={dismissInsight} />
            ))
          )}
        </div>
      )}

      {/* Dismissed Insights */}
      {showDismissed && filteredDismissed.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-cloud/50 dark:border-nebula-purple/30">
          <p className="text-[10px] font-semibold text-silver-mist uppercase tracking-wider">
            Dismissed ({filteredDismissed.length})
          </p>
          {filteredDismissed.map((insight) => (
            <div
              key={insight.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-pearl/30 dark:bg-deep-cosmos/30 opacity-60"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                  {insight.title}
                </p>
                <p className="text-[9px] text-silver-mist truncate">{insight.summary}</p>
              </div>
              <button
                onClick={() => restoreInsight(insight.id)}
                className="shrink-0 ml-2 text-[10px] font-medium text-celestial-indigo hover:underline"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;
