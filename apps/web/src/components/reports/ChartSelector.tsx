"use client";

import React, { useState } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Table,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";

type ChartType = "table" | "bar" | "line" | "pie" | "area" | "scatter";

interface ChartOption {
  id: ChartType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ChartSelectorProps {
  selectedChart?: ChartType;
  onChange?: (chart: ChartType) => void;
}

const chartOptions: ChartOption[] = [
  {
    id: "table",
    name: "Table",
    description: "Display data in rows and columns",
    icon: <Table className="w-6 h-6" />,
  },
  {
    id: "bar",
    name: "Bar Chart",
    description: "Compare values across categories",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    id: "line",
    name: "Line Chart",
    description: "Show trends over time",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: "pie",
    name: "Pie Chart",
    description: "Show proportions of a whole",
    icon: <PieChart className="w-6 h-6" />,
  },
  {
    id: "area",
    name: "Area Chart",
    description: "Visualize volume over time",
    icon: <TrendingUp className="w-6 h-6" />,
  },
  {
    id: "scatter",
    name: "Scatter Plot",
    description: "Show correlation between variables",
    icon: <LayoutGrid className="w-6 h-6" />,
  },
];

export function ChartSelector({ selectedChart, onChange }: ChartSelectorProps) {
  const [selected, setSelected] = useState<ChartType>(selectedChart || "table");

  const handleSelect = (chart: ChartType) => {
    setSelected(chart);
    onChange?.(chart);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
          Visualization Type
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {chartOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`relative p-4 rounded-lg border text-center transition-colors ${
              selected === option.id
                ? "border-celestial-indigo bg-celestial-indigo/5"
                : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30"
            }`}
          >
            {selected === option.id && (
              <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-celestial-indigo" />
            )}
            <div className={`mx-auto mb-2 ${
              selected === option.id ? "text-celestial-indigo" : "text-silver-mist"
            }`}>
              {option.icon}
            </div>
            <p className="text-sm font-medium text-ink-black dark:text-pearl">
              {option.name}
            </p>
            <p className="text-xs text-silver-mist mt-0.5">
              {option.description}
            </p>
          </button>
        ))}
      </div>

      {/* Chart Configuration */}
      {selected !== "table" && (
        <div className="p-4 rounded-lg border border-cloud dark:border-nebula-purple/50">
          <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-3 uppercase tracking-wide">
            Chart Settings
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-silver-mist block mb-1">X-Axis</label>
              <select className="w-full px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
                <option>Department</option>
                <option>Position</option>
                <option>Location</option>
                <option>Hire Date</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-silver-mist block mb-1">Y-Axis</label>
              <select className="w-full px-3 py-1.5 text-sm rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
                <option>Count</option>
                <option>Salary (Avg)</option>
                <option>Salary (Sum)</option>
                <option>Hours (Avg)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
