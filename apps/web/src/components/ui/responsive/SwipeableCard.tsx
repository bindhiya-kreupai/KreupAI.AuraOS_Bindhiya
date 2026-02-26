'use client';

import React, { useRef, useState, useCallback } from 'react';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SwipeAction {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onAction: () => void;
  threshold?: number; // fraction of card width to trigger (default 0.35)
}

export interface SwipeableCardProps {
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────────

export const SWIPE_APPROVE: SwipeAction = {
  label: 'Approve',
  icon: CheckCircle,
  color: 'text-white',
  bgColor: 'bg-emerald-500',
  onAction: () => {},
};

export const SWIPE_REJECT: SwipeAction = {
  label: 'Reject',
  icon: XCircle,
  color: 'text-white',
  bgColor: 'bg-red-500',
  onAction: () => {},
};

// ── Component ──────────────────────────────────────────────────────────────────

export function SwipeableCard({
  leftAction,
  rightAction,
  disabled = false,
  className = '',
  children,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const SNAP_THRESHOLD = 0.35;
  const MAX_DRAG = 120;

  const getWidth = () => cardRef.current?.offsetWidth ?? 300;

  const snapBack = useCallback(() => {
    setIsSnapping(true);
    setTranslateX(0);
    setTimeout(() => setIsSnapping(false), 300);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      startX.current = e.clientX;
      currentX.current = e.clientX;
      setIsDragging(true);
      setIsSnapping(false);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [disabled]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || disabled) return;
      const delta = e.clientX - startX.current;
      // Clamp
      let clamped = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta));
      // Only allow drag in the direction of an action
      if (clamped < 0 && !rightAction) clamped = 0;
      if (clamped > 0 && !leftAction) clamped = 0;
      setTranslateX(clamped);
      currentX.current = e.clientX;
    },
    [isDragging, disabled, leftAction, rightAction]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const width = getWidth();
    const threshold = width * SNAP_THRESHOLD;

    if (translateX > threshold && leftAction) {
      // Swiped right — trigger left action
      setIsSnapping(true);
      setTranslateX(width);
      setTimeout(() => {
        leftAction.onAction();
        onSwipeRight?.();
        snapBack();
      }, 200);
    } else if (translateX < -threshold && rightAction) {
      // Swiped left — trigger right action
      setIsSnapping(true);
      setTranslateX(-width);
      setTimeout(() => {
        rightAction.onAction();
        onSwipeLeft?.();
        snapBack();
      }, 200);
    } else {
      snapBack();
    }
  }, [isDragging, translateX, leftAction, rightAction, onSwipeLeft, onSwipeRight, snapBack]);

  const revealLeft = translateX > 0 ? translateX : 0;
  const revealRight = translateX < 0 ? -translateX : 0;
  const threshold = getWidth() * SNAP_THRESHOLD;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} ref={cardRef}>
      {/* Left action background (swipe right reveals) */}
      {leftAction && (
        <div
          className={`absolute inset-y-0 left-0 flex items-center px-6 gap-2 rounded-l-2xl transition-all ${leftAction.bgColor}`}
          style={{ width: revealLeft + 8 }}
        >
          <leftAction.icon
            className={`w-5 h-5 ${leftAction.color} flex-shrink-0 transition-transform ${revealLeft >= threshold ? 'scale-125' : ''}`}
          />
          {revealLeft > 50 && (
            <span className={`text-sm font-semibold ${leftAction.color} whitespace-nowrap`}>
              {leftAction.label}
            </span>
          )}
        </div>
      )}

      {/* Right action background (swipe left reveals) */}
      {rightAction && (
        <div
          className={`absolute inset-y-0 right-0 flex items-center justify-end px-6 gap-2 rounded-r-2xl ${rightAction.bgColor}`}
          style={{ width: revealRight + 8 }}
        >
          {revealRight > 50 && (
            <span className={`text-sm font-semibold ${rightAction.color} whitespace-nowrap`}>
              {rightAction.label}
            </span>
          )}
          <rightAction.icon
            className={`w-5 h-5 ${rightAction.color} flex-shrink-0 transition-transform ${revealRight >= threshold ? 'scale-125' : ''}`}
          />
        </div>
      )}

      {/* Card content */}
      <div
        className={`relative z-10 touch-pan-y ${isSnapping ? 'transition-transform duration-300 ease-out' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {children}
      </div>
    </div>
  );
}

// ── Approval Card convenience wrapper ─────────────────────────────────────────

interface ApprovalSwipeCardProps {
  reportId: string;
  reportName: string;
  employeeName: string;
  amount: number;
  currency?: string;
  submittedDate?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export function ApprovalSwipeCard({
  reportId,
  reportName,
  employeeName,
  amount,
  currency = 'USD',
  submittedDate,
  onApprove,
  onReject,
  onViewDetail,
}: ApprovalSwipeCardProps) {
  const leftAction: SwipeAction = {
    ...SWIPE_APPROVE,
    onAction: () => onApprove(reportId),
  };
  const rightAction: SwipeAction = {
    ...SWIPE_REJECT,
    onAction: () => onReject(reportId),
  };

  return (
    <SwipeableCard leftAction={leftAction} rightAction={rightAction}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {reportName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{employeeName}</p>
            {submittedDate && (
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                {new Date(submittedDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              ${amount.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">{currency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 flex-1">Swipe to approve or reject</p>
          {onViewDetail && (
            <button
              onClick={() => onViewDetail(reportId)}
              className="flex items-center gap-1 text-xs text-indigo-600 font-medium"
            >
              Details <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </SwipeableCard>
  );
}
