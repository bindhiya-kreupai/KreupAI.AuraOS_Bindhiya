"use client";

import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ImportProgressProps {
  progress: number;
  totalRows: number;
  validRows: number;
}

export default function ImportProgress({ progress, totalRows, validRows }: ImportProgressProps) {
  const isComplete = progress >= 100;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-ink-black dark:text-pearl">
        {isComplete ? "Import Complete!" : "Importing Data..."}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-black dark:text-pearl font-medium">
            {isComplete ? `Successfully imported ${validRows} records` : "Processing records..."}
          </span>
          <span className="text-celestial-indigo font-bold">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
          <div
            className="h-full bg-celestial-indigo rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-silver-mist">
          {isComplete ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-aurora-green" />
              <span>{validRows} of {totalRows} rows imported successfully</span>
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Importing {validRows} valid rows of {totalRows} total...</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
