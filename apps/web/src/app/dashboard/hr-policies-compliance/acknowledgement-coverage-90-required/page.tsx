import { redirect } from 'next/navigation';

// AURA-419: Menu feature "Acknowledgement Coverage (>=90% required)" maps to the
// canonical acknowledgement coverage workspace (EPIC-32 · S08), which tracks
// per-policy acknowledgement percentage against the 90% required threshold.
export default function AcknowledgementCoverage90Redirect() {
  redirect('/dashboard/hr-policies-compliance/acknowledgements');
}
