"use client";

import React from "react";
import { PeopleAnalytics } from "@/components/reports/PeopleAnalytics";

export default function PeopleAnalyticsPage() {
  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-6xl mx-auto">
        <PeopleAnalytics />
      </div>
    </div>
  );
}
