/**
 * @module EmployeeEngagementPage
 * @description Employee Engagement module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function EmployeeEngagementPage() {
  return (
    <ModulePage
      moduleCode="EMPLOYEE_ENGAGEMENT"
      moduleName="Employee Engagement"
      moduleIcon="engagementEmployee"
      featureCount={3}
      isImplemented={false}
    />
  );
}

