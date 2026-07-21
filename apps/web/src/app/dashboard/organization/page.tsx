import { redirect } from 'next/navigation';

// The organization feature lives at /dashboard/core-hr/organization-structure
// (DB-backed via OrganizationService). This folder is legacy scaffold retained
// only for its supporting files; the route itself just forwards to the real page.
export default function OrganizationPage() {
  redirect('/dashboard/core-hr/organization-structure');
}
