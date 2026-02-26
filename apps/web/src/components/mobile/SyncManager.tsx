/**
 * @module SyncManager
 * @description Offline sync management UI — pending operations list,
 *              conflict resolution, sync history, storage management,
 *              auto-sync settings (Sec 15.6)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  GitMerge,
  HardDrive,
  Settings,
  ChevronRight,
  Wifi,
  X,
} from 'lucide-react';
import {
  OfflineService,
  type QueuedAction,
  type SyncHistoryEntry,
  type AutoSyncSettings,
  type ConflictResolution,
} from '@/services/offlineService';

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: QueuedAction['status'] }) {
  const config = {
    pending: { label: 'Pending', icon: Clock, className: 'bg-blue-100 text-blue-700' },
    syncing: {
      label: 'Syncing',
      icon: RefreshCw,
      className: 'bg-violet-100 text-violet-700 animate-pulse',
    },
    success: { label: 'Synced', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700' },
    failed: { label: 'Failed', icon: XCircle, className: 'bg-red-100 text-red-700' },
    conflict: { label: 'Conflict', icon: GitMerge, className: 'bg-amber-100 text-amber-700' },
  }[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ── Conflict Resolution Modal ──────────────────────────────────────────────────

function ConflictModal({
  action,
  onResolve,
  onClose,
}: {
  action: QueuedAction;
  onResolve: (resolution: ConflictResolution, data?: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [mergeData, setMergeData] = useState<string>(
    JSON.stringify(action.conflictData?.clientValue ?? {}, null, 2)
  );
  const [activeTab, setActiveTab] = useState<'server' | 'client' | 'merge'>('client');

  const handleResolve = (resolution: ConflictResolution) => {
    if (resolution === 'manual-merge') {
      try {
        const parsed = JSON.parse(mergeData);
        onResolve('manual-merge', parsed);
      } catch {
        alert('Invalid JSON in merge editor');
        return;
      }
    } else {
      onResolve(resolution);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-800">Resolve Conflict</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
            A conflict was detected for{' '}
            <strong>{OfflineService.getActionTypeLabel(action.type)}</strong>. The same data was
            modified both locally and on the server.
          </div>

          <div className="flex border-b border-slate-200">
            {(['client', 'server', 'merge'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'client'
                  ? 'Your Version'
                  : tab === 'server'
                    ? 'Server Version'
                    : 'Manual Merge'}
              </button>
            ))}
          </div>

          {activeTab !== 'merge' ? (
            <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 overflow-x-auto">
              {JSON.stringify(
                activeTab === 'client'
                  ? action.conflictData?.clientValue
                  : action.conflictData?.serverValue,
                null,
                2
              )}
            </pre>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Edit the merged data below (must be valid JSON):
              </p>
              <textarea
                value={mergeData}
                onChange={(e) => setMergeData(e.target.value)}
                rows={8}
                className="w-full font-mono text-xs border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleResolve('client-wins')}
              className="px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              Keep Mine
            </button>
            <button
              onClick={() => handleResolve('server-wins')}
              className="px-3 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
            >
              Use Server
            </button>
            <button
              onClick={() => handleResolve('manual-merge')}
              className="px-3 py-2.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
            >
              Manual Merge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface SyncManagerProps {
  onClose?: () => void;
}

export default function SyncManager({ onClose }: SyncManagerProps) {
  const [queue, setQueue] = useState<QueuedAction[]>(OfflineService.getSyncQueue());
  const [history, setHistory] = useState<SyncHistoryEntry[]>(OfflineService.getSyncHistory());
  const [settings, setSettings] = useState<AutoSyncSettings>(OfflineService.getAutoSyncSettings());
  const [storage, setStorage] = useState(OfflineService.getStorageUsage());
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'storage' | 'settings'>('queue');
  const [conflictAction, setConflictAction] = useState<QueuedAction | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refresh = () => {
    setQueue(OfflineService.getSyncQueue());
    setHistory(OfflineService.getSyncHistory());
    setStorage(OfflineService.getStorageUsage());
  };

  const handleSync = async () => {
    setSyncing(true);
    await OfflineService.syncPending();
    refresh();
    setSyncing(false);
  };

  const handleRetry = (id: string) => {
    OfflineService.retryAction(id);
    refresh();
  };

  const handleDiscard = (id: string) => {
    OfflineService.discardAction(id);
    refresh();
  };

  const handleConflictResolve = (
    resolution: ConflictResolution,
    data?: Record<string, unknown>
  ) => {
    if (!conflictAction) return;
    OfflineService.resolveConflict(conflictAction.id, resolution, data);
    setConflictAction(null);
    refresh();
  };

  const handleClearCache = (days?: number) => {
    const date = days ? new Date(Date.now() - days * 86400_000) : undefined;
    const cleared = OfflineService.clearCache(date);
    refresh();
    alert(`Cleared ${cleared} cache entries`);
  };

  const updateSetting = <K extends keyof AutoSyncSettings>(key: K, value: AutoSyncSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    OfflineService.setAutoSyncSettings({ [key]: value });
  };

  const pendingQueue = queue.filter((a) => ['pending', 'failed', 'conflict'].includes(a.status));
  const storageUsedPct = (storage.used / storage.quota) * 100;

  return (
    <>
      {conflictAction && (
        <ConflictModal
          action={conflictAction}
          onResolve={handleConflictResolve}
          onClose={() => setConflictAction(null)}
        />
      )}

      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600" />
            <h1 className="font-bold text-slate-800">Sync Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
            {onClose && (
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            Online
          </div>
          <span>{pendingQueue.length} pending</span>
          <span>{history.length} sync history entries</span>
          <span>{OfflineService.formatBytes(storage.used)} used</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4">
          {(['queue', 'history', 'storage', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-3 text-xs font-medium border-b-2 -mb-px transition-colors capitalize ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
              {tab === 'queue' && pendingQueue.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-700 rounded-full px-1.5 text-[10px]">
                  {pendingQueue.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Queue tab */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              {pendingQueue.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">All actions synced!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending operations</p>
                </div>
              ) : (
                pendingQueue.map((action) => (
                  <div
                    key={action.id}
                    className={`border rounded-xl p-4 ${
                      action.status === 'conflict'
                        ? 'border-amber-300 bg-amber-50'
                        : action.status === 'failed'
                          ? 'border-red-200 bg-red-50'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={action.status} />
                          <span className="text-sm font-medium text-slate-800">
                            {OfflineService.getActionTypeLabel(action.type)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {action.endpoint} · {action.method}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Queued {new Date(action.createdAt).toLocaleTimeString()}
                          {action.retryCount > 0 && ` · ${action.retryCount} retries`}
                        </p>
                        {action.errorMessage && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {action.errorMessage}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        {action.status === 'conflict' && (
                          <button
                            onClick={() => setConflictAction(action)}
                            className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors font-medium"
                          >
                            <GitMerge className="w-3 h-3" />
                            Resolve
                          </button>
                        )}
                        {action.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(action.id)}
                            className="flex items-center gap-1 text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-lg transition-colors font-medium"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleDiscard(action.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">No sync history</div>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl"
                  >
                    {entry.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700">
                        {entry.itemsSynced} items synced
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleString()} · {entry.duration}ms
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Storage tab */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Storage Usage</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{OfflineService.formatBytes(storage.used)} used</span>
                    <span>{OfflineService.formatBytes(storage.quota)} total</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        storageUsedPct > 80
                          ? 'bg-red-500'
                          : storageUsedPct > 50
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                      }`}
                      style={{ width: `${storageUsedPct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="font-semibold text-slate-700">{storage.cacheEntries}</div>
                      <div className="text-slate-400">Cache entries</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <div className="font-semibold text-slate-700">{storage.actionQueueSize}</div>
                      <div className="text-slate-400">Queued actions</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800 text-sm">Clear Cache</h3>
                {[
                  { label: 'Clear entries older than 7 days', days: 7 },
                  { label: 'Clear entries older than 30 days', days: 30 },
                  { label: 'Clear all cache', days: undefined },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleClearCache(opt.days)}
                    className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-200 text-sm text-slate-700 hover:text-red-700 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                      {opt.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Auto-Sync Settings</h3>
                </div>

                {[
                  {
                    key: 'enabled' as const,
                    label: 'Auto-sync enabled',
                    description: 'Automatically sync when online',
                  },
                  {
                    key: 'wifiOnly' as const,
                    label: 'Wi-Fi only',
                    description: 'Only sync on Wi-Fi, not mobile data',
                  },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{setting.label}</p>
                      <p className="text-xs text-slate-400">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(setting.key, !settings[setting.key])}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center ${settings[setting.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                      <span
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settings[setting.key] ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                ))}

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Sync Interval</p>
                  <select
                    value={settings.intervalMinutes}
                    onChange={(e) => updateSetting('intervalMinutes', Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 10, 15, 30, 60].map((m) => (
                      <option key={m} value={m}>
                        Every {m} minutes
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Max Queue Size</p>
                  <select
                    value={settings.maxQueueSize}
                    onChange={(e) => updateSetting('maxQueueSize', Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[50, 100, 250, 500].map((s) => (
                      <option key={s} value={s}>
                        {s} operations
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
