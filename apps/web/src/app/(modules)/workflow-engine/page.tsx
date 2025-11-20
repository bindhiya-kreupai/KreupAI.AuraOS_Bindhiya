/**
 * @module WorkflowEnginePage
 * @description Workflow Engine module main page
 * @project AURA HCM Platform
 * @reference docs/aura-master-instructions.md
 */

import { ModulePage } from '@/components/ui';

export default function WorkflowEnginePage() {
  return (
    <ModulePage
      moduleCode="WORKFLOW_ENGINE"
      moduleName="Workflow Engine"
      moduleIcon="workflow"
      featureCount={12}
      isImplemented={false}
    />
  );
}
