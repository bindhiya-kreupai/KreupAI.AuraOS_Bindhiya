'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { BackgroundCheckPortal } from '@/components/recruitment/BackgroundCheckPortal';
import type {
  CandidateCheck,
  PortalCheckStatus,
} from '@/components/recruitment/BackgroundCheckPortal';
import { APIClient } from '@/lib/api-client';

interface CheckRecord {
  id: string;
  applicationId?: string | null;
  candidateId?: string | null;
  checkType: string;
  provider?: string | null;
  status: string;
  requestDate?: string;
  completionDate?: string | null;
  result?: string | null;
}

interface ApplicationRecord {
  id: string;
  candidateId?: string;
  candidate?: { id?: string; firstName?: string; lastName?: string; email?: string };
  jobPosting?: { title?: string; department?: string };
}

const STATUS_MAP: Record<string, PortalCheckStatus> = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'clear',
  clear: 'clear',
  flagged: 'flagged',
  failed: 'failed',
};

const STATUS_PROGRESS: Record<PortalCheckStatus, number> = {
  pending: 5,
  in_progress: 50,
  clear: 100,
  flagged: 100,
  failed: 100,
};

const CHECK_TYPES = [
  'identity',
  'criminal',
  'employment',
  'education',
  'credit',
  'reference',
] as const;

export default function BackgroundCheckPage() {
  const [checks, setChecks] = useState<CandidateCheck[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInitiate, setShowInitiate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formAppId, setFormAppId] = useState('');
  const [formCheckType, setFormCheckType] = useState<string>('identity');
  const [formProvider, setFormProvider] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [checksRes, appsRes] = await Promise.all([
        APIClient.get<{ data?: CheckRecord[] }>('/v1/recruitment/background-check', { limit: 100 }),
        APIClient.get<{ data?: ApplicationRecord[] }>('/v1/recruitment/applications', {
          limit: 100,
        }),
      ]);
      const apps = appsRes.data ?? [];
      setApplications(apps);
      if (apps.length > 0) setFormAppId((prev) => prev || apps[0].id);

      const appById = new Map(apps.map((a) => [a.id, a]));
      setChecks(
        (checksRes.data ?? []).map((c) => {
          const app = c.applicationId ? appById.get(c.applicationId) : undefined;
          const status = STATUS_MAP[c.status.toLowerCase()] ?? 'pending';
          const candidateName = app?.candidate
            ? `${app.candidate.firstName ?? ''} ${app.candidate.lastName ?? ''}`.trim()
            : (c.candidateId ?? 'Candidate');
          return {
            id: c.id,
            candidateName: candidateName || 'Candidate',
            candidateEmail: app?.candidate?.email ?? '',
            jobTitle: app?.jobPosting?.title ?? '—',
            department: app?.jobPosting?.department ?? '—',
            status,
            vendor: c.provider ?? 'Internal',
            providerRefId: c.id.slice(0, 8).toUpperCase(),
            checkType: c.checkType,
            progress: STATUS_PROGRESS[status],
            itemCount: 1,
            itemsCompleted:
              status === 'clear' || status === 'flagged' || status === 'failed' ? 1 : 0,
            initiatedDate: c.requestDate ?? new Date().toISOString(),
            completedDate: c.completionDate ?? undefined,
            overallResult:
              status === 'clear'
                ? 'clear'
                : status === 'flagged'
                  ? 'flagged'
                  : status === 'failed'
                    ? 'failed'
                    : undefined,
          } satisfies CandidateCheck;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load background checks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleInitiate = useCallback(async () => {
    if (!formAppId) return;
    setSubmitting(true);
    setError(null);
    try {
      await APIClient.post('/v1/recruitment/background-check', {
        applicationId: formAppId,
        checkType: formCheckType,
        provider: formProvider || undefined,
      });
      setShowInitiate(false);
      setFormProvider('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate background check');
    } finally {
      setSubmitting(false);
    }
  }, [formAppId, formCheckType, formProvider, loadData]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {error && (
        <div
          className="mb-4 rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-3 py-2 text-[11px] font-medium text-coral-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <BackgroundCheckPortal
          checks={checks}
          vendors={[]}
          onInitiateCheck={() => setShowInitiate(true)}
          onRefresh={loadData}
        />
      )}

      {showInitiate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-ink-black dark:text-pearl">
                Initiate Background Check
              </p>
              <button
                onClick={() => setShowInitiate(false)}
                className="text-silver-mist hover:text-ink-black dark:hover:text-pearl"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <label className="block text-[11px] font-medium text-silver-mist">
              Candidate Application
              <select
                value={formAppId}
                onChange={(e) => setFormAppId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-2 text-[12px] text-ink-black dark:text-pearl"
              >
                {applications.length === 0 && <option value="">No applications</option>}
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {`${a.candidate?.firstName ?? ''} ${a.candidate?.lastName ?? ''}`.trim() ||
                      a.id}{' '}
                    — {a.jobPosting?.title ?? 'Position'}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[11px] font-medium text-silver-mist">
              Check Type
              <select
                value={formCheckType}
                onChange={(e) => setFormCheckType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-2 text-[12px] text-ink-black dark:text-pearl"
              >
                {CHECK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[11px] font-medium text-silver-mist">
              Provider (optional)
              <input
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value)}
                placeholder="e.g. Checkr"
                className="mt-1 w-full rounded-lg border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue px-3 py-2 text-[12px] text-ink-black dark:text-pearl"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowInitiate(false)}
                className="rounded-lg border border-cloud dark:border-nebula-purple/30 px-3 py-2 text-[11px] font-semibold text-silver-mist"
              >
                Cancel
              </button>
              <button
                onClick={handleInitiate}
                disabled={submitting || !formAppId}
                className="inline-flex items-center gap-1.5 rounded-lg bg-celestial-indigo px-4 py-2 text-[11px] font-bold text-white disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Initiate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
