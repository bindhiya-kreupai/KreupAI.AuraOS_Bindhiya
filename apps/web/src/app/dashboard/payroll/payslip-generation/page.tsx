'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Send,
  Printer,
  Search,
  Download,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { PayslipService, PayrollRunService, PayrollRunLifecycleService } from '../services';
import { APIError } from '@/lib/api-client';
import type { Payslip, PayrollRun } from '../types';

type Feedback = { type: 'success' | 'error'; message: string };

/** Extract the most specific (bilingual-aware) message from an APIClient error. */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof APIError) {
    const resp = error.response as { error?: { message?: string } } | undefined;
    if (resp?.error?.message) return resp.error.message;
    if (error.message && error.message !== 'Request failed') return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function PayslipGenerationPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRunId, setSelectedRunId] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss feedback banner
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slips, runs] = await Promise.all([
        PayslipService.getPayslips(),
        PayrollRunService.getPayrollRuns(),
      ]);
      setPayslips(slips);
      setPayrollRuns(runs);
      // Default the run selector to the first available run
      setSelectedRunId((prev) => prev || runs[0]?.id || '');
    } catch (error: any) {
      console.error('Error:', error);
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Failed to load payslips.'),
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Publish All → finalize the selected payroll run (APPROVED → PAID).
   * Marking the run PAID also marks its payslips PAID, i.e. published to employees.
   */
  const handlePublishAll = useCallback(async () => {
    if (!selectedRunId) {
      setFeedback({ type: 'error', message: 'Select a payroll run to publish first.' });
      return;
    }
    if (
      !confirm(
        'Publish all payslips for the selected run? This finalizes the run and marks it as paid.'
      )
    )
      return;

    try {
      setPublishing(true);
      await PayrollRunLifecycleService.finalize(selectedRunId);
      await fetchData();
      setFeedback({ type: 'success', message: 'Payroll run finalized — payslips published.' });
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Failed to publish payslips.'),
      });
    } finally {
      setPublishing(false);
    }
  }, [selectedRunId]);

  /** Download a single payslip as an HTML document via the real pay-stub endpoint. */
  const handleDownload = useCallback(async (slip: Payslip) => {
    try {
      setBusyRowId(slip.id);
      const response = await fetch(`/api/v1/payroll/pay-stubs/${slip.id}/download?language=en`, {
        credentials: 'same-origin',
      });
      if (!response.ok) {
        let message = 'Failed to download payslip.';
        try {
          const body = await response.json();
          message = body?.error?.message || message;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(message);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `payslip-${slip.employeeCode}-${slip.month}.html`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      setFeedback({
        type: 'error',
        message: extractErrorMessage(error, 'Failed to download payslip.'),
      });
    } finally {
      setBusyRowId(null);
    }
  }, []);

  /** Print → open the rendered payslip HTML in a new tab (same-origin cookies). */
  const handlePrint = useCallback((slip: Payslip) => {
    const printWindow = window.open(
      `/api/v1/payroll/pay-stubs/${slip.id}/download?language=en`,
      '_blank',
      'noopener,noreferrer'
    );
    if (!printWindow) {
      setFeedback({
        type: 'error',
        message: 'Unable to open print window. Please allow pop-ups for this site.',
      });
    }
  }, []);

  const filteredPayslips = payslips.filter(
    (slip) =>
      slip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            Payslip Generation
          </h1>
          <p className="text-slate-500 text-sm">
            Generate, preview, and distribute monthly payslips.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePublishAll}
            disabled={publishing || !selectedRunId}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}{' '}
            {publishing ? 'Publishing...' : 'Publish All'}
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <span className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {feedback.message}
          </span>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm font-bold"
          >
            {payrollRuns.length > 0 ? (
              payrollRuns.map((run) => (
                <option key={run.id} value={run.id}>
                  {run.monthName}
                </option>
              ))
            ) : (
              <option>No payroll runs</option>
            )}
          </select>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
          <span className="text-sm font-bold text-slate-500">{payslips.length} Employees</span>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm text-slate-500 font-medium">Loading payslips...</p>
            </div>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">
              No Payslips Found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm
                ? 'No results match your search.'
                : 'Process a payroll run to generate payslips.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Designation</th>
                  <th className="px-6 py-3">Net Pay</th>
                  <th className="px-6 py-3">Sent Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {slip.employeeName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold">{slip.employeeName}</div>
                        <div className="text-xs text-slate-500">{slip.employeeCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{slip.designation}</td>
                    <td className="px-6 py-4 font-mono font-bold">
                      $
                      {slip.netPay.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {slip.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-full capitalize">
                          {slip.paymentStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(slip)}
                          disabled={busyRowId === slip.id}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download"
                        >
                          {busyRowId === slip.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handlePrint(slip)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
