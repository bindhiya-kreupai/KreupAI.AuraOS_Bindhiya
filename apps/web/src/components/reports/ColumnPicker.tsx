"use client";

import React, { useState } from "react";
import { Columns, Check, GripVertical, Search, X } from "lucide-react";

interface Column {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "boolean";
  category: string;
}

interface ColumnPickerProps {
  dataSource?: string;
  selectedColumns?: string[];
  onChange?: (columnIds: string[]) => void;
}

const mockColumns: Record<string, Column[]> = {
  employees: [
    { id: "emp_id", name: "Employee ID", type: "text", category: "Identity" },
    { id: "first_name", name: "First Name", type: "text", category: "Identity" },
    { id: "last_name", name: "Last Name", type: "text", category: "Identity" },
    { id: "email", name: "Email", type: "text", category: "Contact" },
    { id: "phone", name: "Phone", type: "text", category: "Contact" },
    { id: "department", name: "Department", type: "text", category: "Organization" },
    { id: "position", name: "Position", type: "text", category: "Organization" },
    { id: "manager", name: "Manager", type: "text", category: "Organization" },
    { id: "hire_date", name: "Hire Date", type: "date", category: "Employment" },
    { id: "status", name: "Status", type: "text", category: "Employment" },
    { id: "salary", name: "Base Salary", type: "number", category: "Compensation" },
    { id: "location", name: "Location", type: "text", category: "Organization" },
  ],
  attendance: [
    { id: "att_date", name: "Date", type: "date", category: "Time" },
    { id: "clock_in", name: "Clock In", type: "date", category: "Time" },
    { id: "clock_out", name: "Clock Out", type: "date", category: "Time" },
    { id: "hours_worked", name: "Hours Worked", type: "number", category: "Time" },
    { id: "overtime", name: "Overtime Hours", type: "number", category: "Time" },
    { id: "att_status", name: "Status", type: "text", category: "Status" },
    { id: "late_minutes", name: "Late Minutes", type: "number", category: "Status" },
  ],
  payroll: [
    { id: "pay_period", name: "Pay Period", type: "date", category: "Period" },
    { id: "gross_pay", name: "Gross Pay", type: "number", category: "Earnings" },
    { id: "net_pay", name: "Net Pay", type: "number", category: "Earnings" },
    { id: "deductions", name: "Total Deductions", type: "number", category: "Deductions" },
    { id: "tax", name: "Tax", type: "number", category: "Deductions" },
    { id: "bonus", name: "Bonus", type: "number", category: "Earnings" },
  ],
  leave: [
    { id: "leave_type", name: "Leave Type", type: "text", category: "Leave" },
    { id: "start_date", name: "Start Date", type: "date", category: "Period" },
    { id: "end_date", name: "End Date", type: "date", category: "Period" },
    { id: "days", name: "Days", type: "number", category: "Period" },
    { id: "leave_status", name: "Status", type: "text", category: "Leave" },
    { id: "balance", name: "Remaining Balance", type: "number", category: "Leave" },
  ],
  recruitment: [
    { id: "job_title", name: "Job Title", type: "text", category: "Position" },
    { id: "applicant_name", name: "Applicant Name", type: "text", category: "Applicant" },
    { id: "applied_date", name: "Applied Date", type: "date", category: "Timeline" },
    { id: "stage", name: "Pipeline Stage", type: "text", category: "Pipeline" },
    { id: "source", name: "Source", type: "text", category: "Applicant" },
    { id: "rating", name: "Rating", type: "number", category: "Evaluation" },
  ],
};

const typeColors: Record<string, string> = {
  text: "bg-blue-100 dark:bg-blue-900/20 text-blue-600",
  number: "bg-green-100 dark:bg-green-900/20 text-green-600",
  date: "bg-purple-100 dark:bg-purple-900/20 text-purple-600",
  boolean: "bg-amber-100 dark:bg-amber-900/20 text-amber-600",
};

export function ColumnPicker({ dataSource = "employees", selectedColumns: initial, onChange }: ColumnPickerProps) {
  const [selected, setSelected] = useState<string[]>(initial || ["emp_id", "first_name", "last_name", "department"]);
  const [search, setSearch] = useState("");

  const columns = mockColumns[dataSource] || mockColumns.employees;
  const filtered = columns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filtered.map((c) => c.category))];

  const toggleColumn = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
    setSelected(updated);
    onChange?.(updated);
  };

  const removeColumn = (id: string) => {
    const updated = selected.filter((s) => s !== id);
    setSelected(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Columns className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
          Select Columns
        </h3>
        <span className="text-xs text-silver-mist ml-auto">
          {selected.length} selected
        </span>
      </div>

      {/* Selected Columns (Reorderable) */}
      {selected.length > 0 && (
        <div className="p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos">
          <p className="text-xs font-medium text-silver-mist mb-2">Column Order</p>
          <div className="space-y-1">
            {selected.map((id) => {
              const col = columns.find((c) => c.id === id);
              if (!col) return null;
              return (
                <div key={id} className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-stellar-blue rounded border border-cloud dark:border-nebula-purple/50">
                  <GripVertical className="w-3 h-3 text-silver-mist cursor-grab" />
                  <span className="text-xs text-ink-black dark:text-pearl flex-1">{col.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[col.type]}`}>
                    {col.type}
                  </span>
                  <button onClick={() => removeColumn(id)} className="text-silver-mist hover:text-coral-alert">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50">
        <Search className="w-4 h-4 text-silver-mist" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search columns..."
          className="flex-1 text-sm bg-transparent outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist"
        />
      </div>

      {/* Available Columns by Category */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {categories.map((category) => (
          <div key={category}>
            <p className="text-xs font-medium text-silver-mist uppercase tracking-wide mb-1.5">
              {category}
            </p>
            <div className="space-y-1">
              {filtered
                .filter((c) => c.category === category)
                .map((col) => {
                  const isSelected = selected.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-celestial-indigo/5 border border-celestial-indigo/30"
                          : "border border-transparent hover:bg-slate-50 dark:hover:bg-deep-cosmos"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected
                          ? "bg-celestial-indigo border-celestial-indigo"
                          : "border-cloud dark:border-nebula-purple/50"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-ink-black dark:text-pearl flex-1">{col.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[col.type]}`}>
                        {col.type}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
