'use client';

/**
 * EPIC-04 Recruitment stage-gate evaluator page.
 *
 * Calls POST /api/v1/recruitment-compliance/stage-gate.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RecruitmentStageGatePage() {
  return (
    <EvaluatorPage
      title="Recruitment stage gate"
      titleAr="بوابة مرحلة التوظيف"
      description="Test whether a candidate may transition to the next recruitment stage given screening, BGV and offer prerequisites."
      descriptionAr="فحص ما إذا كان يمكن نقل المرشح إلى المرحلة التالية بناءً على متطلبات الفرز."
      fields={[
        { name: 'caseId', label: 'Recruitment case ID', type: 'text', required: true },
        {
          name: 'candidateId',
          label: 'Candidate ID',
          type: 'text',
          required: true,
        },
        {
          name: 'currentStage',
          label: 'currentStage',
          type: 'text',
          required: true,
          placeholder: 'SCREENED',
        },
        {
          name: 'toStage',
          label: 'To stage',
          type: 'text',
          required: true,
          placeholder: 'INTERVIEW_SCHEDULED',
        },
        { name: 'countryCode', label: 'Country code', type: 'text', placeholder: 'AE' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/recruitment-compliance/stage-gate' }}
      buildPayload={(v) => ({
        snapshot: {
          caseId: String(v.caseId),
          candidateId: String(v.candidateId),
          currentStage: v.currentStage,
          countryCode: v.countryCode || undefined,
        },
        toStage: v.toStage,
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.allow ? 'PASS' : 'FAIL',
          title: v.allow ? 'Transition permitted' : 'Transition blocked',
          reason: v.reasonEn ?? v.reason ?? '',
          reasonAr: v.reasonAr,
          severity: v.blockingCode,
          breakdown: [
            { label: 'Blocking code', value: String(v.blockingCode ?? '') },
            {
              label: 'Missing prerequisites',
              value: Array.isArray(v.missingPrerequisites)
                ? v.missingPrerequisites.join(', ')
                : '—',
            },
          ],
        };
      }}
    />
  );
}
