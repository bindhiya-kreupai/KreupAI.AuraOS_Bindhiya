/**
 * @module PolicyManagementPage
 * @description Policy Mgmt module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function PolicyManagementPage() {
  return (
    <ModulePage
      moduleCode="POLICY_MGMT"
      moduleName="Policy Mgmt"
      moduleIcon="policy"
      featureCount={8}
      isImplemented={false}
    />
  );
}

