'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Settings,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { PayrollRunService } from '../services';
import type { PayrollRun } from '../types';

export default function BankFileGenerationPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await PayrollRunService.getPayrollRuns();
      setPayrollRuns(result);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter for approved/disbursed payroll runs that are ready for bank file generation
  const eligibleRuns = payrollRuns.filter(
    (r) => r.status === 'approved' || r.status === 'disbursed'
  );
  const latestRun = eligibleRuns[0];

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

  const bankFormats = [
    { id: 'neft', name: 'NEFT Transfer', format: 'Text (.txt)' },
    { id: 'rtgs', name: 'RTGS Transfer', format: 'Text (.txt)' },
    { id: 'csv', name: 'CSV Export', format: 'CSV (.csv)' },
    { id: 'excel', name: 'Excel Export', format: 'Excel (.xlsx)' },
  ];

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
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
          <Settings className="w-4 h-4" /> Configure Formats
        </button>
      </div>

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
              <h3 className="font-bold text-lg mb-4">Select Bank Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bankFormats.map((bank) => (
                  <div
                    key={bank.id}
                    className="p-4 rounded-xl border cursor-pointer transition-all bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:ring-1 hover:ring-indigo-500/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold">{bank.name}</div>
                    </div>
                    <div className="text-xs text-slate-500 mb-4">Format: {bank.format}</div>
                    <button
                      onClick={() => {
                        const csv = `Bank Format,${bank.name}\nFormat,${bank.format}\nGenerated,${new Date().toISOString()}\n\nThis is a sample file. Real bank file generation requires the payroll run to be finalized and is produced server-side.`;
                        const blob = new Blob([csv], { type: 'text/plain;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${bank.id}-sample-${new Date().toISOString().split('T')[0]}.txt`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full py-2 bg-white dark:bg-slate-900 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" /> Download File
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
                  <span className="font-bold">{latestRun.monthName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Employees</span>
                  <span className="font-bold">{latestRun.totalEmployees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Net Pay</span>
                  <span className="font-bold font-mono">
                    $
                    {latestRun.totalNetPay.toLocaleString(undefined, {
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
