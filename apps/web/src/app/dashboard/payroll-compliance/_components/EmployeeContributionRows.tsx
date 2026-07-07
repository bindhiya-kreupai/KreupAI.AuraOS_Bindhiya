'use client';

/**
 * Shared editable employee-rows editor for the GCC social-insurance / WPS
 * calculators (Bahrain SIO, Oman SPF, Qatar WPS). Replaces the previous
 * hard-coded mock employee arrays with real, user-entered rows so the
 * downstream (stateless) contribution/validation endpoints operate on
 * genuine data supplied by the operator.
 */

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface EmployeeRow {
  employeeId: string;
  employeeName: string;
  nationality: string;
  basicSalary: string;
  housingAllowance?: string;
}

export interface ColumnConfig {
  key: keyof EmployeeRow;
  label: string;
  labelAr?: string;
  type?: 'text' | 'number';
  placeholder?: string;
  widthClass?: string;
}

interface Props {
  rows: EmployeeRow[];
  onChange: (rows: EmployeeRow[]) => void;
  columns: ColumnConfig[];
  accentClass?: string;
  addLabel?: string;
}

export function makeEmptyRow(): EmployeeRow {
  return {
    employeeId: '',
    employeeName: '',
    nationality: '',
    basicSalary: '',
    housingAllowance: '',
  };
}

export default function EmployeeContributionRows({
  rows,
  onChange,
  columns,
  accentClass = 'bg-indigo-600 hover:bg-indigo-700',
  addLabel = 'Add employee',
}: Props) {
  const update = (index: number, key: keyof EmployeeRow, value: string) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
    onChange(next);
  };

  const addRow = () => onChange([...rows, makeEmptyRow()]);

  const removeRow = (index: number) => onChange(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-left text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 font-medium">
                  {col.label}
                  {col.labelAr ? (
                    <span className="block text-xs text-slate-400" dir="rtl">
                      {col.labelAr}
                    </span>
                  ) : null}
                </th>
              ))}
              <th className="px-3 py-2 font-medium text-right">—</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2 ${col.widthClass ?? ''}`}>
                    <input
                      type={col.type ?? 'text'}
                      value={row[col.key] ?? ''}
                      placeholder={col.placeholder ?? ''}
                      onChange={(e) => update(index, col.key, e.target.value)}
                      className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    aria-label="Remove row"
                    className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-slate-400">
                  No employees added yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white ${accentClass}`}
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
