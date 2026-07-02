import { redirect } from 'next/navigation';

// AURA-439: Menu feature "Incident Register (NEAR_MISS → FATALITY + GOSI notify)"
// maps to the canonical HSE incident register workspace (EPIC-24 · S09/S10),
// covering NEAR_MISS through FATALITY severity, lost-time tracking,
// root-cause / corrective-action and GOSI / authority notification flags.
export default function HseIncidentRegisterRedirect() {
  redirect('/dashboard/hse-compliance/incidents');
}
