/**
 * @reference docs/aura-master-instructions.md
 */
"use client";

import React from "react";
import { ModuleGrid } from "@/components/dashboard/module-grid";

const workflowFeatures = [
  "Workflow Designer",
  "Approval Chains",
  "Conditional Logic",
  "Email Notifications",
  "Escalation Rules",
  "Form Builder",
  "Integration Points",
  "Workflow Templates",
  "Workflow Analytics",
  "Version Control",
  "Testing Mode",
  "Audit Log",
];

export default function WorkflowEngineLandingPage() {
  return (
    <ModuleGrid
      title="Workflow Engine"
      description="Design, automate, and monitor approvals and service flows across every module."
      features={workflowFeatures}
      basePath="/dashboard/workflow-engine"
    />
  );
}
