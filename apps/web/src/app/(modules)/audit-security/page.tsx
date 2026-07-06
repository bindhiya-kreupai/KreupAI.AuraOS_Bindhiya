/**
 * @module AuditSecurityPage
 * @description Audit & Security module route. The full dashboard hub lives at
 *              /dashboard/security, so this module entry redirects there instead
 *              of rendering an unimplemented placeholder (backlog AURA-280).
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { redirect } from 'next/navigation';

export default function AuditSecurityPage() {
  redirect('/dashboard/security');
}
