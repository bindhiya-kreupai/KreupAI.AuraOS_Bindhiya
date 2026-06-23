'use client';

import { EvaluatorPage } from '@aura/ui/components/ui';

export default function DiversityMetricsPage() {
  return (
    <EvaluatorPage
      title="Workforce diversity metric pack"
      titleAr="حزمة مقاييس تنوع القوى العاملة"
      description="Compute headline diversity ratios (female %, nationals %, PwD %, female-in-leadership %) and flag below-target metrics."
      descriptionAr="حساب نسب التنوع الرئيسية ووضع علامات على المقاييس التي لا تستوفي الأهداف."
      fields={[
        {
          name: 'minFemalePct',
          label: 'Min female % (0..1)',
          labelAr: 'الحد الأدنى لنسبة الإناث',
          type: 'number',
          helpText: 'Leave blank to skip the target check',
        },
        {
          name: 'minNationalsPct',
          label: 'Min nationals % (0..1)',
          labelAr: 'الحد الأدنى لنسبة المواطنين',
          type: 'number',
        },
        {
          name: 'minPwdPct',
          label: 'Min PwD % (0..1)',
          labelAr: 'الحد الأدنى لذوي الإعاقة',
          type: 'number',
        },
        {
          name: 'minFemaleInLeadershipPct',
          label: 'Min female-in-leadership % (0..1)',
          labelAr: 'الحد الأدنى للإناث في القيادة',
          type: 'number',
        },
        {
          name: 'nationalCountry',
          label: 'National country code',
          labelAr: 'رمز دولة المواطنين',
          type: 'text',
          defaultValue: 'SAU',
        },
        {
          name: 'employees',
          label: 'Employees (id, gender, nationality, age bracket, jobLevel, pwd)',
          labelAr: 'الموظفون',
          type: 'structured-array',
          required: true,
          minRows: 1,
          columns: [
            {
              key: 'employeeId',
              label: 'Employee ID',
              labelAr: 'المعرف',
              type: 'text',
              required: true,
              widthClass: 'w-32',
            },
            {
              key: 'gender',
              label: 'Gender',
              labelAr: 'الجنس',
              type: 'select',
              required: true,
              options: [
                { value: 'M', label: 'M' },
                { value: 'F', label: 'F' },
                { value: 'O', label: 'O' },
                { value: 'UNDISCLOSED', label: 'UNDISCLOSED' },
              ],
              widthClass: 'w-32',
            },
            {
              key: 'nationality',
              label: 'Nationality',
              labelAr: 'الجنسية',
              type: 'text',
              required: true,
              widthClass: 'w-24',
            },
            {
              key: 'ageBracket',
              label: 'Age bracket',
              labelAr: 'الفئة العمرية',
              type: 'select',
              required: true,
              options: [
                { value: 'U30', label: 'U30' },
                { value: '30-50', label: '30-50' },
                { value: 'O50', label: 'O50' },
              ],
              widthClass: 'w-28',
            },
            {
              key: 'jobLevel',
              label: 'Job level',
              labelAr: 'المستوى الوظيفي',
              type: 'select',
              required: true,
              options: [
                { value: 'EXEC', label: 'EXEC' },
                { value: 'MANAGER', label: 'MANAGER' },
                { value: 'PROFESSIONAL', label: 'PROFESSIONAL' },
                { value: 'OPERATIONAL', label: 'OPERATIONAL' },
              ],
              widthClass: 'w-36',
            },
            { key: 'isPwd', label: 'PwD', labelAr: 'إعاقة', type: 'boolean', widthClass: 'w-20' },
          ],
        },
      ]}
      endpoint={{ method: 'POST', url: '/api/v1/esg-compliance/sustainability' }}
      buildPayload={(v) => {
        const employees = ((v.employees as Array<Record<string, unknown>>) ?? []).map((r) => ({
          employeeId: String(r.employeeId ?? ''),
          gender: String(r.gender ?? 'UNDISCLOSED'),
          nationality: String(r.nationality ?? ''),
          ageBracket: String(r.ageBracket ?? '30-50'),
          jobLevel: String(r.jobLevel ?? 'PROFESSIONAL'),
          isPwd: r.isPwd === true || r.isPwd === 'true',
        }));
        const thresholds: Record<string, unknown> = {};
        if (v.minFemalePct) thresholds.minFemalePct = Number(v.minFemalePct);
        if (v.minNationalsPct) thresholds.minNationalsPct = Number(v.minNationalsPct);
        if (v.minPwdPct) thresholds.minPwdPct = Number(v.minPwdPct);
        if (v.minFemaleInLeadershipPct)
          thresholds.minFemaleInLeadershipPct = Number(v.minFemaleInLeadershipPct);
        if (v.nationalCountry) thresholds.nationalCountry = String(v.nationalCountry);
        return { action: 'diversity', input: { employees, thresholds } };
      }}
      buildVerdict={(data: any) => {
        const v = data?.verdict;
        if (!v) return null;
        const flagged = v.flags.length > 0;
        return {
          outcome: flagged ? 'WARN' : 'PASS',
          title: flagged
            ? `${v.flags.length} diversity flag(s) raised`
            : 'All diversity targets met',
          reason: v.flags.map((f: any) => f.en).join('; ') || 'No targets breached.',
          reasonAr: v.flags.map((f: any) => f.ar).join('؛ '),
          breakdown: [
            { label: 'Headcount', value: String(v.totals.headcount) },
            { label: 'Female %', value: `${v.totals.femalePct}` },
            { label: 'Nationals %', value: `${v.totals.nationalsPct}` },
            { label: 'PwD %', value: `${v.totals.pwdPct}` },
            { label: 'Female-in-leadership %', value: `${v.totals.femaleInLeadershipPct}` },
          ],
        };
      }}
    />
  );
}
