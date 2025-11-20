/**
 * @module CoreHRPage
 * @description Core HR module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function CoreHRPage() {
  return (
    <ModulePage
      moduleCode="CORE_HR"
      moduleName="Core HR"
      moduleIcon="coreHr"
      featureCount={15}
      isImplemented={false}
    />
  );
}
