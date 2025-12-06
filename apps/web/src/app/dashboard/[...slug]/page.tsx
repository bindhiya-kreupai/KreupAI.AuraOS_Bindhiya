"use client";

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardCatchAll() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);
    const featureName = segments[segments.length - 1]?.replace(/-/g, ' ');

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Construction className="w-12 h-12 text-indigo-500" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 capitalize">
                {featureName || 'Feature'}
            </h1>

            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                This feature is currently under development or being migrated to the new dashboard architecture.
                Please check back later or contact your administrator.
            </p>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg max-w-lg w-full mb-8">
                <p className="font-mono text-xs text-amber-700 dark:text-amber-400">
                    Path: {pathname}
                </p>
            </div>

            <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold"
            >
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
            </Link>
        </div>
    );
}
