'use client';

import React from 'react';
import { Stethoscope, AlertTriangle, Upload, Loader2 } from 'lucide-react';
import { useHealthcare } from '@/app/dashboard/healthcare/hooks/useHealthcare';

export default function CredentialingPage() {
  const { providers, alerts, loading, error } = useHealthcare();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
        Error: {error}
      </div>
    );
  }

  const expiringAlerts = alerts.filter(
    (a) => a.alertType === 'credential_expiry' && a.status === 'active'
  );

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-indigo-500" />
            Credentialing
          </h1>
          <p className="text-slate-500 text-sm">Track medical licenses and certifications.</p>
        </div>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {expiringAlerts.length > 0 && (
          <div className="lg:col-span-3 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-3">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-rose-700 dark:text-rose-400">Expiring Licenses</h3>
              <p className="text-sm text-rose-600 dark:text-rose-300">
                {expiringAlerts[0].message}
              </p>
            </div>
          </div>
        )}

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4">Practitioner</th>
                <th className="px-6 py-4">Specialty</th>
                <th className="px-6 py-4">Credential</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {providers.map((p, i) => {
                const primaryLicense = p.licenses?.[0];
                const fullName = `${p.personalInfo.firstName} ${p.personalInfo.lastName}`;
                return (
                  <tr
                    key={p.providerId || i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {p.personalInfo.lastName[0]}
                      </div>
                      <span className="font-bold">{fullName}</span>
                    </td>
                    <td className="px-6 py-4">{p.specialty}</td>
                    <td className="px-6 py-4">{p.credentials?.[0]?.credentialType || 'N/A'}</td>
                    <td className="px-6 py-4">{primaryLicense?.issuingState || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono">
                      {primaryLicense
                        ? new Date(primaryLicense.expiryDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          p.status === 'active'
                            ? 'bg-emerald-100 text-emerald-600'
                            : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

