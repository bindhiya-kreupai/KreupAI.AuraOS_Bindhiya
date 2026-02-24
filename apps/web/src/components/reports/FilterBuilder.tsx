"use client";

import React, { useState } from "react";
import { Filter, Plus, Trash2, ChevronDown } from "lucide-react";

interface FilterCondition {
  id: string;
  column: string;
  operator: string;
  value: string;
  conjunction: "AND" | "OR";
}

interface FilterBuilderProps {
  dataSource?: string;
  onChange?: (filters: FilterCondition[]) => void;
}

const operators: Record<string, { label: string; value: string }[]> = {
  text: [
    { label: "equals", value: "eq" },
    { label: "not equals", value: "neq" },
    { label: "contains", value: "contains" },
    { label: "starts with", value: "starts_with" },
    { label: "ends with", value: "ends_with" },
    { label: "is empty", value: "empty" },
    { label: "is not empty", value: "not_empty" },
  ],
  number: [
    { label: "equals", value: "eq" },
    { label: "not equals", value: "neq" },
    { label: "greater than", value: "gt" },
    { label: "less than", value: "lt" },
    { label: "between", value: "between" },
  ],
  date: [
    { label: "is", value: "eq" },
    { label: "before", value: "before" },
    { label: "after", value: "after" },
    { label: "between", value: "between" },
    { label: "last N days", value: "last_n_days" },
    { label: "this month", value: "this_month" },
    { label: "this year", value: "this_year" },
  ],
};

const columnOptions = [
  { id: "department", name: "Department", type: "text" },
  { id: "status", name: "Status", type: "text" },
  { id: "hire_date", name: "Hire Date", type: "date" },
  { id: "salary", name: "Salary", type: "number" },
  { id: "location", name: "Location", type: "text" },
  { id: "position", name: "Position", type: "text" },
  { id: "manager", name: "Manager", type: "text" },
];

const initialFilters: FilterCondition[] = [
  { id: "f-1", column: "department", operator: "eq", value: "Engineering", conjunction: "AND" },
  { id: "f-2", column: "status", operator: "eq", value: "Active", conjunction: "AND" },
];

export function FilterBuilder({ onChange }: FilterBuilderProps) {
  const [filters, setFilters] = useState<FilterCondition[]>(initialFilters);

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: `f-${Date.now()}`,
      column: columnOptions[0].id,
      operator: "eq",
      value: "",
      conjunction: "AND",
    };
    const updated = [...filters, newFilter];
    setFilters(updated);
    onChange?.(updated);
  };

  const removeFilter = (id: string) => {
    const updated = filters.filter((f) => f.id !== id);
    setFilters(updated);
    onChange?.(updated);
  };

  const updateFilter = (id: string, field: keyof FilterCondition, value: string) => {
    const updated = filters.map((f) =>
      f.id === id ? { ...f, [field]: value } : f
    );
    setFilters(updated);
    onChange?.(updated);
  };

  const getOperatorsForColumn = (columnId: string) => {
    const col = columnOptions.find((c) => c.id === columnId);
    return operators[col?.type || "text"] || operators.text;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-celestial-indigo" />
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
            Filter Conditions
          </h3>
        </div>
        <button
          onClick={addFilter}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-celestial-indigo bg-celestial-indigo/10 rounded-lg hover:bg-celestial-indigo/20 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Filter
        </button>
      </div>

      {filters.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-cloud dark:border-nebula-purple/50 rounded-lg">
          <Filter className="w-6 h-6 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No filters applied</p>
          <p className="text-xs text-silver-mist mt-1">All records will be included</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <div key={filter.id} className="flex items-center gap-2">
              {/* Conjunction */}
              {index > 0 && (
                <select
                  value={filter.conjunction}
                  onChange={(e) => updateFilter(filter.id, "conjunction", e.target.value)}
                  className="w-16 px-2 py-1.5 text-xs font-medium rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-celestial-indigo"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}
              {index === 0 && <div className="w-16 text-xs text-silver-mist text-center">Where</div>}

              {/* Column */}
              <select
                value={filter.column}
                onChange={(e) => updateFilter(filter.id, "column", e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                {columnOptions.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>

              {/* Operator */}
              <select
                value={filter.operator}
                onChange={(e) => updateFilter(filter.id, "operator", e.target.value)}
                className="w-32 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                {getOperatorsForColumn(filter.column).map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              {/* Value */}
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, "value", e.target.value)}
                placeholder="Value..."
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl placeholder:text-silver-mist"
              />

              {/* Remove */}
              <button
                onClick={() => removeFilter(filter.id)}
                className="p-1.5 text-silver-mist hover:text-coral-alert rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {filters.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-deep-cosmos text-xs text-silver-mist">
          Preview: Showing records where{" "}
          {filters.map((f, i) => (
            <span key={f.id}>
              {i > 0 && <span className="font-medium text-celestial-indigo"> {f.conjunction} </span>}
              <span className="font-medium text-ink-black dark:text-pearl">{columnOptions.find((c) => c.id === f.column)?.name}</span>
              {" "}{getOperatorsForColumn(f.column).find((o) => o.value === f.operator)?.label}{" "}
              <span className="font-medium text-ink-black dark:text-pearl">{f.value || "..."}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
