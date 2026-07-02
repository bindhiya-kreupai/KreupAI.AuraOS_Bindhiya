import { redirect } from 'next/navigation';

// AURA-478: Menu feature "Org Audit Checklist (13 categories)" maps to the
// canonical org audit checklist workspace, which already implements all 13
// categories (EPIC-09 · S17). This route consolidates to that page.
export default function OrgAuditChecklist13Redirect() {
  redirect('/dashboard/org-compliance/audit-checklist');
}
