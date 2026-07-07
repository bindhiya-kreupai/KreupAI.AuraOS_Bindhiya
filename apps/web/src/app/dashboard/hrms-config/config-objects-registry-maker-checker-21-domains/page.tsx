import { redirect } from 'next/navigation';

/**
 * Menu feature "Config Objects Registry · Maker-Checker (21 domains)"
 * canonicalizes to the existing, fully API-backed Config Object Workspaces
 * (EPIC-34 · S01, S03–S20, S24).
 */
export default function ConfigObjectsRegistryRedirectPage() {
  redirect('/dashboard/hrms-config/config-objects');
}
