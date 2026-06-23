'use client';

/**
 * EPIC-23 Accommodation fire safety evaluator.
 *
 * Calls POST /api/v1/accommodation-compliance/safety-controls
 * with action='fire'.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function FireSafetyPage() {
  return (
    <EvaluatorPage
      title="Accommodation fire safety"
      titleAr="السلامة من الحرائق في السكن"
      description="Evaluate smoke detectors, extinguishers, exit routes, drills and alarm testing for an accommodation unit."
      descriptionAr="تقييم وسائل السلامة من الحرائق في وحدة السكن."
      fields={[
        { name: 'smokeDetectorsWorking', label: 'Smoke detectors working', type: 'boolean' },
        {
          name: 'fireExtinguisherWithinDate',
          label: 'Fire extinguisher within service date',
          type: 'boolean',
        },
        { name: 'emergencyExitsClear', label: 'Emergency exits clear', type: 'boolean' },
        { name: 'fireDrillLast6Months', label: 'Fire drill in last 6 months', type: 'boolean' },
        { name: 'fireAlarmTestedMonthly', label: 'Fire alarm tested monthly', type: 'boolean' },
        { name: 'exitBlocked', label: 'Labelled exit blocked', type: 'boolean' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/accommodation-compliance/safety-controls' }}
      buildPayload={(v) => ({
        action: 'fire',
        input: {
          smokeDetectorsWorking: v.smokeDetectorsWorking === 'true',
          fireExtinguisherWithinDate: v.fireExtinguisherWithinDate === 'true',
          emergencyExitsClear: v.emergencyExitsClear === 'true',
          fireDrillLast6Months: v.fireDrillLast6Months === 'true',
          fireAlarmTestedMonthly: v.fireAlarmTestedMonthly === 'true',
          exitBlocked: v.exitBlocked === 'true',
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: (v.pass ? 'PASS' : 'FAIL') as 'PASS' | 'FAIL',
          title: `${v.band} (${v.score}/100)`,
          reason:
            v.failures?.length > 0
              ? `${v.failures.length} fire-safety failure(s) detected.`
              : 'Fire safety controls satisfied.',
          severity: v.band,
          breakdown: [
            { label: 'Score', value: String(v.score) },
            { label: 'Band', value: String(v.band) },
            { label: 'Failures', value: String(v.failures?.length ?? 0) },
            ...(v.failures ?? [])
              .slice(0, 6)
              .map((f: any) => ({ label: f.code, value: f.severity })),
          ],
        };
      }}
    />
  );
}
