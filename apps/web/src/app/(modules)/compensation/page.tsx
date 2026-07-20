import { redirect } from 'next/navigation';

// Consolidated (AURA-029). This legacy tab UI rendered 11 hardcoded mock
// components (several — SalaryReview, BudgetAllocation, BenchmarkComparison,
// CompReviewHistory — without their required props) and carried a @ts-nocheck.
// The real, API-backed compensation module now lives under
// /dashboard/compensation/*; this route redirects to that canonical hub.
export default function LegacyCompensationRedirect() {
  redirect('/dashboard/compensation');
}
