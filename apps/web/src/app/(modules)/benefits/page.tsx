/**
 * @module BenefitsPage
 * @description Benefits module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function BenefitsPage() {
  return (
    <ModulePage
      moduleCode="BENEFITS"
      moduleName="Benefits"
      moduleIcon="benefits"
      featureCount={12}
      isImplemented={false}
    />
  );
}

