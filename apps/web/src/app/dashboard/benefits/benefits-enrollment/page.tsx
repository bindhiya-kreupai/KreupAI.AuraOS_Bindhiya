import { redirect } from 'next/navigation';

/**
 * Benefits Enrollment (consolidation shim).
 *
 * This route previously rendered a ModuleGrid whose sub-feature tiles
 * (Plan Selection, Coverage Level, Dependent Selection, ...) linked to child
 * routes that were never implemented and 404'd. The real, fully-built
 * multi-step enrollment wizard lives at `/dashboard/benefits-enrollment`
 * (app/dashboard/(modules)/benefits-enrollment). Consolidate by redirecting
 * there instead of surfacing dead links.
 */
export default function BenefitsEnrollmentRedirectPage() {
  redirect('/dashboard/benefits-enrollment');
}
