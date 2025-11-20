/**
 * @module DEIPage
 * @description DEI module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function DEIPage() {
  return (
    <ModulePage
      moduleCode="DEI"
      moduleName="DEI"
      moduleIcon="dei"
      featureCount={8}
      isImplemented={false}
    />
  );
}
