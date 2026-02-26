'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  refreshLabel?: string;
  releaseLabel?: string;
  refreshingLabel?: string;
}

type PTRState = 'idle' | 'pulling' | 'ready' | 'refreshing';

// ── Component ──────────────────────────────────────────────────────────────────

export function PullToRefresh({
  onRefresh,
  threshold = 72,
  maxPull = 120,
  children,
  className = '',
  disabled = false,
  refreshLabel = 'Pull to refresh',
  releaseLabel = 'Release to refresh',
  refreshingLabel = 'Refreshing...',
}: PullToRefreshProps) {
  const [state, setState] = useState<PTRState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isTracking = useRef(false);

  const isAtTop = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollTop <= 0;
  };

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || state === 'refreshing') return;
      if (!isAtTop()) return;
      startY.current = e.touches[0].clientY;
      isTracking.current = true;
    },
    [disabled, state]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isTracking.current || disabled || state === 'refreshing') return;
      if (!isAtTop()) {
        isTracking.current = false;
        return;
      }

      currentY.current = e.touches[0].clientY;
      const delta = currentY.current - startY.current;

      if (delta <= 0) {
        setPullDistance(0);
        setState('idle');
        return;
      }

      // Rubber-band effect: resistance increases as you pull further
      const rubber = Math.min(maxPull, delta * (1 - delta / (maxPull * 3)));
      setPullDistance(rubber);
      setState(rubber >= threshold ? 'ready' : 'pulling');

      if (delta > 5) {
        e.preventDefault();
      }
    },
    [disabled, state, threshold, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isTracking.current) return;
    isTracking.current = false;

    if (state === 'ready') {
      setState('refreshing');
      setPullDistance(threshold * 0.7);
      try {
        await onRefresh();
      } finally {
        setState('idle');
        setPullDistance(0);
      }
    } else {
      setState('idle');
      setPullDistance(0);
    }
  }, [state, threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(1, pullDistance / threshold);
  const isRefreshing = state === 'refreshing';

  const indicatorLabel = isRefreshing
    ? refreshingLabel
    : state === 'ready'
      ? releaseLabel
      : refreshLabel;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto ${className}`}
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex flex-col items-center justify-end overflow-hidden transition-all z-20 pointer-events-none"
        style={{
          height: pullDistance,
          transition: isRefreshing || state === 'idle' ? 'height 0.3s ease-out' : 'none',
        }}
      >
        <div
          className={`flex items-center gap-2 pb-2 transition-opacity ${pullDistance > 10 ? 'opacity-100' : 'opacity-0'}`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              state === 'ready' || isRefreshing
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}
            style={{
              transform: `rotate(${isRefreshing ? '360deg' : `${progress * 360}deg`})`,
              transition: isRefreshing ? 'transform 0.6s linear' : 'none',
            }}
          >
            <RefreshCw
              className="w-4 h-4"
              style={
                isRefreshing
                  ? { animation: 'spin 0.8s linear infinite' }
                  : { transform: `rotate(${-progress * 360}deg)` }
              }
            />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 select-none">
            {indicatorLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing || state === 'idle' ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>

      {/* Global spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
