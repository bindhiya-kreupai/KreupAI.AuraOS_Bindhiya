import { redirect } from 'next/navigation';

/**
 * Menu feature "Audit Trail Capture Policy per Domain" canonicalizes to the
 * existing, fully API-backed Audit Trail Settings workspace (EPIC-34 · S23).
 */
export default function AuditTrailCapturePolicyRedirectPage() {
  redirect('/dashboard/hrms-config/audit-settings');
}
