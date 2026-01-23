"use client";

import React, { useState } from "react";
import {
  Eye,
  Download,
  RefreshCw,
  FileText,
  Table,
  BarChart3,
  Maximize2,
} from "lucide-react";

interface PreviewRow {
  [key: string]: string | number;
}

interface ReportPreviewProps {
  chartType?: string;
  columns?: string[];
}

const mockPreviewData: PreviewRow[] = [
  { emp_id: "EMP-001", name: "Sarah Johnson", department: "Engineering", position: "Senior Engineer", salary: 142000, hire_date: "2021-03-15" },
  { emp_id: "EMP-002", name: "Michael Chen", department: "Engineering", position: "Staff Engineer", salary: 165000, hire_date: "2020-06-01" },
  { emp_id: "EMP-003", name: "Emily Davis", department: "Engineering", position: "Engineer II", salary: 118000, hire_date: "2022-01-10" },
  { emp_id: "EMP-004", name: "James Wilson", department: "Engineering", position: "Tech Lead", salary: 155000, hire_date: "2019-09-20" },
  { emp_id: "EMP-005", name: "Lisa Anderson", department: "Engineering", position: "Engineer I", salary: 95000, hire_date: "2024-02-28" },
  { emp_id: "EMP-006", name: "David Martinez", department: "Engineering", position: "Senior Engineer", salary: 138000, hire_date: "2021-11-05" },
  { emp_id: "EMP-007", name: "Anna Kim", department: "Engineering", position: "Engineer II", salary: 122000, hire_date: "2022-07-18" },
  { emp_id: "EMP-008", name: "Robert Taylor", department: "Engineering", position: "Staff Engineer", salary: 158000, hire_date: "2020-03-22" },
];

const mockChartData = [
  { label: "Engineer I", value: 12 },
  { label: "Engineer II", value: 28 },
  { label: "Senior Engineer", value: 22 },
  { label: "Staff Engineer", value: 15 },
  { label: "Tech Lead", value: 8 },
  { label: "Principal", value: 4 },
];

export function ReportPreview({ chartType = "table" }: ReportPreviewProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart">(
    chartType === "table" ? "table" : "chart"
  );

  const maxValue = Math.max(...mockChartData.map((d) => d.value));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
            Report Preview
          </h3>
          <span className="text-xs text-silver-mist">
            ({mockPreviewData.length} rows)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded ${
                viewMode === "table"
                  ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm"
                  : "text-silver-mist"
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={`p-1.5 rounded ${
                viewMode === "chart"
                  ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm"
                  : "text-silver-mist"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
          <button className="p-1.5 text-silver-mist hover:text-celestial-indigo rounded transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-silver-mist hover:text-celestial-indigo rounded transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-deep-cosmos">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-silver-mist">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-silver-mist">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-silver-mist">Department</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-silver-mist">Position</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-silver-mist">Salary</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-silver-mist">Hire Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud dark:divide-nebula-purple/50">
                {mockPreviewData.map((row) => (
                  <tr key={row.emp_id as string} className="hover:bg-slate-50/50 dark:hover:bg-deep-cosmos/50">
                    <td className="px-4 py-2.5 text-xs text-silver-mist">{row.emp_id}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-ink-black dark:text-pearl">{row.name}</td>
                    <td className="px-4 py-2.5 text-sm text-ink-black dark:text-pearl">{row.department}</td>
                    <td className="px-4 py-2.5 text-sm text-ink-black dark:text-pearl">{row.position}</td>
                    <td className="px-4 py-2.5 text-sm text-right text-ink-black dark:text-pearl">
                      ${(row.salary as number).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-silver-mist">{row.hire_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="border border-cloud dark:border-nebula-purple/50 rounded-lg p-6">
          <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-4">
            Headcount by Position Level
          </h4>
          <div className="space-y-3">
            {mockChartData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-ink-black dark:text-pearl w-28 truncate">
                  {item.label}
                </span>
                <div className="flex-1 h-6 bg-slate-50 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div
                    className="h-full bg-celestial-indigo/70 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  >
                    {item.value >= 10 && (
                      <span className="text-[10px] font-medium text-white">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
                {item.value < 10 && (
                  <span className="text-xs font-medium text-ink-black dark:text-pearl w-6">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs text-silver-mist">Export as:</span>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors">
          <FileText className="w-3.5 h-3.5 text-coral-alert" /> PDF
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors">
          <FileText className="w-3.5 h-3.5 text-aurora-green" /> Excel
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors">
          <FileText className="w-3.5 h-3.5 text-celestial-indigo" /> CSV
        </button>
        <button className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </div>
  );
}
