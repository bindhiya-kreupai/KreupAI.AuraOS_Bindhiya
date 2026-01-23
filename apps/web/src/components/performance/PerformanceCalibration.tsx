"use client";

import React, { useState } from "react";
import { Grid3X3, Filter, Users } from "lucide-react";

interface EmployeePosition {
  id: string;
  name: string;
  role: string;
  avatar: string;
  performance: number;
  potential: number;
}

const mockEmployees: EmployeePosition[] = [
  { id: "1", name: "Alice Chen", role: "Sr. Engineer", avatar: "AC", performance: 3, potential: 3 },
  { id: "2", name: "Marcus Johnson", role: "PM", avatar: "MJ", performance: 2, potential: 3 },
  { id: "3", name: "Sarah Williams", role: "Designer", avatar: "SW", performance: 3, potential: 2 },
  { id: "4", name: "Elena Rodriguez", role: "Tech Lead", avatar: "ER", performance: 3, potential: 3 },
  { id: "5", name: "David Park", role: "Engineer", avatar: "DP", performance: 2, potential: 2 },
  { id: "6", name: "Priya Sharma", role: "QA Lead", avatar: "PS", performance: 1, potential: 3 },
  { id: "7", name: "James Wilson", role: "Analyst", avatar: "JW", performance: 1, potential: 2 },
  { id: "8", name: "Lisa Chang", role: "DevOps", avatar: "LC", performance: 2, potential: 1 },
  { id: "9", name: "Robert Kim", role: "Jr. Engineer", avatar: "RK", performance: 1, potential: 1 },
  { id: "10", name: "Maria Garcia", role: "Sr. PM", avatar: "MG", performance: 3, potential: 2 },
  { id: "11", name: "Tom Baker", role: "Engineer", avatar: "TB", performance: 2, potential: 2 },
  { id: "12", name: "Nina Patel", role: "Designer", avatar: "NP", performance: 1, potential: 2 },
];

interface CellConfig {
  label: string;
  description: string;
  colorClass: string;
}

const gridCells: CellConfig[][] = [
  [
    {
      label: "Enigma",
      description: "High potential, developing performance",
      colorClass: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30",
    },
    {
      label: "Growth Engine",
      description: "High potential, solid performance",
      colorClass: "bg-celestial-indigo/5 border-celestial-indigo/20",
    },
    {
      label: "Star",
      description: "High potential, exceptional performance",
      colorClass: "bg-aurora-green/5 border-aurora-green/20",
    },
  ],
  [
    {
      label: "Up or Out",
      description: "Moderate potential, low performance",
      colorClass: "bg-coral-alert/5 border-coral-alert/20",
    },
    {
      label: "Core Player",
      description: "Moderate potential, solid performance",
      colorClass: "bg-gray-50 dark:bg-nebula-purple/10 border-gray-200 dark:border-nebula-purple/30",
    },
    {
      label: "High Performer",
      description: "Moderate potential, high performance",
      colorClass: "bg-celestial-indigo/5 border-celestial-indigo/20",
    },
  ],
  [
    {
      label: "Underperformer",
      description: "Limited potential, low performance",
      colorClass: "bg-coral-alert/10 border-coral-alert/30",
    },
    {
      label: "Effective",
      description: "Limited potential, solid performance",
      colorClass: "bg-gray-50 dark:bg-nebula-purple/10 border-gray-200 dark:border-nebula-purple/30",
    },
    {
      label: "Trusted Professional",
      description: "Limited potential, high performance",
      colorClass: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30",
    },
  ],
];

export default function PerformanceCalibration() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [department, setDepartment] = useState("all");

  const getEmployeesInCell = (row: number, col: number) => {
    const potential = 3 - row;
    const performance = col + 1;
    return mockEmployees.filter(
      (e) => e.performance === performance && e.potential === potential
    );
  };

  const performanceLabels = ["Low", "Moderate", "High"];
  const potentialLabels = ["High", "Moderate", "Low"];

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Performance Calibration (9-Box Grid)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-silver-mist" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg px-3 py-1.5 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
          >
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="product">Product</option>
            <option value="design">Design</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-silver-mist" />
          <span className="text-silver-mist">
            Total: <strong className="text-ink-black dark:text-pearl">{mockEmployees.length}</strong> employees
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-aurora-green" />
          <span className="text-silver-mist">
            Stars: <strong className="text-ink-black dark:text-pearl">{getEmployeesInCell(0, 2).length}</strong>
          </span>
        </div>
      </div>

      {/* Grid */}
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
          {/* Y-axis labels per row */}
          <div className="flex">
            <div className="flex flex-col justify-around mr-2 py-1">
              {potentialLabels.map((label) => (
                <span key={label} className="text-xs text-silver-mist font-medium h-32 flex items-center">
                  {label}
                </span>
              ))}
            </div>

            {/* Grid cells */}
            <div className="flex-1 grid grid-rows-3 gap-2">
              {gridCells.map((row, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-3 gap-2">
                  {row.map((cell, colIdx) => {
                    const employees = getEmployeesInCell(rowIdx, colIdx);
                    const isSelected =
                      selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                    return (
                      <button
                        key={colIdx}
                        onClick={() =>
                          setSelectedCell(
                            isSelected ? null : { row: rowIdx, col: colIdx }
                          )
                        }
                        className={`relative p-3 rounded-lg border-2 min-h-[120px] transition-all ${
                          cell.colorClass
                        } ${
                          isSelected
                            ? "ring-2 ring-celestial-indigo ring-offset-2 dark:ring-offset-stellar-blue"
                            : "hover:shadow-md"
                        }`}
                      >
                        <span className="text-[10px] font-semibold text-ink-black/60 dark:text-pearl/60 block mb-2">
                          {cell.label}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {employees.map((emp) => (
                            <div
                              key={emp.id}
                              className="w-8 h-8 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-[10px] font-bold text-celestial-indigo border-2 border-white dark:border-stellar-blue"
                              title={`${emp.name} - ${emp.role}`}
                            >
                              {emp.avatar}
                            </div>
                          ))}
                        </div>
                        {employees.length > 0 && (
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold text-silver-mist">
                            {employees.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex mt-2 ml-12">
            {performanceLabels.map((label) => (
              <span key={label} className="flex-1 text-center text-xs text-silver-mist font-medium">
                {label}
              </span>
            ))}
          </div>
          <div className="text-center mt-1 ml-12">
            <span className="text-xs font-semibold text-celestial-indigo">PERFORMANCE</span>
          </div>
        </div>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-nebula-purple/10 rounded-lg border border-cloud dark:border-nebula-purple/30">
          <h4 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
            {gridCells[selectedCell.row][selectedCell.col].label}
          </h4>
          <p className="text-xs text-silver-mist mb-3">
            {gridCells[selectedCell.row][selectedCell.col].description}
          </p>
          <div className="space-y-2">
            {getEmployeesInCell(selectedCell.row, selectedCell.col).map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-celestial-indigo/10 flex items-center justify-center text-xs font-semibold text-celestial-indigo">
                  {emp.avatar}
                </div>
                <div>
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">
                    {emp.name}
                  </span>
                  <span className="text-xs text-silver-mist ml-2">{emp.role}</span>
                </div>
              </div>
            ))}
            {getEmployeesInCell(selectedCell.row, selectedCell.col).length === 0 && (
              <p className="text-xs text-silver-mist italic">No employees in this quadrant</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
