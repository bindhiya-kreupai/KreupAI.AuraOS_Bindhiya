import { redirect } from 'next/navigation';

// AURA-048: this ModulePage shell was an isImplemented=false placeholder while
// five service-backed subpages already exist under
// /dashboard/performance/competency-assessment/*. Redirect to that canonical
// dashboard hub instead of showing a "not implemented" stub.
export default function CompetencyLibraryModuleRedirect() {
  redirect('/dashboard/performance/competency-assessment');
}
