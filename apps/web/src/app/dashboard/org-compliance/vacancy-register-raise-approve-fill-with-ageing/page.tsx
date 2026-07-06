import { redirect } from 'next/navigation';

// AURA-482: Menu feature "Vacancy Register (raise/approve/fill with ageing)"
// maps to the canonical vacancy register workspace (EPIC-09 · S11), which
// implements raise, approve, fill and ageing against
// /api/v1/org-compliance/vacancy.
export default function VacancyRegisterRedirect() {
  redirect('/dashboard/org-compliance/vacancy');
}
