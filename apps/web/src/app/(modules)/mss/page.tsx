/**
 * @module MSSPage
 * @description MSS module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function MSSPage() {
  return (
    <ModulePage
      moduleCode="MSS"
      moduleName="MSS"
      moduleIcon="mss"
      featureCount={4}
      isImplemented={false}
    />
  );
}

