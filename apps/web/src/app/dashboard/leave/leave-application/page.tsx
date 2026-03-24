'use client';

import React, { useState, useEffect } from 'react';
import { CalendarPlus, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { LeaveRequestService } from '../services';
import type { LeaveRequest } from '../types';

export default function LeaveApplicationPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const result = await LeaveRequestService.getRequests({ status: 'pending' });
      setRequests(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await LeaveRequestService.approveRequest(id, 'current-user', 'Manager');
      await fetchRequests();
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await LeaveRequestService.rejectRequest(id, 'current-user', 'Manager', 'Rejected by manager');
      await fetchRequests();
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-indigo-500" />
            Leave Application
          </h1>
          <p className="text-slate-500 text-sm">Review and approve employee time-off requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Pending Requests</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading pending requests...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No pending leave requests found.
                </div>
              ) : (
                requests.map((req, i) => {
                  const initials =
                    req.employeeName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') || 'NA';
                  const dateRange =
                    req.fromDate === req.toDate
                      ? new Date(req.fromDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : `${new Date(req.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(req.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                  return (
                    <div
                      key={req.id || i}
                      className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold">{req.employeeName}</div>
                            <div className="text-sm text-slate-500">{req.leaveTypeName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">{req.totalDays} Day(s)</div>
                          <div className="text-xs text-slate-400">{dateRange}</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">
                        &quot;{req.reason}&quot;
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-1.5 rounded-lg text-sm font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Pending
                </span>
                <span className="font-bold text-lg text-indigo-600">{requests.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                  {requests.length}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-500">Pending Req</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
