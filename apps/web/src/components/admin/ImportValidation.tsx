"use client";

import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";

const VALIDATION_RESULTS = {
  errors: [
    { row: 45, field: "Email Address", message: 'Invalid email format: "john@"' },
    { row: 102, field: "Date of Joining", message: "Invalid date: 2024-13-45" },
    { row: 389, field: "Base Salary", message: 'Non-numeric value: "N/A"' },
  ],
  warnings: [
    { row: 12, field: "Reporting Manager", message: 'Manager not found: "Unknown User"' },
    { row: 256, field: "Department", message: 'New department will be created: "AI Research"' },
  ],
  validRows: 495,
  totalRows: 500,
};

interface ImportValidationProps {
  results?: typeof VALIDATION_RESULTS;
}

export default function ImportValidation({ results = VALIDATION_RESULTS }: ImportValidationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Validation Results</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg text-center">
          <AlertCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-rose-600">{results.errors.length}</div>
          <div className="text-xs text-rose-500">Errors</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-amber-600">{results.warnings.length}</div>
          <div className="text-xs text-amber-500">Warnings</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-emerald-600">{results.validRows}</div>
          <div className="text-xs text-emerald-500">Valid Rows</div>
        </div>
      </div>
      {results.errors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-rose-600 mb-2">Errors</h4>
          <div className="space-y-1">
            {results.errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg">
                <X className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                <span className="text-ink-black dark:text-pearl">
                  <span className="font-medium">Row {err.row}, {err.field}:</span> {err.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {results.warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-600 mb-2">Warnings</h4>
          <div className="space-y-1">
            {results.warnings.map((warn, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-ink-black dark:text-pearl">
                  <span className="font-medium">Row {warn.row}, {warn.field}:</span> {warn.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
