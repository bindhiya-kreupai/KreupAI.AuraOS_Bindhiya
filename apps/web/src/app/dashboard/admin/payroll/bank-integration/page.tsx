'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Landmark,
  FileSpreadsheet,
  Settings,
  CheckCircle2,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react';

interface BankFile {
  id: string;
  payrollRunId: string;
  fileName: string;
  format: string;
  month: string;
  employeeCount: number;
  totalAmount: number;
  status: string;
  generatedAt: string | null;
  currency: string | null;
}

type TabKey = 'Accounts' | 'Configuration' | 'History';

/**
 * Corporate disbursement gateway formats (config-driven). Corporate bank-account
 * records are not persisted yet; the History tab is backed by the real
 * /api/payroll/bank-file endpoint (generated bank files from payroll runs).
 */
const OUTPUT_FORMATS = ['NEFT', 'NACH', 'Excel', 'CSV'];

function formatAmount(amount: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return amount.toLocaleString();
  }
}

export default function BankIntegrationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('History');
  const [selectedFormat, setSelectedFormat] = useState('NEFT');
  const [bankFiles, setBankFiles] = useState<BankFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/payroll/bank-file');
      if (!response.ok) {
        throw new Error('Failed to load bank file history');
      }
      const result = await response.json();
      setBankFiles(result.data ?? []);
    } catch (err) {
      console.error('Failed to fetch bank files:', err);
      setError('Unable to load bank file history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-500" />
            Bank Integration
          </h1>
          <p className="text-silver-mist text-sm">
            Manage disbursement gateways and generated bank files.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-fit">
            {(['History', 'Configuration', 'Accounts'] as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-white dark:bg-stellar-blue text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-20">
            {activeTab === 'History' && (
              <div className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading bank files...
                  </div>
                ) : bankFiles.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    No bank files generated yet. Bank files appear here once payroll runs are
                    approved or paid.
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold">
                      <tr>
                        <th className="p-4">File Name</th>
                        <th className="p-4">Month</th>
                        <th className="p-4">Employees</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cloud dark:divide-slate-800">
                      {bankFiles.map((file) => (
                        <tr
                          key={file.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors"
                        >
                          <td className="p-4 font-mono text-slate-500">{file.fileName}</td>
                          <td className="p-4 font-medium text-ink-black dark:text-pearl">
                            {file.month}
                          </td>
                          <td className="p-4 text-slate-500">{file.employeeCount}</td>
                          <td className="p-4 font-bold text-ink-black dark:text-pearl">
                            {formatAmount(file.totalAmount, file.currency)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                file.status === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {file.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'Configuration' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50">
                  <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-500" /> Output File Format
                  </h3>

                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {OUTPUT_FORMATS.map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                          selectedFormat === fmt
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600'
                            : 'bg-white dark:bg-stellar-blue border-cloud dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-sm font-bold">{fmt}</span>
                        {selectedFormat === fmt && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                    <div className="text-sm font-bold text-ink-black dark:text-pearl mb-1">
                      File Header Structure
                    </div>
                    <div className="font-mono text-xs text-slate-500 bg-white dark:bg-slate-900 p-3 rounded border border-cloud dark:border-slate-800 mt-2">
                      Beneficiary_Name | Account_No | IFSC | Amount | Ref_ID
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Accounts' && (
              <div className="bg-white dark:bg-stellar-blue p-8 rounded-2xl border border-cloud dark:border-nebula-purple/50 text-center">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-ink-black dark:text-pearl mb-1">
                  Corporate accounts not configured
                </h3>
                <p className="text-sm text-silver-mist">
                  Corporate bank account records are managed via the banking connector. Generated
                  disbursement files appear under the History tab.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 shrink-0">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Secure Environment
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-4">
              Bank file payloads are encrypted at rest. API requests are signed with rotating keys.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> SSL/TLS Verified
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1">
            <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Gateway Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Active Format</label>
                <div className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-mono">
                  {selectedFormat}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MoreVertical className="w-4 h-4" /> Configure formats under the Configuration tab.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
