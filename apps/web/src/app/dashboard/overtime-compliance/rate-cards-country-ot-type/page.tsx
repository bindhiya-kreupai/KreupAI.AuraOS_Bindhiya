import { redirect } from 'next/navigation';

// AURA-486: Menu feature "Rate Cards (country × OT type)" maps to the canonical
// overtime rate cards workspace, defining per-country × OT type multipliers
// (weekday / weekend / public holiday / night).
export default function OvertimeRateCardsRedirect() {
  redirect('/dashboard/overtime-compliance/rate-cards');
}
