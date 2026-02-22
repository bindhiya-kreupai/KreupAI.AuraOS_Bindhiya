/**
 * @module LeavePage
 * @description Leave module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function LeavePage() {
  return (
    <ModulePage
      moduleCode="LEAVE"
      moduleName="Leave"
      moduleIcon="leave"
      featureCount={10}
      isImplemented={false}
    />
  );
}

