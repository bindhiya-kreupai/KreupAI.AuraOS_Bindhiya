'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Settings,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  History,
  X,
} from 'lucide-react';
import { APIClient } from '@/lib/api-client';
import { PayrollRunService } from '../services';
import type { PayrollRun } from '../types';

// The server-side route (/api/payroll/bank-file) produces exactly these formats.
// Do NOT offer formats the backend cannot generate.
type BankFormat = 'NEFT' | 'RTGS' | 'WPS';

const BANK_FORMATS: {
  id: BankFormat;
  name: string;
  file: string;
  description: string;
}[] = [
  {
    id: 'NEFT',
    name: 'NEFT Transfer',
    file: 'Text (.txt)',
    description: 'Header/detail/trailer positional file for standard NEFT bulk salary uploads.',
  },
  {
    id: 'RTGS',
    name: 'RTGS Transfer',
    file: 'JSON (.txt)',
    description: 'Structured transaction batch for high-value RTGS corporate transfers.',
  },
  {
    id: 'WPS',
    name: 'WPS (Wage Protection System)',
    file: 'Text (.txt)',
    description:
      'GCC Wage Protection System salary file (currency-aware) for MoHRE/labour compliance.',
  },
];

interface BankFileResult {
  fileContent: string;
  fileName: string;
  format: string;
  employeeCount: number;
  totalAmount: number;
  payrollRunId: string;
  currency?: string;
  generatedAt: string;
}

interface BankFileHistoryItem {
  id: string;
  payrollRunId: string;
  fileName: string;
  format: string;
  month: string;
  employeeCount: number;
  totalAmount: number;
  status: string;
  generatedAt?: string;
  currency?: string;
}

type Feedback = { type: 'success' | 'error'; message: string } | null;

export default function BankFileGenerationPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [history, setHistory] = useState<BankFileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<BankFormat | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<BankFormat>('NEFT');
  const [showConfig, setShowConfig] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [runs, historyResp] = await Promise.all([
        PayrollRunService.getPayrollRuns(),
        APIClient.get<{ success: boolean; data: BankFileHistoryItem[] }>('/payroll/bank-file', {
          page: 1,
          limit: 10,
        }).catch(() => ({ success: false, data: [] as BankFileHistoryItem[] })),
      ]);
      setPayrollRuns(runs);
      setHistory(Array.isArray(historyResp?.data) ? historyResp.data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Eligible = approved / paid / disbursed (robust to case + v1 uppercase enums)
  const eligibleRuns = payrollRuns.filter((r) =>
    /approved|paid|disbursed/i.test(String(r.status ?? ''))
  );
  const latestRun = eligibleRuns[0];

  const handleGenerate = async (format: BankFormat) => {
    if (!latestRun) return;
    setGenerating(format);
    setFeedback(null);
    try {
      const resp = await APIClient.post<{
        success: boolean;
        data?: BankFileResult;
        error?: string;
      }>('/payroll/bank-file', {
        payrollRunId: latestRun.id,
        bankFormat: format,
      });

      if (!resp?.success || !resp.data?.fileContent) {
        throw new Error(resp?.error || 'Bank file generation returned no content');
      }

      // Server-generated real content — trigger a browser download.
      const { fileContent, fileName } = resp.data;
      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `PAYROLL_${format}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: `${format} bank file generated for ${resp.data.employeeCount} employees (total ${resp.data.totalAmount.toLocaleString()}).`,
      });
      // Refresh history to reflect the newly generated file.
      void fetchData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to generate bank file',
      });
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Loading bank file data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
            Bank File Generation
          </h1>
          <p className="text-slate-500 text-sm">
            Generate salary transfer files compatible with corporate banking portals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchData()}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => setShowConfig((v) => !v)}
            aria-expanded={showConfig}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 ${
              showConfig
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Settings className="w-4 h-4" /> Configure Formats
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Configure Formats panel — controls the active format used for generation */}
      {showConfig && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Configure Bank Format
            </h3>
            <button
              onClick={() => setShowConfig(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close configuration"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Select the active format used when generating the bank file. Only formats produced
            server-side are listed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BANK_FORMATS.map((fmt) => {
              const active = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    active
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold">{fmt.name}</span>
                    {active && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                  </div>
                  <div className="text-xs text-slate-500">{fmt.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {eligibleRuns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
            No Approved Payroll Runs
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Approve a payroll run to generate bank transfer files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Generate Bank File</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300">
                  Active: {selectedFormat}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BANK_FORMATS.map((bank) => {
                  const isActive = selectedFormat === bank.id;
                  const isBusy = generating === bank.id;
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedFormat(bank.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all bg-white dark:bg-slate-800 ${
                        isActive
                          ? 'border-indigo-500 ring-1 ring-indigo-500/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold">{bank.name}</div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <div className="text-xs text-slate-500 mb-4">Format: {bank.file}</div>
                      <button
                        disabled={isBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleGenerate(bank.id);
                        }}
                        className="w-full py-2 bg-white dark:bg-slate-900 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" /> Generate &amp; Download
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Files are generated server-side from the finalized payroll run —{' '}
                {latestRun.monthName || latestRun.month}.
              </p>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" /> Recent Payroll Runs
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                      <div>
                        <div className="font-bold">{item.month}</div>
                        <div className="text-xs text-slate-500">
                          {item.employeeCount} employees &middot; {item.status}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold">
                        {item.currency || ''}{' '}
                        {Number(item.totalAmount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <CreditCard className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100">
                  Direct Integration Available
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-3">
                  Connect directly with your corporate banking portal to process salaries without
                  manual file uploads.
                </p>
                <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  Setup Integration <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Status Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold mb-4">Batch Summary</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Payroll Run</span>
                  <span className="font-bold">{latestRun.monthName || latestRun.month}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Employees</span>
                  <span className="font-bold">{latestRun.totalEmployees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Net Pay</span>
                  <span className="font-bold font-mono">
                    {Number(latestRun.totalNetPay || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold capitalize">{latestRun.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Active Format</span>
                  <span className="font-bold">{selectedFormat}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
