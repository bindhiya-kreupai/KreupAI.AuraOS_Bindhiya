import { redirect } from 'next/navigation';

/**
 * Menu feature "Holiday Work Approval (auto comp-off accrual)" canonicalizes to the
 * existing, fully API-backed holidays compliance work-approvals workspace.
 */
export default function HolidayWorkApprovalRedirectPage() {
  redirect('/dashboard/holidays-compliance/work-approvals');
}
