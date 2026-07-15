'use client';

/**
 * Recruitment compliance — Immigration eligibility check.
 *
 * Wraps POST /api/v1/recruitment-compliance/immigration-eligibility. The
 * service derives PENDING / ELIGIBLE / CONDITIONAL / INELIGIBLE from the
 * inputs and returns the recorded row (field: `eligibility`).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { EvaluatorPage } from '@aura/ui/components/ui';
import type { EvaluatorField } from '@aura/ui/components/ui';

function unwrapList(payload: unknown): any[] {
  const data = (payload as any)?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function ImmigrationEligibilityPage() {
  const [candidateOptions, setCandidateOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/recruitment/candidates?limit=100');
        const json = await res.json();
        setCandidateOptions(
          unwrapList(json).map((c: any) => ({
            value: c.id,
            label: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || c.id,
          }))
        );
      } catch (err) {
        console.error('Failed to load candidates:', err);
      }
    })();
  }, []);

  const fields: EvaluatorField[] = useMemo(
    () => [
      {
        name: 'caseId',
        label: 'Recruitment case ID',
        labelAr: 'معرّف حالة التوظيف',
        type: 'text',
        required: true,
      },
      candidateOptions.length
        ? {
            name: 'candidateId',
            label: 'Candidate',
            labelAr: 'المرشح',
            type: 'select',
            required: true,
            options: candidateOptions,
          }
        : {
            name: 'candidateId',
            label: 'Candidate ID',
            labelAr: 'معرّف المرشح',
            type: 'text',
            required: true,
          },
      {
        name: 'countryCode',
        label: 'Country code (ISO)',
        labelAr: 'رمز الدولة',
        type: 'text',
        required: true,
        placeholder: 'AE',
      },
      {
        name: 'nationality',
        label: 'Nationality (ISO)',
        labelAr: 'الجنسية',
        type: 'text',
        required: true,
        placeholder: 'IN',
      },
      { name: 'profession', label: 'Profession', labelAr: 'المهنة', type: 'text' },
      {
        name: 'banStatus',
        label: 'Ban status',
        labelAr: 'حالة الحظر',
        type: 'select',
        options: [
          { value: 'CLEAR', label: 'Clear' },
          { value: 'BANNED', label: 'Banned' },
          { value: 'UNKNOWN', label: 'Unknown' },
        ],
      },
      {
        name: 'nocRequired',
        label: 'NOC required',
        labelAr: 'شهادة عدم ممانعة مطلوبة',
        type: 'boolean',
      },
      {
        name: 'nocReceived',
        label: 'NOC received',
        labelAr: 'تم استلام شهادة عدم الممانعة',
        type: 'boolean',
      },
    ],
    [candidateOptions]
  );

  const asBool = (v: unknown) => v === true || v === 'true';

  return (
    <EvaluatorPage
      title="Immigration eligibility"
      titleAr="أهلية الهجرة"
      description="Record an immigration eligibility check for a candidate; the verdict is derived from ban status and NOC requirements."
      descriptionAr="سجّل فحص أهلية الهجرة للمرشح؛ يُشتق الحكم من حالة الحظر ومتطلبات شهادة عدم الممانعة."
      fields={fields}
      endpoint={{ method: 'POST', url: '/api/v1/recruitment-compliance/immigration-eligibility' }}
      buildPayload={(v) => ({
        caseId: v.caseId,
        candidateId: v.candidateId,
        countryCode: v.countryCode,
        nationality: v.nationality,
        profession: v.profession || undefined,
        banStatus: v.banStatus || undefined,
        nocRequired: asBool(v.nocRequired),
        nocReceived: asBool(v.nocReceived),
      })}
      buildVerdict={(data: any) => {
        const eligibility: string = data?.eligibility ?? data?.data?.eligibility;
        if (!eligibility) return null;
        const outcome =
          eligibility === 'ELIGIBLE'
            ? 'PASS'
            : eligibility === 'INELIGIBLE'
              ? 'FAIL'
              : eligibility === 'CONDITIONAL'
                ? 'WARN'
                : 'INFO';
        return {
          outcome,
          title: `Eligibility: ${eligibility}`,
          reason:
            eligibility === 'CONDITIONAL'
              ? 'Conditional — outstanding NOC or documentation required.'
              : eligibility === 'INELIGIBLE'
                ? 'Candidate is currently banned or ineligible.'
                : eligibility === 'PENDING'
                  ? 'Ban status unknown — pending verification.'
                  : 'Candidate meets immigration eligibility requirements.',
        };
      }}
    />
  );
}
