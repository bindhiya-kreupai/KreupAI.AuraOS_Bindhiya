import { redirect } from 'next/navigation';

// Consolidated: the interactive Employee Life Events page (create/approve/reject)
// is the single canonical surface. This route previously duplicated it as a
// read-only list, so it now redirects to avoid drift between the two.
export default function LifeEventsRedirectPage() {
  redirect('/dashboard/core-hr/employee-life-events');
}
