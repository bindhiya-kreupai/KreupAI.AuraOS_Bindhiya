import { redirect } from 'next/navigation';

// Consolidated with the canonical compliance page (AURA-180). The full compliance
// training stack (compliance-training components + v1 API) lives at
// /dashboard/learning/compliance; this route redirects there to avoid two
// overlapping compliance UIs.
export default function ComplianceTrainingRedirect() {
  redirect('/dashboard/learning/compliance');
}
