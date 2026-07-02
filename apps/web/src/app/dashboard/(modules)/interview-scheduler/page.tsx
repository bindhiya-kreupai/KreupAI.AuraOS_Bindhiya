/**
 * @module InterviewSchedulerPage
 * @description Interview Scheduler page route
 * @project AURA HCM Platform
 */

'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Shield, Loader2 } from 'lucide-react';
import { InterviewScheduler } from '@/components/recruitment/InterviewScheduler';
import type { SchedulableApplication } from '@/components/recruitment/InterviewScheduler';
import type { InterviewerData } from '@/components/recruitment/InterviewerAvailability';
import { APIClient } from '@/lib/api-client';

interface ApplicationRecord {
  id: string;
  candidate?: { firstName?: string; lastName?: string; email?: string };
  jobPosting?: { title?: string };
}

interface EmployeeRecord {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string | null;
  dept?: string | null;
}

const initials = (name: string): string =>
  name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function InterviewSchedulerPage() {
  const [applications, setApplications] = useState<SchedulableApplication[]>([]);
  const [interviewers, setInterviewers] = useState<InterviewerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [appsRes, empsRes] = await Promise.all([
          APIClient.get<{ data?: ApplicationRecord[] }>('/v1/recruitment/applications', {
            limit: 100,
          }),
          APIClient.get<{ data?: EmployeeRecord[] }>('/v1/employees', { limit: 100 }),
        ]);

        setApplications(
          (appsRes.data ?? []).map((a) => ({
            id: a.id,
            candidateName: `${a.candidate?.firstName ?? ''} ${a.candidate?.lastName ?? ''}`.trim(),
            candidateEmail: a.candidate?.email ?? '',
            jobTitle: a.jobPosting?.title ?? 'Position',
          }))
        );

        setInterviewers(
          (empsRes.data ?? []).map((e) => {
            const name =
              e.name ?? (`${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || 'Interviewer');
            return {
              id: e.id,
              name,
              email: e.email ?? '',
              avatar: initials(name),
              role: e.role ?? '—',
              department: e.dept ?? '—',
              skills: [],
              interviewsToday: 0,
              maxInterviewsPerDay: 4,
              calendarConnected: false,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              slots: [],
            };
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scheduler data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-celestial-indigo" />
          Interview Scheduler
        </h1>
        <p className="text-sm text-silver-mist mt-0.5">
          Schedule interviews with smart slot matching, interviewer availability checking, and
          calendar integration.
        </p>
      </div>

      {error && (
        <div
          className="rounded-lg border border-coral-alert/40 bg-coral-alert/10 px-3 py-2 text-[11px] font-medium text-coral-alert"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Scheduler */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-celestial-indigo" />
        </div>
      ) : (
        <InterviewScheduler applications={applications} interviewers={interviewers} />
      )}

      {/* Security footer */}
      <div className="flex items-center gap-2 px-1">
        <Shield className="w-3.5 h-3.5 text-silver-mist/40" />
        <p className="text-[10px] text-silver-mist/60">
          Calendar data is fetched via secure OAuth connections. Interview details are confidential
          and audit-logged.
        </p>
      </div>
    </div>
  );
}
