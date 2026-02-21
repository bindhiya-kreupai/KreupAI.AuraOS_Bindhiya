"use client";

import React, { useState, useEffect } from "react";
import { History, ArrowUpRight, Filter, Search } from "lucide-react";

interface PayrollHistoryEntry {
  id: string;
  month: string;
  status: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalEmployerCost: number;
  currency: string;
  processedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  APPROVED: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  PROCESSED: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  PENDING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
  DRAFT: "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300",
};

export function CompReviewHistory() {
  const [history, setHistory] = useState<PayrollHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    fetch('/api/v1/payroll/history?limit=24')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setHistory(result.data || []);
        } else {
          setError('Failed to load payroll history');
        }
      })
      .catch((err) => {
        console.error('CompReviewHistory fetch error:', err);
        setError('Failed to load payroll history');
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredHistory = history.filter((entry) => {
    const matchesSearch =
      entry.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalGrossAll = history.reduce((s, e) => s + e.totalGross, 0);
  const totalNetAll = history.reduce((s, e) => s + e.totalNet, 0);
  const latestEntry = history.length > 0 ? history[0] : null;

  const uniqueStatuses = Array.from(new Set(history.map(h => h.status)));

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-20" />
          ))}
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 h-60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Payroll History</h2>
        <p className="text-sm text-silver-mist mt-1">Track past payroll runs and compensation disbursements.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Runs</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{history.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-green-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Gross Paid</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            ${totalGrossAll >= 1000000 ? (totalGrossAll / 1000000).toFixed(1) + 'M' : (totalGrossAll / 1000).toFixed(0) + 'K'}
          </p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Latest Run</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">
            {latestEntry ? latestEntry.month : 'N/A'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by month or status..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl placeholder:text-silver-mist focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-silver-mist" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/20"
          >
            <option>All</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-deep-cosmos">
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Pay Period</th>
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">Employees</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">Gross</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">Deductions</th>
                <th className="text-right text-xs font-medium text-silver-mist px-4 py-3">Net</th>
                <th className="text-left text-xs font-medium text-silver-mist px-4 py-3">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
              {filteredHistory.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-ink-black dark:text-pearl whitespace-nowrap">
                    {entry.month}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[entry.status] || statusColors.DRAFT}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-ink-black dark:text-pearl">
                    {entry.totalEmployees}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                    ${entry.totalGross.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono text-silver-mist">
                    ${entry.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium font-mono text-ink-black dark:text-pearl">
                    ${entry.totalNet.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-silver-mist whitespace-nowrap">
                    {entry.processedAt
                      ? new Date(entry.processedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : 'Pending'}
                  </td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-silver-mist">
                    No payroll history records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
