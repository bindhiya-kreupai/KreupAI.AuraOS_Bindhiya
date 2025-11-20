/**
 * @module HRHelpdeskPage
 * @description HR Helpdesk module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function HRHelpdeskPage() {
  return (
    <ModulePage
      moduleCode="HR_HELPDESK"
      moduleName="HR Helpdesk"
      moduleIcon="hrHelpdesk"
      featureCount={8}
      isImplemented={false}
    />
  );
}
