'use client';

/**
 * EPIC-29 visa renewal alerts dashboard.
 *
 * Shows the multi-stage renewal alert timeline (T-60 / 30 / 15 / 7 /
 * 1 / +1) for the tenant's ACTIVE visas, grouped by severity band.
 * Dependent-visa cascade is rendered as pills under each primary
 * alert.
 *
 * Data:
 *   GET /api/v1/visa-exit-compliance/renewal-alerts?asOf=
 */

import { useEffect, useMemo, useState } from 'react';
import { AlertTimeline, type AlertSeverity, type AlertTimelineItem } from '@aura/ui/components/ui';

interface ApiAlert {
  visaId: string;
  employeeId: string;
  code: string;
  severity: AlertSeverity;
  daysFromExpiry: number;
  message: string;
  messageAr: string;
  dependents: Array<{
    visaId: string;
    documentType: string;
    expiryDate: string;
  }>;
}

interface AlertResponse {
  alerts: ApiAlert[];
  totals: {
    count: number;
    critical: number;
    urgent: number;
    warning: number;
    info: number;
    overdue: number;
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function VisaRenewalAlertsPage() {
  const [asOf, setAsOf] = useState<string>(todayISO());
  const [locale, setLocale] = useState<'en' | 'ar'>('en');
  const [data, setData] = useState<AlertResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/visa-exit-compliance/renewal-alerts?asOf=${asOf}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success) setData(json.data);
        else setError(json.error?.message ?? 'Failed to load');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [asOf]);

  const items: AlertTimelineItem[] = useMemo(() => {
    if (!data) return [];
    const filtered =
      severityFilter === 'ALL'
        ? data.alerts
        : data.alerts.filter((a) => a.severity === severityFilter);
    return filtered.map((a) => ({
      id: a.visaId,
      severity: a.severity,
      code: a.code,
      message: a.message,
      messageAr: a.messageAr,
      daysFromNow: a.daysFromExpiry,
      dependents: a.dependents.map((d) => ({
        id: d.visaId,
        label: `${d.documentType} · ${new Date(d.expiryDate).toISOString().slice(0, 10)}`,
      })),
    }));
  }, [data, severityFilter]);

  return (
    <div className="p-6 space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          {locale === 'ar' ? 'تنبيهات تجديد التأشيرات' : 'Visa renewal alerts'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {locale === 'ar'
            ? 'تنبيهات متعددة المراحل قبل انتهاء صلاحية التأشيرة (60 / 30 / 15 / 7 / 1 يوم + المتأخرة).'
            : 'Multi-stage alerts before visa expiry (T-60 / 30 / 15 / 7 / 1 / overdue) with dependent-visa cascade.'}
        </p>
      </header>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">{locale === 'ar' ? 'كما في' : 'As of'}</span>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            value={asOf}
            onChange={(e) => setAsOf(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">
            {locale === 'ar' ? 'الخطورة' : 'Severity'}
          </span>
          <select
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
          >
            <option value="ALL">{locale === 'ar' ? 'الكل' : 'All'}</option>
            <option value="CRITICAL">Critical</option>
            <option value="OVERDUE">Overdue</option>
            <option value="URGENT">Urgent</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-gray-600 mb-1">{locale === 'ar' ? 'اللغة' : 'Locale'}</span>
          <select
            className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'en' | 'ar')}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>
        {data && (
          <div className="ml-auto text-xs text-gray-700 grid grid-cols-6 gap-3 items-center">
            <span className="text-gray-500">
              {locale === 'ar' ? 'المجموع' : 'Total'}: {data.totals.count}
            </span>
            <span className="inline-flex items-center gap-1 text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-600" /> {data.totals.critical}
            </span>
            <span className="inline-flex items-center gap-1 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-700" /> {data.totals.overdue}
            </span>
            <span className="inline-flex items-center gap-1 text-orange-700">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> {data.totals.urgent}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> {data.totals.warning}
            </span>
            <span className="inline-flex items-center gap-1 text-sky-700">
              <span className="w-2 h-2 rounded-full bg-sky-300" /> {data.totals.info}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && !data && <div className="text-sm text-gray-500">Loading…</div>}

      <AlertTimeline items={items} locale={locale} />
    </div>
  );
}
