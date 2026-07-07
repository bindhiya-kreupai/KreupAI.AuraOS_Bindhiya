/**
 * @module QuickLinksWidget
 * @description Personalized shortcuts widget
 * @project AURA HCM Platform
 */

'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Link2,
  UserPlus,
  DollarSign,
  CalendarDays,
  Briefcase,
  FileText,
  Clock,
  BookOpen,
  Settings,
} from 'lucide-react';

interface QuickLink {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const QuickLinksWidget: React.FC = () => {
  const links: QuickLink[] = [
    {
      label: 'Add Employee',
      href: '/dashboard/core-hr/employee-database',
      icon: UserPlus,
      color: 'text-celestial-indigo',
      bg: 'bg-celestial-indigo/10',
    },
    {
      label: 'Process Payroll',
      href: '/dashboard/payroll/payroll-processing',
      icon: DollarSign,
      color: 'text-neural-mint',
      bg: 'bg-neural-mint/10',
    },
    {
      label: 'Approve Leaves',
      href: '/dashboard/leave/my-leaves',
      icon: CalendarDays,
      color: 'text-quantum-rose',
      bg: 'bg-quantum-rose/10',
    },
    {
      label: 'Job Postings',
      href: '/dashboard/recruitment/job-posting',
      icon: Briefcase,
      color: 'text-sunset-amber',
      bg: 'bg-sunset-amber/10',
    },
    {
      label: 'Documents',
      href: '/dashboard/core-hr/employee-database',
      icon: FileText,
      color: 'text-celestial-indigo',
      bg: 'bg-celestial-indigo/10',
    },
    {
      label: 'Attendance',
      href: '/dashboard/attendance/timesheets',
      icon: Clock,
      color: 'text-neural-mint',
      bg: 'bg-neural-mint/10',
    },
    {
      label: 'Training',
      href: '/dashboard/learning/calendar',
      icon: BookOpen,
      color: 'text-quantum-rose',
      bg: 'bg-quantum-rose/10',
    },
    {
      label: 'Settings',
      href: '/dashboard/admin/system',
      icon: Settings,
      color: 'text-silver-mist',
      bg: 'bg-silver-mist/10',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
        <Link2 className="w-4 h-4 text-neural-mint" />
        Quick Links
      </h3>

      <div className="grid grid-cols-2 gap-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center gap-2 p-2 rounded-lg ${link.bg} hover:opacity-80 transition-opacity`}
            >
              <Icon className={`w-3.5 h-3.5 ${link.color}`} />
              <span className={`text-[10px] font-medium ${link.color}`}>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickLinksWidget;
