"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Clock, RefreshCw, Activity } from "lucide-react";

interface SyncRecord {
  id: string;
  integrationName: string;
  direction: "inbound" | "outbound";
  status: "success" | "failed" | "pending";
  recordsProcessed: number;
  timestamp: string;
  duration: string;
  errorMessage?: string;
}

const SYNC_HISTORY: SyncRecord[] = [
  { id: "1", integrationName: "Slack", direction: "outbound", status: "success", recordsProcessed: 45, timestamp: "2 min ago", duration: "1.2s" },
  { id: "2", integrationName: "Microsoft Teams", direction: "outbound", status: "success", recordsProcessed: 12, timestamp: "5 min ago", duration: "0.8s" },
  { id: "3", integrationName: "Outlook Calendar", direction: "inbound", status: "success", recordsProcessed: 28, timestamp: "10 min ago", duration: "2.1s" },
  { id: "4", integrationName: "QuickBooks", direction: "outbound", status: "failed", recordsProcessed: 0, timestamp: "15 min ago", duration: "5.0s", errorMessage: "Authentication expired" },
  { id: "5", integrationName: "Zoom", direction: "inbound", status: "success", recordsProcessed: 8, timestamp: "1 hour ago", duration: "0.5s" },
  { id: "6", integrationName: "Slack", direction: "outbound", status: "pending", recordsProcessed: 0, timestamp: "Queued", duration: "-" },
];

interface SyncStatusProps {
  onRetry?: (recordId: string) => void;
}

export default function SyncStatus({ onRetry }: SyncStatusProps) {
  const statusConfig = {
    success: { icon: CheckCircle2, color: "text-aurora-green", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    failed: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  };

  const stats = {
    success: SYNC_HISTORY.filter((s) => s.status === "success").length,
    failed: SYNC_HISTORY.filter((s) => s.status === "failed").length,
    pending: SYNC_HISTORY.filter((s) => s.status === "pending").length,
    totalRecords: SYNC_HISTORY.reduce((acc, s) => acc + s.recordsProcessed, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Activity className="w-5 h-5 text-celestial-indigo" />
            Sync Status
          </h2>
          <p className="text-silver-mist text-sm">Monitor integration sync health and history.</p>
        </div>
        <button className="px-3 py-1.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-xs font-medium flex items-center gap-1.5 text-ink-black dark:text-pearl">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-emerald-600">{stats.success}</div>
          <div className="text-xs text-emerald-500">Successful</div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-rose-600">{stats.failed}</div>
          <div className="text-xs text-rose-500">Failed</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-amber-500">Pending</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{stats.totalRecords}</div>
          <div className="text-xs text-blue-500">Records Synced</div>
        </div>
      </div>

      {/* Sync History */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30 overflow-hidden">
        <div className="divide-y divide-cloud dark:divide-nebula-purple/30">
          {SYNC_HISTORY.map((record) => {
            const config = statusConfig[record.status];
            const StatusIcon = config.icon;
            return (
              <div key={record.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-deep-cosmos/50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">{record.integrationName}</p>
                    <div className="flex items-center gap-2 text-[10px] text-silver-mist">
                      <span className={`px-1.5 py-0.5 rounded ${record.direction === "inbound" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "bg-purple-50 dark:bg-purple-900/20 text-purple-600"}`}>
                        {record.direction}
                      </span>
                      <span>{record.recordsProcessed} records</span>
                      <span>{record.duration}</span>
                    </div>
                    {record.errorMessage && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{record.errorMessage}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-silver-mist">{record.timestamp}</span>
                  {record.status === "failed" && (
                    <button onClick={() => onRetry?.(record.id)} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded text-[10px] font-medium">
                      Retry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
