'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Network,
  MapPin,
  History,
  FileCheck,
  UserMinus,
  Contact,
  GraduationCap,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

const coreHRFeatures = [
  {
    title: 'Employee Database',
    description: 'Manage comprehensive employee profiles and lifecycle data.',
    icon: Users,
    href: '/dashboard/core-hr/employees',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10'
  },
  {
    title: 'Organization Structure',
    description: 'Define departments, cost centers, and hierarchies.',
    icon: Network,
    href: '/dashboard/core-hr/departments',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10'
  },
  {
    title: 'Position Management',
    description: 'Track and manage job roles and classifications.',
    icon: ShieldCheck,
    href: '/dashboard/core-hr/position-management',
    color: 'text-quantum-rose',
    bg: 'bg-quantum-rose/10'
  },
  {
    title: 'Employment History',
    description: 'Track career movements and job changes.',
    icon: History,
    href: '/dashboard/core-hr/employment-history',
    color: 'text-sunset-amber',
    bg: 'bg-sunset-amber/10'
  },
  {
    title: 'Probation Tracking',
    description: 'Monitor employee probation periods and confirmations.',
    icon: ClipboardList,
    href: '/dashboard/core-hr/probation-tracking',
    color: 'text-coral-alert',
    bg: 'bg-coral-alert/10'
  },
  {
    title: 'Exit Management',
    description: 'Manage resignations, offboarding, and checkouts.',
    icon: UserMinus,
    href: '/dashboard/core-hr/exit-management',
    color: 'text-silver-mist',
    bg: 'bg-silver-mist/10'
  },
  {
    title: 'Asset Management',
    description: 'Track equipment and assets assigned to employees.',
    icon: MapPin,
    href: '/dashboard/core-hr/asset-management',
    color: 'text-celestial-indigo',
    bg: 'bg-celestial-indigo/10'
  },
  {
    title: 'Letters & Identity',
    description: 'Generate ID cards and employment letters.',
    icon: Contact,
    href: '/dashboard/core-hr/employee-id-cards',
    color: 'text-neural-mint',
    bg: 'bg-neural-mint/10'
  }
];

export default function CoreHRPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl mb-2">Core HR Management</h1>
        <p className="text-silver-mist">Centralized administration of employee data, organizational structure, and lifecycle events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {coreHRFeatures.map((feature) => (
          <Link
            key={feature.title}
            href={feature.href}
            className="group block p-6 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-2">{feature.title}</h3>
            <p className="text-sm text-silver-mist leading-relaxed">{feature.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-celestial-indigo/5 border border-celestial-indigo/20 rounded-xl p-6 mt-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <FileCheck className="w-6 h-6 text-celestial-indigo" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink-black dark:text-pearl mb-1">Coming Content: Analytics Integration</h3>
            <p className="text-sm text-silver-mist max-w-2xl">
              We are currently wiring this dashboard to the Analytics service to show real-time headcount trends,
              diversity metrics, and attrition risks directly on this landing page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

