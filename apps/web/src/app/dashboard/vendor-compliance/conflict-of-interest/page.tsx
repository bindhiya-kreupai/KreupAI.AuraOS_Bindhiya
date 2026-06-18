'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function CoiPage() {
  return (
    <EvaluatorPage
      title="Vendor compliance — conflict of interest"
      titleAr="تعارض المصالح للموردين"
      description="Detect employee-vendor links that have not been declared in a disclosure document."
      descriptionAr="اكتشاف الروابط غير المفصح عنها بين الموظفين والموردين."
      fields={[
        {
          name: 'links',
          label: 'Employee-vendor links',
          labelAr: 'روابط الموظف-المورد',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'vendorId',
              label: 'Vendor ID',
              labelAr: 'المورد',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'employeeId',
              label: 'Employee ID',
              labelAr: 'الموظف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
          ],
        },
        {
          name: 'disclosures',
          label: 'Disclosures',
          labelAr: 'الإفصاحات',
          type: 'structured-array',
          columns: [
            {
              key: 'vendorId',
              label: 'Vendor ID',
              labelAr: 'المورد',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'declaredAt',
              label: 'Declared at',
              labelAr: 'تاريخ الإفصاح',
              type: 'date',
              required: true,
              widthClass: 'w-40',
            },
            {
              key: 'hasRelationship',
              label: 'Has relationship',
              labelAr: 'علاقة قائمة',
              type: 'boolean',
              widthClass: 'w-32',
            },
            {
              key: 'relatedEmployeeIds',
              label: 'Related employees (comma)',
              labelAr: 'الموظفون',
              type: 'text',
              widthClass: 'w-48',
            },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/vendor-compliance/screening' }}
      buildPayload={(v) => ({
        action: 'coi',
        input: {
          links: ((v.links as Array<Record<string, unknown>>) ?? []).map((r) => ({
            vendorId: String(r.vendorId ?? ''),
            employeeId: String(r.employeeId ?? ''),
          })),
          disclosures: ((v.disclosures as Array<Record<string, unknown>>) ?? []).map((d) => ({
            vendorId: String(d.vendorId ?? ''),
            declaredAt: new Date(String(d.declaredAt)).toISOString(),
            hasRelationship: d.hasRelationship === true || d.hasRelationship === 'true',
            relatedEmployeeIds: d.relatedEmployeeIds
              ? String(d.relatedEmployeeIds)
                  .split(',')
                  .map((x) => x.trim())
                  .filter(Boolean)
              : undefined,
          })),
        },
      })}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        return {
          outcome: v.totals.undisclosed > 0 ? 'FAIL' : 'PASS',
          title: `${v.totals.undisclosed} undisclosed; ${v.totals.declared} declared`,
          reason:
            v.totals.undisclosed > 0
              ? 'Some vendor-employee relationships are not on file.'
              : 'All employee-vendor relationships are properly disclosed.',
          reasonAr:
            v.totals.undisclosed > 0 ? 'بعض العلاقات غير مفصح عنها' : 'تم الإفصاح عن جميع العلاقات',
          breakdown: [
            { label: 'Vendors', value: String(v.totals.vendors) },
            { label: 'Undisclosed', value: String(v.totals.undisclosed) },
            { label: 'Declared', value: String(v.totals.declared) },
          ],
        };
      }}
    />
  );
}
