/**
 * @reference docs/aura-master-instructions.md
 */
"use client";

import React from "react";
import { ModuleGrid } from "@/components/dashboard/module-grid";

const workforceFeatures = [
  "Demand Forecasting",
  "Supply Analysis",
  "Gap Analysis",
  "Scenario Modeling",
  "Workforce Costs",
  "Succession Readiness",
  "Talent Acquisition Plan",
  "Workforce Analytics",
];

export default function WorkforcePlanningLandingPage() {
  return (
    <ModuleGrid
      title="Workforce Planning"
      description="Model supply and demand, plan hiring, and align talent pipelines to business strategy."
      features={workforceFeatures}
      basePath="/dashboard/workforce-planning"
    />
  );
}
