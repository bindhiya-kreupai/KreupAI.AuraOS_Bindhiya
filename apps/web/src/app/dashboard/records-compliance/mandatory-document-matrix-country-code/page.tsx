import { redirect } from 'next/navigation';

/**
 * Menu feature "Mandatory Document Matrix (country × code)" canonicalizes to the
 * existing, fully API-backed Records Compliance Document Matrix workspace.
 */
export default function MandatoryDocumentMatrixRedirectPage() {
  redirect('/dashboard/records-compliance/document-matrix');
}
