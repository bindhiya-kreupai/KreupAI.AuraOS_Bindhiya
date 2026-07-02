import { redirect } from 'next/navigation';

// Consolidated (AURA-030). The legacy CompensationPlanner used MOCK_EMPLOYEES /
// MOCK_DEPARTMENTS / MOCK_BENCHMARKS with no API integration. The canonical,
// API-backed compensation planning page (create/revise against
// /api/compensation/employee-compensation + analytics) now lives at
// /dashboard/compensation/compensation-planning; this route redirects there.
export default function LegacyCompensationPlanningRedirect() {
  redirect('/dashboard/compensation/compensation-planning');
}
