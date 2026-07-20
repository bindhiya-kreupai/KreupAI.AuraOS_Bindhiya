'use client';
/**
 * EPIC-25 — Performance compliance evaluator (calibration evidence).
 *
 * Calls POST /api/v1/performance-compliance/checks with action=calibrationEvidence.
 */
import { EvaluatorPage } from '@aura/ui/components/ui';

export default function PerformanceComplianceCalibrationPage() {
  return (
    <EvaluatorPage
      title="Calibration evidence check"
      titleAr="التحقق من دليل المعايرة"
      description="Verify calibration meeting evidence against the required cadence for this review cycle."
      descriptionAr="التحقق من دليل اجتماع المعايرة مقابل الوتيرة المطلوبة لدورة المراجعة هذه."
      fields={[
        {
          name: 'cycleStartDate',
          label: 'Cycle start date',
          labelAr: 'تاريخ بداية الدورة',
          type: 'date',
          required: true,
        },
        {
          name: 'cycleEndDate',
          label: 'Cycle end date',
          labelAr: 'تاريخ نهاية الدورة',
          type: 'date',
          required: true,
        },
        {
          name: 'requiredByDays',
          label: 'Required-by (days before close)',
          labelAr: 'مطلوب قبل (أيام قبل الإغلاق)',
          type: 'number',
          required: true,
          placeholder: 'e.g. 7',
        },
        {
          name: 'hasEvidence',
          label: 'Evidence recorded for this cycle?',
          labelAr: 'هل تم تسجيل الدليل لهذه الدورة؟',
          type: 'boolean',
          required: true,
        },

        {
          name: 'meetingAt',
          label: 'Meeting date & time',
          labelAr: 'تاريخ ووقت الاجتماع',
          type: 'datetime-local',
        },
        {
          name: 'minuteRef',
          label: 'Minute reference (document)',
          labelAr: 'مرجع المحضر',
          type: 'searchable-select',
          apiUrl: '/api/v1/records-compliance/document-matrix',
          placeholder: 'Search document...',
        },
        {
          name: 'distributionReviewed',
          label: 'Rating distribution reviewed in meeting?',
          labelAr: 'هل تمت مراجعة توزيع التقييمات في الاجتماع؟',
          type: 'boolean',
        },
        {
          name: 'attendees',
          label: 'Attendees',
          labelAr: 'الحضور',
          type: 'structured-array',
          minRows: 0,
          columns: [
            {
              key: 'userId',
              label: 'User ID',
              labelAr: 'معرف المستخدم',
              type: 'searchable-select',
              required: true,
              apiUrl: '/api/v1/employees',
              placeholder: 'Search employee...',
              widthClass: 'w-48',
            },
            {
              key: 'role',
              label: 'Role',
              labelAr: 'الدور',
              type: 'select',
              required: true,
              options: [
                { value: 'HR_OBSERVER', label: 'HR Observer' },
                { value: 'PANEL', label: 'Panel' },
                { value: 'SPONSOR', label: 'Sponsor' },
              ],
              widthClass: 'w-40',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/performance-compliance/checks' }}
      buildPayload={(v) => {
        const hasEvidence = v.hasEvidence === 'true';
        return {
          action: 'calibrationEvidence',
          cycleStartDate: v.cycleStartDate,
          cycleEndDate: v.cycleEndDate,
          requiredByDays: Number(v.requiredByDays || 0),
          ...(hasEvidence
            ? {
                evidence: {
                  meetingAt: String(v.meetingAt ?? ''),
                  ...(v.minuteRef ? { minuteRef: String(v.minuteRef) } : {}),
                  attendees: ((v.attendees as Array<Record<string, unknown>>) ?? []).map((a) => ({
                    userId: String(a.userId ?? ''),
                    role: String(a.role ?? 'PANEL'),
                  })),
                  distributionReviewed: v.distributionReviewed === 'true',
                },
              }
            : {}),
        };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.outcome,
          title: `Calibration check — ${v.daysToClose} day(s) to close`,
          reason: v.reasons?.[0]?.en ?? '',
          reasonAr: v.reasons?.[0]?.ar,
          breakdown: (v.reasons ?? []).map((r: any) => ({
            label: r.code,
            value: r.en,
          })),
        };
      }}
    />
  );
}
