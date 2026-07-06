import { redirect } from 'next/navigation';

/**
 * Menu feature "HR Document Register (auto retentionUntil)" canonicalizes to the
 * existing, fully API-backed Document Retention Compliance Documents workspace,
 * which derives retentionUntil from the retention schedule on upsert.
 */
export default function HrDocumentRegisterRedirectPage() {
  redirect('/dashboard/document-retention-compliance/documents');
}
