"use client";

import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function EOSBPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          End of Service Benefits (EOSB)
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Calculate end of service benefits for employees across GCC countries and India
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/payroll-compliance/eosb/end-of-service-benefits-calculator"
          className="group p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-celestial-indigo dark:hover:border-quantum-rose transition-all duration-200 hover:shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-celestial-indigo/10 dark:bg-quantum-rose/10 rounded-lg">
              <Calculator className="w-6 h-6 text-celestial-indigo dark:text-quantum-rose" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-celestial-indigo dark:group-hover:text-quantum-rose group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            EOSB Calculator
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Calculate end of service benefits based on country-specific labor laws for UAE, Saudi Arabia, Bahrain, Qatar, Oman, Kuwait, and India.
          </p>
        </Link>
      </div>

      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          About EOSB
        </h2>
        <div className="space-y-3 text-slate-600 dark:text-slate-400">
          <p>
            End of Service Benefits (EOSB) are statutory payments that employers must make to employees upon termination of employment. The calculation varies by country and depends on factors such as:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Length of service</li>
            <li>Basic salary</li>
            <li>Reason for termination (resignation, termination, retirement, etc.)</li>
            <li>Country-specific labor laws</li>
          </ul>
          <p className="mt-4">
            Our EOSB calculator supports all GCC countries and India, ensuring compliance with local labor regulations.
          </p>
        </div>
      </div>
    </div>
  );
}

