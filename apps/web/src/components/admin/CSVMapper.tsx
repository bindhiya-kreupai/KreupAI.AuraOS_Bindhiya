"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

const COLUMN_MAPPINGS = [
  { source: "emp_name", target: "Full Name", sample: ["John Smith", "Jane Doe", "Bob Wilson"] },
  { source: "emp_email", target: "Email Address", sample: ["john@example.com", "jane@example.com", "bob@example.com"] },
  { source: "department", target: "Department", sample: ["Engineering", "Marketing", "Sales"] },
  { source: "hire_date", target: "Date of Joining", sample: ["2024-01-15", "2024-02-20", "2024-03-10"] },
  { source: "salary", target: "Base Salary", sample: ["75000", "68000", "72000"] },
  { source: "manager", target: "Reporting Manager", sample: ["Alice Brown", "Alice Brown", "Charlie Lee"] },
];

const TARGET_FIELDS = [
  "Full Name", "Email Address", "Department", "Date of Joining",
  "Base Salary", "Reporting Manager", "Employee ID", "Phone Number", "Location",
];

interface CSVMapperProps {
  onMappingChange?: (mappings: string[]) => void;
}

export default function CSVMapper({ onMappingChange }: CSVMapperProps) {
  const [mappings, setMappings] = useState(COLUMN_MAPPINGS.map((m) => m.target));

  const handleChange = (idx: number, value: string) => {
    const newMappings = [...mappings];
    newMappings[idx] = value;
    setMappings(newMappings);
    onMappingChange?.(newMappings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Map Columns</h3>
      <p className="text-sm text-silver-mist">Match your file columns to system fields.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cloud dark:border-nebula-purple/30">
              <th className="text-left py-2 px-3 font-semibold text-ink-black dark:text-pearl">Source Column</th>
              <th className="text-center py-2 px-3" />
              <th className="text-left py-2 px-3 font-semibold text-ink-black dark:text-pearl">Target Field</th>
              <th className="text-left py-2 px-3 font-semibold text-ink-black dark:text-pearl">Sample Data</th>
            </tr>
          </thead>
          <tbody>
            {COLUMN_MAPPINGS.map((mapping, idx) => (
              <tr key={mapping.source} className="border-b border-cloud dark:border-nebula-purple/30 last:border-0">
                <td className="py-2 px-3">
                  <code className="text-xs bg-gray-100 dark:bg-deep-cosmos px-2 py-0.5 rounded font-mono text-ink-black dark:text-pearl">
                    {mapping.source}
                  </code>
                </td>
                <td className="py-2 px-3 text-center">
                  <ArrowRight className="w-4 h-4 text-silver-mist mx-auto" />
                </td>
                <td className="py-2 px-3">
                  <select
                    value={mappings[idx]}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    className="px-2 py-1 bg-gray-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/30 rounded text-xs text-ink-black dark:text-pearl"
                  >
                    {TARGET_FIELDS.map((field) => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-3">
                  <div className="flex gap-1">
                    {mapping.sample.map((s, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 dark:bg-deep-cosmos px-1.5 py-0.5 rounded text-silver-mist">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
