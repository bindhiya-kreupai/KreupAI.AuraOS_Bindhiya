'use client';

/**
 * EPIC-11 WPS release-gate evaluator page.
 *
 * Calls POST /api/v1/wps-compliance/release-gate (action='release').
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function WpsReleaseGatePage() {
  return (
    <EvaluatorPage
      title="WPS release gate"
      titleAr="بوابة إطلاق كشوف WPS"
      description="Attempt to release a WPS period submission. Preparer ≠ releaser is enforced; force-release is allowed only for COMPLIANCE_OFFICER with a written justification."
      descriptionAr="إطلاق كشف WPS مع تطبيق فصل الواجبات بين الإعداد والإطلاق."
      fields={[
        { name: 'submissionId', label: 'Submission ID', type: 'text', required: true },
        { name: 'force', label: 'Force release', type: 'boolean' },
        {
          name: 'bypassJustification',
          label: 'Bypass justification (min 10 chars)',
          type: 'text',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/wps-compliance/release-gate' }}
      buildPayload={(v) => ({
        action: 'release',
        submissionId: v.submissionId,
        force: v.force === 'true',
        bypassJustification: v.bypassJustification || undefined,
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        if (v.released) {
          return {
            outcome: 'PASS',
            title: v.forced ? 'Released (forced)' : 'Released',
            reason: `Submission ${v.submissionId} released by ${v.releasedBy} at ${new Date(v.releasedAt).toISOString()}.`,
            severity: v.forced ? 'FORCED' : undefined,
            breakdown: [
              { label: 'Released by', value: String(v.releasedBy ?? '') },
              { label: 'Released at', value: String(v.releasedAt ?? '') },
              { label: 'Forced', value: String(!!v.forced) },
            ],
          };
        }
        return {
          outcome: 'FAIL',
          title: 'Refused',
          reason: v.reasonEn ?? '',
          reasonAr: v.reasonAr,
          severity: v.reason,
          breakdown: [
            { label: 'Refusal code', value: String(v.reason ?? '') },
            { label: 'Prepared by', value: String(v.preparedBy ?? '—') },
          ],
        };
      }}
    />
  );
}
