/**
 * @module ESSPage
 * @description ESS module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function ESSPage() {
  return (
    <ModulePage
      moduleCode="ESS"
      moduleName="ESS"
      moduleIcon="ess"
      featureCount={8}
      isImplemented={false}
    />
  );
}
