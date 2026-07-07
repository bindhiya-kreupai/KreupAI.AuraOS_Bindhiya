import { redirect } from 'next/navigation';

/**
 * Menu feature "Data Migration Plans · Run Validation" canonicalizes to the
 * existing, fully API-backed Data Migration Plans workspace (EPIC-34 · S26),
 * which records runs and pass/fail validations that gate the go-live
 * certificate.
 */
export default function DataMigrationPlansRedirectPage() {
  redirect('/dashboard/hrms-config/migrations');
}
