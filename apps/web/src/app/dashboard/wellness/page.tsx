/**
 * @reference docs/aura-master-instructions.md
 */
"use client";

import React from "react";
import { ModuleGrid } from "@/components/dashboard/module-grid";

const wellnessFeatures = [
  "Health Programs",
  "Mental Health",
  "Health Risk Assessment",
  "Wellness Challenges",
  "Wellness Points",
  "Gym Membership",
  "Wellness Dashboard",
  "Dashboard",
];

export default function WellnessLandingPage() {
  return (
    <ModuleGrid
      title="Wellness"
      description="Employee well-being programs, assessments, and incentives."
      features={wellnessFeatures}
      basePath="/dashboard/wellness"
    />
  );
}
