/**
 * @module MobileAppPage
 * @description Mobile App module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function MobileAppPage() {
  return (
    <ModulePage
      moduleCode="MOBILE_APP"
      moduleName="Mobile App"
      moduleIcon="mobile"
      featureCount={15}
      isImplemented={false}
    />
  );
}
