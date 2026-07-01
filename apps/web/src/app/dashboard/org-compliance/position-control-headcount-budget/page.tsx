import { redirect } from 'next/navigation';

// AURA-480: Menu feature "Position Control & Headcount Budget" maps to the
// canonical position control workspace (EPIC-09 · S08/S16), which tracks
// budgeted vs approved vs filled headcount, overhire and frozen counts.
export default function PositionControlHeadcountBudgetRedirect() {
  redirect('/dashboard/org-compliance/position-control');
}
