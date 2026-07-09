'use client';

import Link from 'next/link';
import { UserCheck, GitBranch, ArrowRight } from 'lucide-react';

export default function RecruitmentCompliancePage() {
  const sections = [
    {
      title: 'Hiring Checks',
      description: 'Review and manage recruitment compliance checks during the hiring process.',
      href: '/dashboard/recruitment-compliance/hiring-checks',
      icon: UserCheck,
    },
    {
      title: 'Stage Gate',
      description: 'Monitor recruitment stage gate approvals and compliance workflow.',
      href: '/dashboard/recruitment-compliance/stage-gate',
      icon: GitBranch,
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recruitment Compliance</h1>
        <p className="text-gray-500 mt-2">Monitor and manage recruitment compliance activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group border rounded-xl p-6 hover:shadow-md hover:border-indigo-300 transition-all bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mt-4">{section.title}</h2>

              <p className="text-sm text-gray-500 mt-1">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
