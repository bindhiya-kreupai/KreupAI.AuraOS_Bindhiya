/**
 * @module OfflineIndicator
 * @description Offline status banner — offline warning, pending sync badge,
 *              auto-sync animation, manual sync, last synced timestamp (Sec 15.6)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
} from 'lucide-react';
import { OfflineService, type OfflineStatus } from '@/services/offlineService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OfflineIndicatorProps {
  onOpenSyncManager?: () => void;
  compact?: boolean; // for mobile toolbar
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return 'Never';
  const diff = Date.now() - new Date(isoString).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return new Date(isoString).toLocaleDateString();
}

// ── Compact mode (mobile toolbar dot indicator) ────────────────────────────────

function CompactIndicator({
  status,
  syncing,
  onSync,
}: {
  status: OfflineStatus;
  syncing: boolean;
  onSync: () => void;
}) {
  const pendingTotal = status.pendingCount + status.failedCount + status.conflictCount;

  if (status.isOnline && pendingTotal === 0) {
    return (
      <div className="flex items-center gap-1 text-emerald-600">
        <Wifi className="w-4 h-4" />
        <span className="text-xs font-medium">Online</span>
      </div>
    );
  }

  return (
    <button
      onClick={onSync}
      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
        !status.isOnline ? 'text-amber-600' : 'text-blue-600'
      }`}
    >
      {!status.isOnline ? (
        <WifiOff className={`w-4 h-4 ${syncing ? 'animate-pulse' : ''}`} />
      ) : (
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      )}
      {pendingTotal > 0 && (
        <span className="bg-current text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
          {Math.min(pendingTotal, 9)}
        </span>
      )}
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OfflineIndicator({
  onOpenSyncManager,
  compact = false,
}: OfflineIndicatorProps) {
  const [status, setStatus] = useState<OfflineStatus>(OfflineService.getOfflineStatus());
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    failed: number;
    conflicts: number;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [storageUsage, setStorageUsage] = useState(OfflineService.getStorageUsage());

  const refreshStatus = useCallback(() => {
    setStatus(OfflineService.getOfflineStatus());
    setStorageUsage(OfflineService.getStorageUsage());
  }, []);

  useEffect(() => {
    const unsubscribe = OfflineService.onConnectionChange((online) => {
      setStatus((prev) => ({ ...prev, isOnline: online }));
      setDismissed(false);
      // Auto-sync when coming back online
      if (online) handleSync();
    });

    const interval = setInterval(refreshStatus, 30_000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [refreshStatus]);

  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);
    const result = await OfflineService.syncPending();
    setSyncing(false);
    setSyncResult(result);
    refreshStatus();
    // Clear result after 3s
    setTimeout(() => setSyncResult(null), 3000);
  }, [syncing, refreshStatus]);

  if (compact) {
    return <CompactIndicator status={status} syncing={syncing} onSync={handleSync} />;
  }

  const pendingTotal = status.pendingCount + status.failedCount + status.conflictCount;
  const storageUsedPct = (storageUsage.used / storageUsage.quota) * 100;
  const isAllGood = status.isOnline && pendingTotal === 0;

  if (isAllGood && dismissed) return null;

  return (
    <div
      className={`w-full transition-all ${
        !status.isOnline ? 'bg-amber-500' : pendingTotal > 0 ? 'bg-blue-600' : 'bg-emerald-500'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2">
        {/* Status icon */}
        <div className="flex-shrink-0">
          {!status.isOnline ? (
            <WifiOff className="w-4 h-4 text-white" />
          ) : syncing ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : syncResult ? (
            syncResult.failed > 0 ? (
              <AlertTriangle className="w-4 h-4 text-white" />
            ) : (
              <CheckCircle className="w-4 h-4 text-white" />
            )
          ) : (
            <Wifi className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Main message */}
        <div className="flex-1 min-w-0">
          {!status.isOnline ? (
            <div className="text-white text-xs font-semibold">
              You&apos;re offline — changes will sync when connected
            </div>
          ) : syncing ? (
            <div className="text-white text-xs font-medium animate-pulse">
              Syncing {pendingTotal} pending {pendingTotal === 1 ? 'item' : 'items'}...
            </div>
          ) : syncResult ? (
            <div className="text-white text-xs font-medium">
              Sync complete: {syncResult.synced} synced
              {syncResult.failed > 0 && `, ${syncResult.failed} failed`}
              {syncResult.conflicts > 0 && `, ${syncResult.conflicts} conflicts`}
            </div>
          ) : pendingTotal > 0 ? (
            <div className="text-white text-xs font-medium">
              {pendingTotal} item{pendingTotal !== 1 ? 's' : ''} pending sync
              {status.conflictCount > 0 &&
                ` · ${status.conflictCount} conflict${status.conflictCount !== 1 ? 's' : ''}`}
            </div>
          ) : (
            <div className="text-white text-xs font-medium">All changes synced</div>
          )}

          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1 text-white/70 text-[10px]">
              <Clock className="w-3 h-3" />
              <span>Last sync: {formatRelativeTime(status.lastSynced)}</span>
            </div>
            {storageUsedPct > 0 && (
              <div className="flex items-center gap-1 text-white/70 text-[10px]">
                <HardDrive className="w-3 h-3" />
                <span>{OfflineService.formatBytes(storageUsage.used)} used</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {pendingTotal > 0 && (
            <span className="bg-white text-blue-700 text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {pendingTotal}
            </span>
          )}
          {status.isOnline && pendingTotal > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1 text-white/90 hover:text-white text-xs font-medium disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sync now
            </button>
          )}
          {onOpenSyncManager && (
            <button
              onClick={onOpenSyncManager}
              className="text-white/80 hover:text-white text-xs underline transition-colors"
            >
              Manage
            </button>
          )}
          {isAllGood && (
            <button
              onClick={() => setDismissed(true)}
              className="text-white/60 hover:text-white/80 text-sm leading-none transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Storage bar (shown when storage > 50%) */}
      {storageUsedPct > 50 && (
        <div className="px-4 pb-1.5">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all ${storageUsedPct > 80 ? 'bg-red-300' : 'bg-white/60'}`}
              style={{ width: `${storageUsedPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
