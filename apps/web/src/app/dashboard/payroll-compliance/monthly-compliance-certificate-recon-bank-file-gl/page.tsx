import { redirect } from 'next/navigation';

/**
 * Menu feature "Monthly Compliance Certificate (Recon/Bank-File/GL)" resolves
 * here. The functional page — which generates and signs the monthly payroll
 * compliance certificate with reconciliation-variance, bank-file mismatch and
 * GL-posting gating — already lives at ./certificate. Redirect to avoid a
 * duplicate implementation.
 */
export default function MonthlyComplianceCertificateRedirect() {
  redirect('/dashboard/payroll-compliance/certificate');
}
