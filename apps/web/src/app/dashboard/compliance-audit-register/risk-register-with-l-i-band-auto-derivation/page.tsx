import { redirect } from 'next/navigation';

/**
 * Menu feature "Risk Register with L × I → band auto-derivation" canonicalizes to the fully
 * API-backed Compliance Audit Register workspace, whose Risk Register table shows the
 * likelihood × impact score and the auto-derived band (LOW/MEDIUM/HIGH/CRITICAL).
 */
export default function RiskRegisterBandDerivationRedirectPage() {
  redirect('/dashboard/compliance-audit-register');
}
