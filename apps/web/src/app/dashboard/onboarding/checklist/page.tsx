'use client';

/**
 * EPIC-06 Onboarding checklist evaluator page.
 *
 * Calls POST /api/v1/onboarding/checklist.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function OnboardingChecklistPage() {
  return (
    <EvaluatorPage
      title="Onboarding checklist"
      titleAr="قائمة التوظيف"
      description="Build the pre-joining + joining-day onboarding checklist for a candidate and summarise completion / blockers."
      descriptionAr="إنشاء قائمة التوظيف لما قبل الانضمام ويوم الانضمام مع ملخص الإنجاز."
      fields={[{ name: 'joiningDate', label: 'Joining date', type: 'date', required: true }]}
      endpoint={{ method: 'POST', url: '/api/v1/onboarding/checklist' }}
      buildPayload={(v) => ({ joiningDate: v.joiningDate })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v?.summary) return null;
        const s = v.summary;
        return {
          outcome: s.canJoin ? 'PASS' : 'FAIL',
          title: `${s.pctComplete}% complete (${s.pctBlockersComplete}% blockers)`,
          reason: s.canJoin
            ? 'All blocker items satisfied — candidate may be marked JOINED.'
            : 'One or more blocker items outstanding — candidate cannot be marked JOINED.',
          severity: s.canJoin ? undefined : 'BLOCKED',
          breakdown: [
            { label: 'Total items', value: String(s.total) },
            { label: 'Done', value: String(s.done) },
            { label: 'Pending', value: String(s.pending) },
            { label: 'Overdue', value: String(s.overdue) },
            { label: 'Blockers done', value: `${s.blockersDone}/${s.blockersTotal}` },
            {
              label: 'Pre-joining done',
              value: `${s.byStage.PRE_JOINING.done}/${s.byStage.PRE_JOINING.total}`,
            },
            {
              label: 'Joining-day done',
              value: `${s.byStage.JOINING_DAY.done}/${s.byStage.JOINING_DAY.total}`,
            },
          ],
        };
      }}
    />
  );
}
