'use client';

import React, { useState, useEffect } from 'react';
import { DoorOpen, CheckCircle2, Calendar, ArrowRight, X } from 'lucide-react';
import { ExitService } from '../services';

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'initiated':
      return 'Initiated';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return status || 'Unknown';
  }
}

export default function ExitManagementPage() {
  const [showModal, setShowModal] = useState(false);
  const [exitProcesses, setExitProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form state for initiating separation
  const [formData, setFormData] = useState({
    employeeName: '',
    exitType: 'resignation',
    lastWorkingDate: '',
    exitReason: '',
  });

  useEffect(() => {
    fetchExitProcesses();
  }, []);

  const fetchExitProcesses = async () => {
    try {
      setLoading(true);
      const data = await ExitService.getAllExitProcesses();
      setExitProcesses(data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateSeparation = async () => {
    try {
      setSubmitting(true);
      await ExitService.initiateExit({
        employeeName: formData.employeeName,
        exitType: formData.exitType as any,
        lastWorkingDate: new Date(formData.lastWorkingDate),
        exitReason: formData.exitReason,
      });
      setShowModal(false);
      setFormData({
        employeeName: '',
        exitType: 'resignation',
        lastWorkingDate: '',
        exitReason: '',
      });
      await fetchExitProcesses();
    } catch (error: any) {
      console.error('Error initiating separation:', error);
      setSubmitError('Failed to initiate separation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter to show active (non-completed) separations
  const activeSeparations = exitProcesses.filter((ep) => ep.status !== 'completed');

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-rose-500" />
            Exit Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage resignations, clearances, and offboarding.
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitError('');
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
        >
          Initiate Separation
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {!loading && exitProcesses.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <DoorOpen className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No exit processes found</p>
          <p className="text-sm">Exit processes will appear here once separations are initiated.</p>
        </div>
      )}

      {!loading && exitProcesses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Active Resignations */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-lg mb-2">Active Separations</h3>
            {activeSeparations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active separations. All processes are completed.</p>
              </div>
            ) : (
              activeSeparations.map((ep, i) => {
                const employeeName = ep.employeeName || 'Unknown Employee';
                const exitType = ep.exitType
                  ? ep.exitType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                  : 'N/A';
                const reason = ep.exitReason || 'N/A';
                const lwd = formatDate(ep.lastWorkingDate);
                const stage = getStatusLabel(ep.status);
                const clearancePending =
                  ep.clearanceItems?.filter((c: any) => c.status !== 'completed').length || 0;

                return (
                  <div
                    key={ep.exitId || i}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                        <img
                          src={`https://i.pravatar.cc/150?u=${employeeName}`}
                          alt={employeeName}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{employeeName}</h4>
                        <div className="text-sm text-slate-500">
                          {exitType} &bull; {reason}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">
                          Last Working Day
                        </div>
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> {lwd}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">
                          Current Stage
                        </div>
                        <div className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded text-sm cursor-pointer hover:bg-amber-100 transition-colors">
                          {stage}
                          {clearancePending > 0 && (
                            <span className="ml-1 text-xs text-amber-500">
                              ({clearancePending} clearance pending)
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Attrition Stats - kept as-is since it requires analytics endpoint */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Attrition Reasons</h3>
              <div className="space-y-3">
                {[
                  { reason: 'Better Compensation', pct: '45%' },
                  { reason: 'Career Growth', pct: '30%' },
                  { reason: 'Work-Life Balance', pct: '15%' },
                  { reason: 'Relocation', pct: '10%' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span>{item.reason}</span>
                      <span className="text-slate-500">{item.pct}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: item.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Initiate Employee Separation</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employee</label>
                <select
                  value={formData.employeeName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, employeeName: e.target.value }))
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select Employee...</option>
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Separation Type
                </label>
                <select
                  value={formData.exitType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exitType: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="resignation">Resignation</option>
                  <option value="termination">Termination</option>
                  <option value="retirement">Retirement</option>
                  <option value="end_of_contract">End of Contract</option>
                  <option value="layoff">Layoff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Reason</label>
                <input
                  type="text"
                  value={formData.exitReason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, exitReason: e.target.value }))}
                  placeholder="Enter reason for separation"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Last Working Day (Proposed)
                </label>
                <input
                  type="date"
                  value={formData.lastWorkingDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lastWorkingDate: e.target.value }))
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
            {submitError && (
              <div className="mx-6 mb-0 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-600 dark:text-rose-400">
                {submitError}
              </div>
            )}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiateSeparation}
                disabled={submitting}
                className="px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Initiating...' : 'Initiate Process'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
