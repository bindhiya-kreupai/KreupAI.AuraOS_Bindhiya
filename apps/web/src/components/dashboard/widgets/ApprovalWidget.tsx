"use client";

import React from 'react';
import { CheckCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';

const pendingApprovals = [
  { id: '1', type: 'Leave', requester: 'Emily Davis', days: '3 days', date: 'Jan 20-22' },
  { id: '2', type: 'Expense', requester: 'Raj Patel', days: '$450', date: 'Jan 18' },
  { id: '3', type: 'Timesheet', requester: 'Anna Lee', days: '40h', date: 'Week 3' },
];

export function ApprovalWidget() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sunset-amber/10 text-sunset-amber text-[10px] font-bold">
            {pendingApprovals.length}
          </span>
          <span className="text-xs text-silver-mist">Pending</span>
        </div>
        <Link href="/dashboard/my-services/request-center" className="text-xs text-celestial-indigo font-medium hover:underline">
          View All
        </Link>
      </div>
      <div className="space-y-2">
        {pendingApprovals.map((approval) => (
          <div key={approval.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
            <FileText className="w-3.5 h-3.5 text-silver-mist flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">{approval.requester}</p>
              <p className="text-[10px] text-silver-mist">{approval.type} - {approval.days}</p>
            </div>
            <button className="p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-500">
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
