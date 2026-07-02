import { redirect } from 'next/navigation';

/**
 * Menu feature "Approval Workflow Templates" canonicalizes to the existing,
 * fully API-backed Approval Workflow Templates workspace (EPIC-34 · S21).
 */
export default function ApprovalWorkflowTemplatesRedirectPage() {
  redirect('/dashboard/hrms-config/approval-templates');
}
