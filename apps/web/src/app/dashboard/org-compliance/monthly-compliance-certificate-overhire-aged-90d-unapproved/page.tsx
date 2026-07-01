import { redirect } from 'next/navigation';

// AURA-477: Menu feature "Monthly Compliance Certificate
// (Overhire/Aged>90d/Unapproved)" maps to the canonical org compliance
// certificate workspace (EPIC-09 · S17), whose gating already covers
// overhire, vacancies aged over 90 days and unapproved vacancies.
export default function MonthlyOrgCertificateRedirect() {
  redirect('/dashboard/org-compliance/certificate');
}
