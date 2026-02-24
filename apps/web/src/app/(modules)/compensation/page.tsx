/**
 * @module CompensationPage
 * @description Compensation module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function CompensationPage() {
  return (
    <ModulePage
      moduleCode="COMPENSATION"
      moduleName="Compensation"
      moduleIcon="compensation"
      featureCount={10}
      isImplemented={false}
    />
  );
}

