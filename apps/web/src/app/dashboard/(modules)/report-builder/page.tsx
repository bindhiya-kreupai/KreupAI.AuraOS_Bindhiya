"use client";

import React from "react";
import { CustomReportBuilder } from "@/components/reports/CustomReportBuilder";

export default function ReportBuilderPage() {
  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        <CustomReportBuilder />
      </div>
    </div>
  );
}
