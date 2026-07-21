'use client';

/**
 * Recruitment compliance — Cases.
 *
 * Wraps the existing backend at /api/v1/recruitment-compliance/cases:
 *   GET   ?status=&currentStage=  → list cases
 *   POST  { vacancyId, candidateId, ownerId, slaDays? } → open case
 *   PATCH { caseId, nextStage }   → FSM-validated stage transition
 *
 * Candidate + requisition pickers are hydrated from the real recruitment
 * endpoints. Tenant scoping is enforced server-side.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface RecruitmentCase {
  id: string;
  vacancyId: string;
  candidateId: string;
  ownerId: string;
  currentStage: string;
  status: string;
  slaDays?: number | null;
  createdAt?: string;
}

const STAGES = [
  'APPLIED',
  'SCREENED',
  'INTERVIEWED',
  'OFFERED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

// Plausible forward transitions surfaced as row actions. The backend FSM is the
// source of truth and rejects illegal moves; we only offer the common next steps.
const NEXT_STAGE: Record<string, string[]> = {
  APPLIED: ['SCREENED', 'REJECTED', 'WITHDRAWN'],
  SCREENED: ['INTERVIEWED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEWED: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

const CASES_URL = '/api/v1/recruitment-compliance/cases';

function unwrapList(payload: unknown): any[] {
  const data = (payload as any)?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function RecruitmentCasesPage() {
  const [rows, setRows] = useState<RecruitmentCase[]>([]);
  const [candidates, setCandidates] = useState<{ value: string; label: string }[]>([]);
  const [requisitions, setRequisitions] = useState<{ value: string; label: string }[]>([]);

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch(CASES_URL);
      const json = await res.json();
      setRows(unwrapList(json) as RecruitmentCase[]);
    } catch (err) {
      console.error('Failed to load recruitment cases:', err);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    (async () => {
      try {
        const res = await fetch('/api/v1/recruitment/candidates?limit=100');
        const json = await res.json();
        setCandidates(
          unwrapList(json).map((c: any) => ({
            value: c.id,
            label: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.id,
          }))
        );
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
      try {
        const res = await fetch('/api/v1/recruitment/requisitions?limit=100');
        const json = await res.json();
        setRequisitions(
          unwrapList(json).map((r: any) => ({
            value: r.id,
            label: r.jobTitle || r.title || r.id,
          }))
        );
      } catch (err) {
        console.error('Failed to load requisitions:', err);
      }
    })();
  }, [fetchCases]);

  const candidateLabel = useMemo(() => {
    const map = new Map(candidates.map((c) => [c.value, c.label]));
    return (id: string) => map.get(id) ?? id;
  }, [candidates]);

  const columns: Column<RecruitmentCase>[] = [
    {
      key: 'candidateId',
      header: 'Candidate',
      render: (row) => <span className="font-medium">{candidateLabel(row.candidateId)}</span>,
    },
    {
      key: 'vacancyId',
      header: 'Vacancy',
      render: (row) => <span className="font-mono text-xs">{row.vacancyId}</span>,
    },
    {
      key: 'ownerId',
      header: 'Owner',
      render: (row) => <span className="text-xs">{row.ownerId}</span>,
    },
    {
      key: 'currentStage',
      header: 'Stage',
      render: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-celestial-indigo/10 text-celestial-indigo">
          {row.currentStage}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <span className="text-xs">{row.status}</span>,
    },
    {
      key: 'slaDays',
      header: 'SLA (days)',
      width: '90px',
      render: (row) => <span className="text-xs">{row.slaDays ?? '—'}</span>,
    },
  ];

  const formFields = [
    {
      name: 'vacancyId',
      label: 'Vacancy / Requisition',
      type: 'select',
      required: true,
      options: requisitions,
    },
    {
      name: 'candidateId',
      label: 'Candidate',
      type: 'select',
      required: true,
      options: candidates,
    },
    { name: 'ownerId', label: 'Owner (user ID)', type: 'text', required: true },
    { name: 'slaDays', label: 'SLA (days)', type: 'number' },
  ] as any;

  const handleSave = async (record: Partial<RecruitmentCase>) => {
    const payload = {
      vacancyId: record.vacancyId,
      candidateId: record.candidateId,
      ownerId: record.ownerId,
      slaDays:
        record.slaDays != null && record.slaDays !== ('' as any)
          ? Number(record.slaDays)
          : undefined,
    };
    try {
      const res = await fetch(CASES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        alert(json.error ?? 'Failed to open case');
        return;
      }
      fetchCases();
    } catch (err) {
      console.error('Failed to open case:', err);
      alert('Failed to open case');
    }
  };

  const transition = async (caseId: string, nextStage: string) => {
    try {
      const res = await fetch(CASES_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, nextStage }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        alert(json.error ?? 'Transition rejected');
        return;
      }
      fetchCases();
    } catch (err) {
      console.error('Transition failed:', err);
      alert('Transition failed');
    }
  };

  return (
    <DataPage<RecruitmentCase>
      title="Recruitment Cases"
      description="Open and track recruitment cases through the compliance stage gate."
      breadcrumbs={[{ label: 'Recruitment Compliance' }, { label: 'Cases' }]}
      data={rows}
      columns={columns}
      formFields={formFields}
      onSave={handleSave}
      addButtonText="Open case"
      searchKeys={['candidateId', 'vacancyId', 'ownerId', 'currentStage', 'status']}
      rowActions={(row) =>
        (NEXT_STAGE[row.currentStage] ?? []).map((stage) => ({
          label: `→ ${stage}`,
          variant: stage === 'REJECTED' || stage === 'WITHDRAWN' ? 'danger' : 'success',
          onClick: () => transition(row.id, stage),
        }))
      }
      emptyState={{
        title: 'No recruitment cases',
        description: 'Open a case to start tracking a candidate through the stage gate.',
      }}
    />
  );
}
