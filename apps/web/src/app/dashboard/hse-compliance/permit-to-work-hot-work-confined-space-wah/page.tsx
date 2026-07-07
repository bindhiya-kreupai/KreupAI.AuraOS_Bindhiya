import { redirect } from 'next/navigation';

// AURA-441: Menu feature "Permit-to-Work (HOT_WORK / CONFINED_SPACE / WAH)"
// maps to the canonical HSE permit-to-work workspace (EPIC-24 · S08), covering
// HOT_WORK / CONFINED_SPACE / WORK_AT_HEIGHT issuance with PPE checklist,
// isolations and RAMS.
export default function HsePermitToWorkRedirect() {
  redirect('/dashboard/hse-compliance/permits');
}
