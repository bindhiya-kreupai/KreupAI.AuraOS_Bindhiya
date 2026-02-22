/**
 * @module PerformancePage
 * @description Performance module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function PerformancePage() {
  return (
    <ModulePage
      moduleCode="PERFORMANCE"
      moduleName="Performance"
      moduleIcon="performance"
      featureCount={15}
      isImplemented={false}
    />
  );
}

