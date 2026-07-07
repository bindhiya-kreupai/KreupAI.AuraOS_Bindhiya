'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Search, Download, Loader2, AlertCircle } from 'lucide-react';
import { LeaveBalanceService } from '../services';
import type { LeaveBalance } from '../types';

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await LeaveBalanceService.getBalances();
      setBalances(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load leave balances';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBalances = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return balances;
    return balances.filter((bal) => {
      const name = (bal.employeeName || '').toLowerCase();
      const type = (bal.leaveTypeName || bal.leaveTypeId || '').toLowerCase();
      return name.includes(query) || type.includes(query);
    });
  }, [balances, search]);

  const handleExport = () => {
    const headers = [
      'Employee',
      'Financial Year',
      'Leave Type',
      'Opening',
      'Accrued',
      'Availed',
      'Available Balance',
    ];
    const rows = filteredBalances.map((bal) => [
      bal.employeeName ?? '',
      bal.financialYear ?? '',
      bal.leaveTypeName ?? bal.leaveTypeId ?? '',
      String(bal.openingBalance ?? 0),
      String(bal.accrued ?? 0),
      String(bal.availed ?? 0),
      String(bal.availableBalance ?? 0),
    ]);
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leave-balances-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="w-6 h-6 text-indigo-500" />
            Leave Balance
          </h1>
          <p className="text-slate-500 text-sm">View and adjust employee leave balances.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              aria-label="Search employee"
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={loading || filteredBalances.length === 0}
            aria-label="Export balances to CSV"
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200 shrink-0"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4 text-center">Leave Type</th>
              <th className="px-6 py-4 text-center">Opening</th>
              <th className="px-6 py-4 text-center">Accrued</th>
              <th className="px-6 py-4 text-center">Availed</th>
              <th className="px-6 py-4 text-center">Available Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading leave balances...
                  </div>
                </td>
              </tr>
            ) : filteredBalances.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No leave balances found.
                </td>
              </tr>
            ) : (
              filteredBalances.map((bal, i) => {
                const initials =
                  bal.employeeName
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('') || 'NA';
                return (
                  <tr key={bal.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold">{bal.employeeName}</div>
                          <div className="text-xs text-slate-500">{bal.financialYear}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                      {bal.leaveTypeName || bal.leaveTypeId}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                      {bal.openingBalance ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                      {bal.accrued ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400">
                      {bal.availed ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 font-bold">
                        {bal.availableBalance ?? 0} Days
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
