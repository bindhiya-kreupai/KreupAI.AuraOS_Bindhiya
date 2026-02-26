'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  Calendar,
  Shield,
} from 'lucide-react';
import type { Certification } from '@/services/complianceTrainingService';
import { ComplianceTrainingService } from '@/services/complianceTrainingService';

// ── Expiry indicator ──────────────────────────────────────────────────────────

function ExpiryIndicator({ cert }: { cert: Certification }) {
  if (!cert.isValid) {
    return (
      <div className="flex items-center gap-1.5">
        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
        <div>
          <span className="text-xs font-semibold text-red-600">Expired</span>
          <p className="text-xs text-red-400">{new Date(cert.expiryDate).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  if (cert.isExpiringSoon) {
    return (
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <div>
          <span className="text-xs font-semibold text-amber-600">Expires Soon</span>
          <p className="text-xs text-amber-500">{cert.daysUntilExpiry}d remaining</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
      <div>
        <span className="text-xs font-semibold text-emerald-600">Valid</span>
        <p className="text-xs text-emerald-500">{cert.daysUntilExpiry}d left</p>
      </div>
    </div>
  );
}

// ── Cert card ─────────────────────────────────────────────────────────────────

function CertCard({ cert, onRenew }: { cert: Certification; onRenew: (moduleId: string) => void }) {
  const scoreColor =
    cert.score >= 90 ? 'text-emerald-600' : cert.score >= 70 ? 'text-amber-600' : 'text-red-600';

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-shadow hover:shadow-md ${
        !cert.isValid
          ? 'border-red-200 dark:border-red-800'
          : cert.isExpiringSoon
            ? 'border-amber-200 dark:border-amber-800'
            : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top stripe */}
      <div
        className={`h-1.5 w-full ${!cert.isValid ? 'bg-red-500' : cert.isExpiringSoon ? 'bg-amber-400' : 'bg-emerald-500'}`}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <ExpiryIndicator cert={cert} />
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-3">
          {cert.moduleTitle}
        </h3>
        <p className="text-xs text-slate-500">{cert.moduleCode}</p>

        {/* Score + dates */}
        <div className="mt-4 grid grid-cols-3 gap-3 py-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <p className={`text-lg font-bold ${scoreColor}`}>{cert.score}%</p>
            <p className="text-xs text-slate-500">Score</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {new Date(cert.issuedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500">Issued</p>
          </div>
          <div className="text-center">
            <p
              className={`text-sm font-semibold ${!cert.isValid ? 'text-red-600' : cert.isExpiringSoon ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {new Date(cert.expiryDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500">Expires</p>
          </div>
        </div>

        {/* Certificate code */}
        <div className="flex items-center gap-2 mt-1 mb-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
            {cert.certificationCode}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => window.open(cert.pdfUrl, '_blank')}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          {(!cert.isValid || cert.isExpiringSoon) && (
            <button
              onClick={() => onRenew(cert.moduleId)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              {cert.isValid ? 'Renew' : 'Retake'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Timeline row ──────────────────────────────────────────────────────────────

function TimelineRow({ cert }: { cert: Certification }) {
  const isExpired = !cert.isValid;
  const isSoon = cert.isExpiringSoon;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="shrink-0 w-12 text-center">
        <p
          className={`text-xs font-bold ${isExpired ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-emerald-600'}`}
        >
          {isExpired ? 'Expired' : `${cert.daysUntilExpiry}d`}
        </p>
        <p className="text-xs text-slate-400">{isExpired ? '' : 'left'}</p>
      </div>

      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${isExpired ? 'bg-red-500' : isSoon ? 'bg-amber-400' : 'bg-emerald-500'}`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
          {cert.moduleTitle}
        </p>
        <p className="text-xs text-slate-500">
          Expires {new Date(cert.expiryDate).toLocaleDateString()} · {cert.certificationCode}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isExpired
              ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              : isSoon
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
          }`}
        >
          {cert.score}%
        </span>
        <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Download className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface CertificationTrackerProps {
  employeeId?: string;
  onRenew: (moduleId: string) => void;
}

export function CertificationTracker({
  employeeId = 'emp-001',
  onRenew,
}: CertificationTrackerProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'timeline'>('grid');

  const load = () => {
    setLoading(true);
    ComplianceTrainingService.getCertifications(employeeId)
      .then(setCertifications)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [employeeId]);

  const valid = certifications.filter((c) => c.isValid && !c.isExpiringSoon);
  const expiringSoon = certifications.filter((c) => c.isValid && c.isExpiringSoon);
  const expired = certifications.filter((c) => !c.isValid);

  const sortedByExpiry = [...certifications].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            My Certifications
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track your compliance certifications and renewal dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {(['grid', 'timeline'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Valid',
            count: valid.length,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            icon: CheckCircle2,
          },
          {
            label: 'Expiring Soon',
            count: expiringSoon.length,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            icon: Clock,
          },
          {
            label: 'Expired',
            count: expired.length,
            color: 'text-red-600',
            bg: 'bg-red-50 dark:bg-red-900/20',
            icon: XCircle,
          },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Renewal alerts */}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Renewal Reminders
            </h3>
          </div>
          <div className="space-y-2">
            {expiringSoon.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm text-amber-800 dark:text-amber-300">
                    {c.moduleTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-600">{c.daysUntilExpiry}d left</span>
                  <button
                    onClick={() => onRenew(c.moduleId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Renew <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : certifications.length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">No certifications yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Complete compliance trainings to earn certificates
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert) => (
            <CertCard key={cert.id} cert={cert} onRenew={onRenew} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Certification Timeline
          </h3>
          <div>
            {sortedByExpiry.map((cert) => (
              <TimelineRow key={cert.id} cert={cert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
