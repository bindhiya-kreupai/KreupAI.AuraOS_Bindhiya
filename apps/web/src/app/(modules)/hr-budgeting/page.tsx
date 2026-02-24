/**
 * @module HRBudgetingPage
 * @description HR Budgeting module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function HRBudgetingPage() {
  return (
    <ModulePage
      moduleCode="HR_BUDGETING"
      moduleName="HR Budgeting"
      moduleIcon="hrBudgeting"
      featureCount={8}
      isImplemented={false}
    />
  );
}

