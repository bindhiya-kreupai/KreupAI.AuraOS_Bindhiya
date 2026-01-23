"use client";

import React, { useState } from "react";
import { Grid3X3, Users } from "lucide-react";

export interface CalibrationCell {
  label: string;
  count: number;
  description: string;
}

export interface CalibrationMatrixData {
  cells: CalibrationCell[][];
}

const cellColors: string[][] = [
  [
    "bg-amber-50 dark:bg-amber-900/20",
    "bg-sky-50 dark:bg-sky-900/20",
    "bg-emerald-50 dark:bg-emerald-900/20",
  ],
  [
    "bg-orange-50 dark:bg-orange-900/20",
    "bg-slate-50 dark:bg-deep-cosmos",
    "bg-sky-50 dark:bg-sky-900/20",
  ],
  [
    "bg-red-50 dark:bg-red-900/20",
    "bg-orange-50 dark:bg-orange-900/20",
    "bg-amber-50 dark:bg-amber-900/20",
  ],
];

const mockMatrixData: CalibrationMatrixData = {
  cells: [
    [
      { label: "Enigma", count: 2, description: "High potential, low performance" },
      { label: "Growth Engine", count: 3, description: "High potential, moderate performance" },
      { label: "Star", count: 4, description: "High potential, high performance" },
    ],
    [
      { label: "Dilemma", count: 1, description: "Moderate potential, low performance" },
      { label: "Core Player", count: 5, description: "Moderate potential, moderate performance" },
      { label: "High Performer", count: 3, description: "Moderate potential, high performance" },
    ],
    [
      { label: "Underperformer", count: 1, description: "Low potential, low performance" },
      { label: "Effective", count: 2, description: "Low potential, moderate performance" },
      { label: "Trusted Pro", count: 2, description: "Low potential, high performance" },
    ],
  ],
};

const performanceLabels = ["Low", "Moderate", "High"];
const potentialLabels = ["High", "Moderate", "Low"];

export function CalibrationMatrix() {
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const totalEmployees = mockMatrixData.cells
    .flat()
    .reduce((sum, cell) => sum + cell.count, 0);

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Calibration Matrix
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-silver-mist">
          <Users className="w-4 h-4" />
          <span>
            <strong className="text-ink-black dark:text-pearl">{totalEmployees}</strong> employees
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Y-axis label */}
        <div className="flex flex-col items-center justify-center mr-3">
          <span
            className="text-xs font-semibold text-celestial-indigo whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            POTENTIAL
          </span>
        </div>

        <div className="flex-1">
          <div className="flex">
            {/* Y-axis tick labels */}
            <div className="flex flex-col justify-around mr-2 py-1">
              {potentialLabels.map((label) => (
                <span
                  key={label}
                  className="text-xs text-silver-mist font-medium h-28 flex items-center"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* 9-box grid */}
            <div className="flex-1 grid grid-rows-3 gap-2">
              {mockMatrixData.cells.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-3 gap-2">
                  {row.map((cell, colIdx) => {
                    const isSelected =
                      selectedCell?.row === rowIdx &&
                      selectedCell?.col === colIdx;
                    return (
                      <button
                        key={colIdx}
                        onClick={() =>
                          setSelectedCell(
                            isSelected ? null : { row: rowIdx, col: colIdx }
                          )
                        }
                        className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 min-h-[100px] transition-all ${
                          cellColors[rowIdx][colIdx]
                        } border-cloud dark:border-nebula-purple/50 ${
                          isSelected
                            ? "ring-2 ring-celestial-indigo ring-offset-2 dark:ring-offset-stellar-blue"
                            : "hover:shadow-md"
                        }`}
                      >
                        <span className="text-[10px] font-semibold text-ink-black/60 dark:text-pearl/60 mb-1 text-center">
                          {cell.label}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-stellar-blue border-2 border-cloud dark:border-nebula-purple/50 flex items-center justify-center">
                          <span className="text-lg font-bold text-celestial-indigo">
                            {cell.count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex mt-2 ml-16">
            {performanceLabels.map((label) => (
              <span
                key={label}
                className="flex-1 text-center text-xs text-silver-mist font-medium"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="text-center mt-1 ml-16">
            <span className="text-xs font-semibold text-celestial-indigo">
              PERFORMANCE
            </span>
          </div>
        </div>
      </div>

      {/* Selected cell detail */}
      {selectedCell && (
        <div className="mt-6 p-4 bg-slate-50 dark:bg-deep-cosmos rounded-lg border border-cloud dark:border-nebula-purple/50">
          <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
            {mockMatrixData.cells[selectedCell.row][selectedCell.col].label}
          </h4>
          <p className="text-xs text-silver-mist mb-2">
            {mockMatrixData.cells[selectedCell.row][selectedCell.col].description}
          </p>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-celestial-indigo" />
            <span className="text-sm text-ink-black dark:text-pearl font-medium">
              {mockMatrixData.cells[selectedCell.row][selectedCell.col].count} employees
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
