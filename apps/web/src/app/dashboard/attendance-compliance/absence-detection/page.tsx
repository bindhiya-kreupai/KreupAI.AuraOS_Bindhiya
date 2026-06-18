'use client';

/**
 * EPIC-19 Absence-detection evaluator page.
 *
 * Calls POST /api/v1/attendance-compliance/absence-detection.
 */

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function AbsenceDetectionPage() {
  return (
    <EvaluatorPage
      title="Absence detection"
      titleAr="اكتشاف الغياب"
      description="Classify a single attendance day for an employee (PRESENT / APPROVED_LEAVE / HOLIDAY / WEEKOFF / MISSING_PUNCH / UNAUTHORISED_ABSENCE)."
      descriptionAr="تصنيف يوم حضور واحد للموظف."
      fields={[
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'isScheduled', label: 'Is scheduled day', type: 'boolean' },
        { name: 'isHoliday', label: 'Is holiday', type: 'boolean' },
        { name: 'isWeekoff', label: 'Is week-off', type: 'boolean' },
        { name: 'hasApprovedLeave', label: 'Has approved leave', type: 'boolean' },
        {
          name: 'attendanceStatus',
          label: 'Attendance status',
          type: 'text',
          placeholder: 'PRESENT',
        },
        { name: 'clockIn', label: 'Clock-in time', type: 'datetime-local' },
        { name: 'clockOut', label: 'Clock-out time', type: 'datetime-local' },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/attendance-compliance/absence-detection' }}
      buildPayload={(v) => ({
        days: [
          {
            employeeId: v.employeeId,
            date: v.date,
            isScheduled: v.isScheduled === 'true',
            isHoliday: v.isHoliday === 'true',
            isWeekoff: v.isWeekoff === 'true',
            hasApprovedLeave: v.hasApprovedLeave === 'true',
            attendance: v.attendanceStatus
              ? {
                  status: v.attendanceStatus,
                  clockIn: v.clockIn || null,
                  clockOut: v.clockOut || null,
                }
              : undefined,
          },
        ],
      })}
      buildVerdict={(data: any) => {
        const verdict = data?.verdicts?.[0];
        if (!verdict) return null;
        const kind = verdict.kind;
        const outcomeMap: Record<string, 'PASS' | 'INFO' | 'WARN' | 'FAIL'> = {
          PRESENT: 'PASS',
          APPROVED_LEAVE: 'INFO',
          HOLIDAY: 'INFO',
          WEEKOFF: 'INFO',
          MISSING_PUNCH: 'WARN',
          UNAUTHORISED_ABSENCE: 'FAIL',
        };
        return {
          outcome: outcomeMap[kind] ?? 'INFO',
          title: kind,
          reason:
            kind === 'MISSING_PUNCH'
              ? `Missing punch — ${verdict.reason}`
              : kind === 'UNAUTHORISED_ABSENCE'
                ? 'Scheduled day with no attendance record and no approved leave.'
                : 'Day classified successfully.',
          severity: kind,
        };
      }}
    />
  );
}
