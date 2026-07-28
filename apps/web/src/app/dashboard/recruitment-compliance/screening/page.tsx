'use client';

/**
 * Recruitment compliance — Candidate screening (bias-aware).
 *
 * Wraps the existing backend at /api/v1/recruitment-compliance/screening:
 *   GET  → list bias-flagged screenings
 *   POST { caseId, candidateId, score, outcome, rejectionReason?,
 *          knockoutReason?, protectedFactors?[] } → record a screening row
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface Screening {
  id: string;
  caseId: string;
  candidateId: string;
  score: number;
  outcome: string;
  knockoutReason?: string | null;
  rejectionReason?: string | null;
  protectedFactors?: string[] | null;
  biasFlagged?: boolean | null;
}

const SCREENING_URL = '/api/v1/recruitment-compliance/screening';

function unwrapList(payload: unknown): any[] {
  const data = (payload as any)?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function CandidateScreeningPage() {
  const [rows, setRows] = useState<Screening[]>([]);
  const [candidates, setCandidates] = useState<{ value: string; label: string }[]>([]);
  const [cases, setCases] = useState<{ value: string; label: string }[]>([]);

  const fetchScreenings = useCallback(async () => {
    try {
      const res = await fetch(SCREENING_URL);
      const json = await res.json();
      setRows(unwrapList(json) as Screening[]);
    } catch (err) {
      console.error('Failed to load screenings:', err);
    }
  }, []);

  useEffect(() => {
    fetchScreenings();
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
        const caseRes = await fetch('/api/v1/recruitment-compliance/cases');
        const caseJson = await caseRes.json();

        setCases(
          unwrapList(caseJson).map((c: any) => ({
            value: c.id,
            label: c.caseNumber || c.id,
          }))
        );
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    })();
  }, [fetchScreenings]);

  const candidateLabel = useMemo(() => {
    const map = new Map(candidates.map((c) => [c.value, c.label]));
    return (id: string) => map.get(id) ?? id;
  }, [candidates]);

  const columns: Column<Screening>[] = [
    {
      key: 'candidateId',
      header: 'Candidate',
      render: (row) => <span className="font-medium">{candidateLabel(row.candidateId)}</span>,
    },
    {
      key: 'caseId',
      header: 'Case',
      render: (row) => <span className="font-mono text-xs">{row.caseId}</span>,
    },
    {
      key: 'score',
      header: 'Score',
      width: '70px',
      render: (row) => <span className="text-xs">{row.score}</span>,
    },
    {
      key: 'outcome',
      header: 'Outcome',
      width: '110px',
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.outcome === 'PASS'
              ? 'bg-emerald-500/10 text-emerald-500'
              : row.outcome === 'KNOCKOUT'
                ? 'bg-rose-500/10 text-rose-500'
                : 'bg-amber-500/10 text-amber-500'
          }`}
        >
          {row.outcome}
        </span>
      ),
    },
    {
      key: 'protectedFactors',
      header: 'Protected factors',
      render: (row) => (
        <span className="text-xs">{(row.protectedFactors ?? []).join(', ') || '—'}</span>
      ),
    },
  ];

  const formFields = [
    {
      name: 'caseId',
      label: 'Recruitment Case',
      type: 'select',
      required: true,
      options: cases,
    },
    {
      name: 'candidateId',
      label: 'Candidate',
      type: 'select',
      required: true,
      options: candidates,
    },
    { name: 'score', label: 'Score', type: 'number', required: true },
    {
      name: 'outcome',
      label: 'Outcome',
      type: 'select',
      required: true,
      options: [
        { value: 'PASS', label: 'PASS' },
        { value: 'FAIL', label: 'FAIL' },
        { value: 'KNOCKOUT', label: 'KNOCKOUT' },
      ],
    },
    { name: 'rejectionReason', label: 'Rejection reason', type: 'text' },
    { name: 'knockoutReason', label: 'Knockout reason', type: 'text' },
    { name: 'protectedFactors', label: 'Protected factors (comma-separated)', type: 'text' },
  ] as any;

  const handleSave = async (record: Partial<Screening>) => {
    const rawFactors = (record as { protectedFactors?: string | string[] }).protectedFactors;
    const factors =
      typeof rawFactors === 'string'
        ? rawFactors
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(rawFactors)
          ? rawFactors
          : undefined;
    const payload = {
      caseId: record.caseId,
      candidateId: record.candidateId,
      score: Number(record.score),
      outcome: record.outcome,
      rejectionReason: record.rejectionReason || undefined,
      knockoutReason: record.knockoutReason || undefined,
      protectedFactors: factors && factors.length ? factors : undefined,
    };
    try {
      const res = await fetch(SCREENING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        alert(json.error ?? 'Failed to record screening');
        return;
      }
      fetchScreenings();
    } catch (err) {
      console.error('Failed to record screening:', err);
      alert('Failed to record screening');
    }
  };
  const handleDelete = async (record: Screening) => {
    if (confirm('Are you sure you want to delete this screening?')) {
      try {
        const response = await fetch(`/api/v1/recruitment-compliance/screening?id=${record.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchScreenings();
        } else {
          alert('Failed to delete screening');
        }
      } catch (error) {
        console.error(error);
        alert('Error deleting screening');
      }
    }
  };

  return (
    <DataPage<Screening>
      title="Candidate Screening"
      description="Record bias-aware candidate screenings. The list shows bias-flagged rows for review."
      breadcrumbs={[{ label: 'Recruitment Compliance' }, { label: 'Screening' }]}
      data={rows}
      columns={columns}
      formFields={formFields}
      onSave={handleSave}
      onDelete={handleDelete}
      addButtonText="Record screening"
      searchKeys={['candidateId', 'caseId', 'outcome']}
      emptyState={{
        title: 'No bias-flagged screenings',
        description: 'Record a screening; rows flagged for potential bias appear here.',
      }}
    />
  );
}
