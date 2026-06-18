'use client';

/**
 * EPIC-37 Red-flag automation rule-firing test page.
 *
 * Calls POST /api/v1/checklist-engine/red-flag-automation/test.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function RedFlagAutomationPage() {
  return (
    <EvaluatorPage
      title="Red-flag automation rule test"
      titleAr="اختبار قواعد الإشارات الحمراء"
      description="Dry-run candidate red-flag rules against a synthetic compliance event. No flags are raised; this only previews which rules would fire."
      descriptionAr="اختبار قواعد الإشارات الحمراء على حدث افتراضي دون تفعيل أي إشارة فعلية."
      fields={[
        {
          name: 'rulesJson',
          label: 'Candidate rules (JSON)',
          type: 'text',
          required: true,
          placeholder:
            '[{"code":"RUN_SIZE_SPIKE","isActive":true,"expression":"payload.totalNet > thresholds.netCap","thresholdJson":{"triggerOn":"payroll.run.completed","netCap":1000000}}]',
        },
        {
          name: 'eventType',
          label: 'Event type',
          type: 'text',
          required: true,
          placeholder: 'payroll.run.completed',
        },
        {
          name: 'payloadJson',
          label: 'Event payload (JSON)',
          type: 'text',
          required: true,
          placeholder: '{"totalNet":1500000}',
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/checklist-engine/red-flag-automation/test' }}
      buildPayload={(v) => ({
        rules: safeParse(v.rulesJson),
        event: {
          type: v.eventType,
          payload: safeParseObject(v.payloadJson),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const firing = v.firing ?? [];
        return {
          outcome: (firing.length > 0 ? 'WARN' : 'PASS') as 'WARN' | 'PASS',
          title: `${firing.length} of ${v.totalCandidates ?? 0} rule(s) would fire`,
          reason:
            firing.length > 0
              ? `Rules firing: ${firing.map((r: any) => r.code).join(', ')}`
              : 'No rule expression evaluated truthy against this event.',
          severity: firing.length > 0 ? 'FIRED' : undefined,
          breakdown: firing.slice(0, 8).map((r: any) => ({
            label: r.code,
            value: 'FIRED',
          })),
        };
      }}
    />
  );
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

function safeParseObject(s: string): Record<string, unknown> {
  try {
    const r = JSON.parse(s);
    return r && typeof r === 'object' ? r : {};
  } catch {
    return {};
  }
}
