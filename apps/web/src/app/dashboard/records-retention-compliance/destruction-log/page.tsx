'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DestructionLogPage() {
  return (
    <EvaluatorPage
      title="Records retention — destruction log validator"
      titleAr="مدقق سجل إتلاف السجلات"
      description="Inspect destruction-log entries for missing operator, method, witness, certificate, duplicates, or backdating."
      descriptionAr="فحص سجل الإتلاف للتأكد من اكتمال الحقول وعدم التكرار."
      fields={[
        {
          name: 'entries',
          label: 'Destruction entries',
          labelAr: 'سجلات الإتلاف',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'recordId',
              label: 'Record ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'destroyedAt',
              label: 'Destroyed',
              labelAr: 'تاريخ',
              type: 'date',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'destroyedBy',
              label: 'Operator',
              labelAr: 'المنفذ',
              type: 'text',
              widthClass: 'w-32',
            },
            {
              key: 'method',
              label: 'Method',
              labelAr: 'الطريقة',
              type: 'select',
              options: [
                { value: 'SHRED', label: 'SHRED' },
                { value: 'WIPE', label: 'WIPE' },
                { value: 'DEGAUSS', label: 'DEGAUSS' },
                { value: 'INCINERATE', label: 'INCINERATE' },
              ],
              widthClass: 'w-32',
            },
            {
              key: 'witnessId',
              label: 'Witness',
              labelAr: 'الشاهد',
              type: 'text',
              widthClass: 'w-32',
            },
            {
              key: 'certificateRef',
              label: 'Cert ref',
              labelAr: 'الشهادة',
              type: 'text',
              widthClass: 'w-32',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/records-retention-compliance/lifecycle' }}
      buildPayload={(v) => ({
        action: 'destruction',
        input: {
          entries: ((v.entries as Array<Record<string, unknown>>) ?? []).map((e) => ({
            recordId: String(e.recordId ?? ''),
            destroyedAt: new Date(String(e.destroyedAt)).toISOString(),
            destroyedBy: e.destroyedBy ? String(e.destroyedBy) : undefined,
            method: e.method ? String(e.method) : undefined,
            witnessId: e.witnessId ? String(e.witnessId) : undefined,
            certificateRef: e.certificateRef ? String(e.certificateRef) : undefined,
          })),
          asOf: new Date().toISOString(),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.defective > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.validityPct}% valid entries`,
          reason:
            v.totals.defective > 0
              ? `${v.totals.defective} of ${v.totals.entries} entries have defects.`
              : 'All destruction entries are complete.',
          reasonAr: v.totals.defective > 0 ? 'يوجد عيوب في السجلات' : 'السجلات مكتملة',
          breakdown: [
            { label: 'Entries', value: String(v.totals.entries) },
            { label: 'Valid', value: String(v.totals.valid) },
            { label: 'Defective', value: String(v.totals.defective) },
            { label: 'Validity %', value: String(v.totals.validityPct) },
          ],
        };
      }}
    />
  );
}
