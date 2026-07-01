import { redirect } from 'next/navigation';

// Consolidated with the canonical calendar page (AURA-184). The richer training
// schedule now lives at /dashboard/learning/calendar; this route redirects there
// to avoid two overlapping calendar pages.
export default function TrainingCalendarRedirect() {
  redirect('/dashboard/learning/calendar');
}
