/**
 * @module PositionBudgetingPage
 * @description Position Budgeting module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function PositionBudgetingPage() {
  return (
    <ModulePage
      moduleCode="POSITION_BUDGETING"
      moduleName="Position Budgeting"
      moduleIcon="positionBudgeting"
      featureCount={8}
      isImplemented={false}
    />
  );
}
