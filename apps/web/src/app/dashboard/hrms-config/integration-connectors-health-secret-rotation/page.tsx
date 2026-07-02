import { redirect } from 'next/navigation';

/**
 * Menu feature "Integration Connectors · Health + Secret Rotation"
 * canonicalizes to the existing, fully API-backed Connectors / Integration
 * Endpoints workspace (EPIC-34 · S25), which tracks health checks and secret
 * rotation.
 */
export default function IntegrationConnectorsRedirectPage() {
  redirect('/dashboard/hrms-config/connectors');
}
