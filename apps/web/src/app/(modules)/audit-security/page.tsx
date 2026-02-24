/**
 * @module AuditSecurityPage
 * @description Audit & Security module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function AuditSecurityPage() {
  return (
    <ModulePage
      moduleCode="AUDIT_SECURITY"
      moduleName="Audit & Security"
      moduleIcon="security"
      featureCount={12}
      isImplemented={false}
    />
  );
}

