import { redirect } from 'next/navigation';

// AURA-424: Menu feature "Scheduled Reviews" maps to the canonical scheduled
// reviews workspace (EPIC-32 · S11), which lists auto-created policy reviews and
// surfaces overdue ones.
export default function ScheduledReviewsRedirect() {
  redirect('/dashboard/hr-policies-compliance/reviews');
}
