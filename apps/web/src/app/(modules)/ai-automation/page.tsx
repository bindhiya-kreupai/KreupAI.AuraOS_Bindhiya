/**
 * @module AIAutomationPage
 * @description AI & Automation module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function AIAutomationPage() {
  return (
    <ModulePage
      moduleCode="AI_AUTOMATION"
      moduleName="AI & Automation"
      moduleIcon="ai"
      featureCount={15}
      isImplemented={false}
    />
  );
}

