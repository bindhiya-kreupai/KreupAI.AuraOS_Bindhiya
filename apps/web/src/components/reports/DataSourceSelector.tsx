"use client";

import React, { useState } from "react";
import {
  Database,
  Users,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tables: string[];
  recordCount: number;
}

interface DataSourceSelectorProps {
  selectedSource?: string;
  onSelect?: (sourceId: string) => void;
}

const dataSources: DataSource[] = [
  {
    id: "employees",
    name: "Employees",
    description: "Employee demographics, roles, and status",
    icon: <Users className="w-5 h-5" />,
    tables: ["employees", "departments", "positions"],
    recordCount: 1247,
  },
  {
    id: "attendance",
    name: "Time & Attendance",
    description: "Clock-in/out records, timesheets, and schedules",
    icon: <Clock className="w-5 h-5" />,
    tables: ["attendance_logs", "timesheets", "schedules"],
    recordCount: 45620,
  },
  {
    id: "payroll",
    name: "Payroll & Compensation",
    description: "Salary, bonuses, deductions, and pay history",
    icon: <DollarSign className="w-5 h-5" />,
    tables: ["payroll_runs", "compensation", "deductions"],
    recordCount: 14880,
  },
  {
    id: "leave",
    name: "Leave & Absence",
    description: "Leave requests, balances, and holidays",
    icon: <Calendar className="w-5 h-5" />,
    tables: ["leave_requests", "leave_balances", "holidays"],
    recordCount: 8340,
  },
  {
    id: "recruitment",
    name: "Recruitment",
    description: "Job postings, applications, and hiring pipeline",
    icon: <Briefcase className="w-5 h-5" />,
    tables: ["job_postings", "applications", "interviews"],
    recordCount: 3250,
  },
];

export function DataSourceSelector({ selectedSource, onSelect }: DataSourceSelectorProps) {
  const [selected, setSelected] = useState<string>(selectedSource || "");

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
          Select Data Source
        </h3>
      </div>
      <p className="text-xs text-silver-mist">
        Choose the primary data source for your report
      </p>

      <div className="grid grid-cols-1 gap-3">
        {dataSources.map((source) => (
          <button
            key={source.id}
            onClick={() => handleSelect(source.id)}
            className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-colors ${
              selected === source.id
                ? "border-celestial-indigo bg-celestial-indigo/5"
                : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30"
            }`}
          >
            <div className={`p-2 rounded-lg ${
              selected === source.id
                ? "bg-celestial-indigo/10 text-celestial-indigo"
                : "bg-slate-50 dark:bg-deep-cosmos text-silver-mist"
            }`}>
              {source.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-black dark:text-pearl">
                {source.name}
              </p>
              <p className="text-xs text-silver-mist mt-0.5">
                {source.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-silver-mist">
                <span>{source.tables.length} tables</span>
                <span>{source.recordCount.toLocaleString()} records</span>
              </div>
            </div>
            <div className="flex-shrink-0 mt-1">
              {selected === source.id ? (
                <CheckCircle2 className="w-5 h-5 text-celestial-indigo" />
              ) : (
                <Circle className="w-5 h-5 text-cloud dark:text-nebula-purple/50" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
