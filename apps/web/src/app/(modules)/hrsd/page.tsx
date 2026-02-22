/**
 * @module HRSDPage
 * @description HRSD module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function HRSDPage() {
  return (
    <ModulePage
      moduleCode="HRSD"
      moduleName="HRSD"
      moduleIcon="hrsd"
      featureCount={8}
      isImplemented={false}
    />
  );
}

