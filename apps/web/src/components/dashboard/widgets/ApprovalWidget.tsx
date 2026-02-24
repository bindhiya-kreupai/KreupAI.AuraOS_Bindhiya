/**
 * @module ApprovalWidget
 * @description Pending approval count + list widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { CheckSquare, Clock, FileText, CalendarDays, DollarSign } from 'lucide-react';

interface ApprovalItem {
  id: string;
  type: string;
  requester: string;
  description: string;
  date: string;
  icon: LucideIcon;
  href: string;
}

export const ApprovalWidget: React.FC = () => {
  // Mock data – in production, fetch from approvals API
  const pendingApprovals: ApprovalItem[] = [
    {
      id: '1',
      type: 'Leave',
      requester: 'Sarah Johnson',
      description: '3 days annual leave',
      date: 'Feb 25–27',
      icon: CalendarDays,
      href: '/dashboard/leave/my-leaves',
    },
    {
      id: '2',
      type: 'Expense',
      requester: 'Mike Chen',
      description: 'Travel reimbursement',
      date: '$450.00',
      icon: DollarSign,
      href: '/dashboard/payroll/payroll-processing',
    },
    {
      id: '3',
      type: 'Document',
      requester: 'Tom Wilson',
      description: 'Policy acknowledgement',
      date: 'Due today',
      icon: FileText,
      href: '/dashboard/core-hr/employee-database',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-sunset-amber" />
          Approvals
        </h3>
        <span className="text-xs font-bold text-sunset-amber bg-sunset-amber/10 px-2 py-0.5 rounded-full">
          {pendingApprovals.length}
        </span>
      </div>

      <div className="space-y-2">
        {pendingApprovals.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-pearl/50 dark:hover:bg-deep-cosmos/50 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-sunset-amber/10 text-sunset-amber mt-0.5">
                <Icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink-black dark:text-pearl truncate">
                  {item.requester}
                </p>
                <p className="text-[10px] text-silver-mist truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-silver-mist whitespace-nowrap">
                <Clock className="w-2.5 h-2.5" />
                {item.date}
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/dashboard/leave/my-leaves"
        className="block text-center text-[10px] font-medium text-celestial-indigo hover:underline"
      >
        View all approvals
      </Link>
    </div>
  );
};

export default ApprovalWidget;
