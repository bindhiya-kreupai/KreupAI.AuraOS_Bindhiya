import { redirect } from 'next/navigation';

// AURA-514: Menu feature "Exit Clearance Checklist (HR/IT/FIN/SEC/LM/ADMIN)"
// maps to the canonical clearance workspace (EPIC-27 · S09), which seeds and
// tracks department checklists across HR / IT / FINANCE / SECURITY /
// LINE_MANAGER / ADMIN.
export default function ExitClearanceChecklistRedirect() {
  redirect('/dashboard/separation-compliance/clearance');
}
