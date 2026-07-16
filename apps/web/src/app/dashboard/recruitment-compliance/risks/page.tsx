'use client';

/**
 * Recruitment compliance — Risk register.
 *
 * Wraps the existing backend at /api/v1/recruitment-compliance/risks:
 *   GET   → list risk register entries
 *   POST  { code, description, likelihood, impact, mitigationPlan?, ownerId? } → raise
 *   PATCH ?id=  → mark mitigated
 *
 * Risk band is derived server-side from likelihood × impact.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface RiskEntry {
  id: string;
  code: string;
  description: string;
  likelihood: number;
  impact: number;
  band?: string | null;
  status?: string | null;
  mitigationPlan?: string | null;
  ownerId?: string | null;
}

const RISKS_URL = '/api/v1/recruitment-compliance/risks';

function unwrapList(payload: unknown): any[] {
  const data = (payload as any)?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function bandClass(band?: string | null): string {
  switch ((band ?? '').toUpperCase()) {
    case 'HIGH':
    case 'CRITICAL':
      return 'bg-rose-500/10 text-rose-500';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-500';
    default:
      return 'bg-emerald-500/10 text-emerald-500';
  }
}

export default function RecruitmentRisksPage() {
  const [rows, setRows] = useState<RiskEntry[]>([]);

  const fetchRisks = useCallback(async () => {
    try {
      const res = await fetch(RISKS_URL);
      const json = await res.json();
      setRows(unwrapList(json) as RiskEntry[]);
    } catch (err) {
      console.error('Failed to load risk register:', err);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const columns: Column<RiskEntry>[] = [
    {
      key: 'code',
      header: 'Code',
      width: '110px',
      render: (row) => <span className="font-mono text-xs">{row.code}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="font-medium">{row.description}</span>,
    },
    {
      key: 'likelihood',
      header: 'L',
      width: '48px',
      render: (row) => <span className="text-xs">{row.likelihood}</span>,
    },
    {
      key: 'impact',
      header: 'I',
      width: '48px',
      render: (row) => <span className="text-xs">{row.impact}</span>,
    },
    {
      key: 'band',
      header: 'Band',
      width: '100px',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bandClass(row.band)}`}>
          {row.band ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (row) => <span className="text-xs">{row.status ?? '—'}</span>,
    },
  ];

  const formFields = [
    {
      name: 'code',
      label: 'Risk code',
      type: 'text',
      required: true,
      placeholder: 'e.g. REC-RISK-01',
    },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'likelihood', label: 'Likelihood (1-5)', type: 'number', required: true },
    { name: 'impact', label: 'Impact (1-5)', type: 'number', required: true },
    { name: 'mitigationPlan', label: 'Mitigation plan', type: 'textarea' },
    { name: 'ownerId', label: 'Owner (user ID)', type: 'text' },
  ] as any;

  const handleSave = async (record: Partial<RiskEntry>) => {
    const payload = {
      code: record.code,
      description: record.description,
      likelihood: Number(record.likelihood),
      impact: Number(record.impact),
      mitigationPlan: record.mitigationPlan || undefined,
      ownerId: record.ownerId || undefined,
    };
    try {
      const res = await fetch(RISKS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        alert(json.error ?? 'Failed to raise risk');
        return;
      }
      fetchRisks();
    } catch (err) {
      console.error('Failed to raise risk:', err);
      alert('Failed to raise risk');
    }
  };

  return (
    <DataPage<RiskEntry>
      title="Recruitment Risk Register"
      description="Raise recruitment-compliance risks; band is derived from likelihood × impact."
      breadcrumbs={[{ label: 'Recruitment Compliance' }, { label: 'Risk Register' }]}
      data={rows}
      columns={columns}
      formFields={formFields}
      onSave={handleSave}
      addButtonText="Raise risk"
      searchKeys={['code', 'description', 'band', 'status']}
      rowActions={(row) =>
        (row.status ?? '').toUpperCase() === 'MITIGATED'
          ? []
          : [
              {
                label: 'Mitigate',
                variant: 'success',
                apiEndpoint: `${RISKS_URL}?id=${encodeURIComponent(row.id)}`,
                method: 'PATCH',
                onSuccess: fetchRisks,
              },
            ]
      }
      emptyState={{
        title: 'No risks raised',
        description: 'Raise a recruitment-compliance risk to populate the register.',
      }}
    />
  );
}
