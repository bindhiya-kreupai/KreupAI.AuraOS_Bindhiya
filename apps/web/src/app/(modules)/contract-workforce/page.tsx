/**
 * @module ContractWorkforcePage
 * @description Contract Workforce module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function ContractWorkforcePage() {
  return (
    <ModulePage
      moduleCode="CONTRACT_WORKFORCE"
      moduleName="Contract Workforce"
      moduleIcon="contract"
      featureCount={8}
      isImplemented={false}
    />
  );
}

