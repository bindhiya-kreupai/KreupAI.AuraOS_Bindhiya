'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, CheckCircle, Clock, Send, FileText, Download, X, Loader2 } from 'lucide-react';
import { APIClient } from '@/lib/api-client';

interface PolicySummary {
  id: string;
  title: string;
  category: string;
  version: string;
  status: string;
  effectiveDate: string | null;
  acknowledgedCount: number;
  totalRequired: number;
  pendingCount: number;
  percentage: number;
}

interface Aggregate {
  overallPct: number;
  totalPolicies: number;
  pendingCount: number;
}

interface ReportRow {
  employeeId: string;
  employeeCode: string;
  name: string;
  email: string;
  acknowledgedAt?: string;
}

interface ReportData {
  policy: { id: string; title: string };
  acknowledged: ReportRow[];
  pending: ReportRow[];
  acknowledgedCount: number;
  pendingCount: number;
}

type ToastState = { type: 'success' | 'error'; message: string } | null;

export default function PolicyAcknowledgementPage() {
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [aggregate, setAggregate] = useState<Aggregate>({
    overallPct: 0,
    totalPolicies: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [reportPolicy, setReportPolicy] = useState<PolicySummary | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reminding, setReminding] = useState<string | null>(null);

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await APIClient.get<any>('/api/security/policy-acknowledgement', { limit: 200 });
      setPolicies(APIClient.unwrapList<PolicySummary>(res));
      const meta = res?.meta || {};
      setAggregate({
        overallPct: meta.overallPct ?? 0,
        totalPolicies: meta.totalPolicies ?? 0,
        pendingCount: meta.pendingCount ?? 0,
      });
    } catch {
      notify('error', 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const fetchReport = useCallback(async (policyId: string): Promise<ReportData | null> => {
    const res = await APIClient.get<any>(`/api/security/policy-acknowledgement/${policyId}/report`);
    return APIClient.unwrapItem<ReportData>(res);
  }, []);

  const openReport = useCallback(
    async (policy: PolicySummary) => {
      setReportPolicy(policy);
      setReport(null);
      setReportLoading(true);
      try {
        const data = await fetchReport(policy.id);
        setReport(data);
      } catch {
        notify('error', 'Failed to load report');
        setReportPolicy(null);
      } finally {
        setReportLoading(false);
      }
    },
    [fetchReport, notify]
  );

  const sendReminder = useCallback(
    async (policy: PolicySummary) => {
      setReminding(policy.id);
      try {
        const res = await APIClient.post<any>(
          `/api/security/policy-acknowledgement/${policy.id}/remind`,
          {}
        );
        const item = APIClient.unwrapItem<{ sent: number }>(res);
        notify('success', `Reminders queued for ${item?.sent ?? 0} employee(s)`);
        await load();
      } catch {
        notify('error', 'Failed to send reminders');
      } finally {
        setReminding(null);
      }
    },
    [load, notify]
  );

  const sendAllReminders = useCallback(async () => {
    const pending = policies.filter((p) => p.pendingCount > 0);
    if (pending.length === 0) {
      notify('success', 'All policies are fully acknowledged');
      return;
    }
    setReminding('__all__');
    try {
      let sent = 0;
      for (const p of pending) {
        const res = await APIClient.post<any>(
          `/api/security/policy-acknowledgement/${p.id}/remind`,
          {}
        );
        const item = APIClient.unwrapItem<{ sent: number }>(res);
        sent += item?.sent ?? 0;
      }
      notify('success', `Reminders queued across ${pending.length} policies (${sent} recipients)`);
      await load();
    } catch {
      notify('error', 'Failed to send reminders');
    } finally {
      setReminding(null);
    }
  }, [policies, load, notify]);

  const downloadReport = useCallback(
    async (policy: PolicySummary) => {
      try {
        const data = await fetchReport(policy.id);
        if (!data) {
          notify('error', 'No report data');
          return;
        }
        const header = 'Status,Employee Code,Name,Email,Acknowledged At';
        const lines: string[] = [header];
        for (const r of data.acknowledged) {
          lines.push(
            `Acknowledged,"${r.employeeCode}","${r.name}","${r.email}","${r.acknowledgedAt ?? ''}"`
          );
        }
        for (const r of data.pending) {
          lines.push(`Pending,"${r.employeeCode}","${r.name}","${r.email}",`);
        }
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `policy-${policy.id}-acknowledgements.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        notify('success', 'Report downloaded');
      } catch {
        notify('error', 'Failed to download report');
      }
    },
    [fetchReport, notify]
  );

  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        })
      : '—';

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Policy Acknowledgement
          </h1>
          <p className="text-slate-500 text-sm">
            Track employee signatures on mandatory company policies.
          </p>
        </div>
        <button
          onClick={sendAllReminders}
          disabled={reminding === '__all__'}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-60"
        >
          {reminding === '__all__' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}{' '}
          Send Reminders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 container mx-auto">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {aggregate.overallPct}%
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Global Compliance
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {aggregate.pendingCount}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Pending Signatures
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                {aggregate.totalPolicies}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Active Policies
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Policy List */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : policies.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-bold">No policies found</p>
              <p className="text-sm">
                Publish a policy document to start tracking acknowledgements.
              </p>
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3"
              >
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">
                    {policy.title}{' '}
                    <span className="text-xs font-normal text-slate-400">v{policy.version}</span>
                  </h3>
                  <p className="text-sm text-slate-500">
                    Effective: {fmtDate(policy.effectiveDate)}
                  </p>
                </div>

                <div className="flex-1 w-full md:w-auto">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">
                      {policy.acknowledgedCount} / {policy.totalRequired} Signed
                    </span>
                    <span
                      className={policy.percentage === 100 ? 'text-emerald-600' : 'text-indigo-600'}
                    >
                      {policy.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        policy.percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${policy.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => openReport(policy)}
                    className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => sendReminder(policy)}
                    disabled={reminding === policy.id || policy.pendingCount === 0}
                    title="Send reminders to pending employees"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40"
                  >
                    {reminding === policy.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadReport(policy)}
                    title="Download CSV report"
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Modal */}
      {reportPolicy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg">{reportPolicy.title}</h3>
                <p className="text-xs text-slate-500">Acknowledgement report</p>
              </div>
              <button
                onClick={() => {
                  setReportPolicy(null);
                  setReport(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {reportLoading || !report ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-emerald-600 mb-2">
                      Acknowledged ({report.acknowledgedCount})
                    </h4>
                    <div className="space-y-1">
                      {report.acknowledged.length === 0 ? (
                        <p className="text-sm text-slate-400">None yet.</p>
                      ) : (
                        report.acknowledged.map((r) => (
                          <div
                            key={r.employeeId}
                            className="text-sm p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg"
                          >
                            <span className="font-bold">{r.name}</span>
                            <span className="text-slate-400"> · {r.employeeCode}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-amber-600 mb-2">
                      Pending ({report.pendingCount})
                    </h4>
                    <div className="space-y-1">
                      {report.pending.length === 0 ? (
                        <p className="text-sm text-slate-400">Everyone signed.</p>
                      ) : (
                        report.pending.map((r) => (
                          <div
                            key={r.employeeId}
                            className="text-sm p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg"
                          >
                            <span className="font-bold">{r.name}</span>
                            <span className="text-slate-400"> · {r.employeeCode}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => downloadReport(reportPolicy)}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
