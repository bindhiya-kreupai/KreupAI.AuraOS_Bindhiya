"use client";

import React from 'react';
import Link from 'next/link';
import { FileText, Calendar, CreditCard, Users, HelpCircle, Settings } from 'lucide-react';

const quickLinks = [
  { label: 'Apply Leave', href: '/dashboard/leave/leave-application', icon: Calendar, color: 'text-celestial-indigo bg-celestial-indigo/10' },
  { label: 'Payslips', href: '/dashboard/my-services/payslip-access', icon: CreditCard, color: 'text-neural-mint bg-neural-mint/10' },
  { label: 'Directory', href: '/dashboard/my-services/team-directory', icon: Users, color: 'text-quantum-rose bg-quantum-rose/10' },
  { label: 'Documents', href: '/dashboard/my-services/my-documents', icon: FileText, color: 'text-sunset-amber bg-sunset-amber/10' },
  { label: 'Help Desk', href: '/dashboard/helpdesk/tickets', icon: HelpCircle, color: 'text-purple-500 bg-purple-50' },
  { label: 'Settings', href: '/dashboard/admin', icon: Settings, color: 'text-slate-600 bg-slate-100' },
];

export function QuickLinksWidget() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {quickLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-deep-cosmos transition-colors"
        >
          <div className={`p-2 rounded-lg ${link.color}`}>
            <link.icon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium text-ink-black dark:text-pearl text-center">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
