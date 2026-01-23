"use client";

import React from "react";
import {
  DollarSign,
  TrendingUp,
  Gift,
  Heart,
  PieChart,
  Download,
  Calendar,
} from "lucide-react";

interface CompensationComponent {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CompensationData {
  employeeName: string;
  employeeId: string;
  role: string;
  effectiveDate: string;
  totalCompensation: number;
  components: CompensationComponent[];
  yearOverYearChange: number;
}

const mockCompensation: CompensationData = {
  employeeName: "Alex Johnson",
  employeeId: "EMP-4521",
  role: "Senior Software Engineer",
  effectiveDate: "January 2026",
  totalCompensation: 245000,
  components: [
    { label: "Base Salary", amount: 165000, percentage: 67.3, color: "#4F46E5" },
    { label: "Annual Bonus", amount: 33000, percentage: 13.5, color: "#10B981" },
    { label: "Equity (RSU)", amount: 30000, percentage: 12.2, color: "#8B5CF6" },
    { label: "Benefits Value", amount: 17000, percentage: 6.9, color: "#F59E0B" },
  ],
  yearOverYearChange: 8.2,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function TotalCompensationStatement() {
  const data = mockCompensation;

  const generateConicGradient = () => {
    let accumulated = 0;
    const stops = data.components.map((comp) => {
      const start = accumulated;
      accumulated += comp.percentage;
      return `${comp.color} ${start}% ${accumulated}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  };

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Total Compensation Statement
            </h1>
            <p className="text-silver-mist mt-1">
              {data.employeeName} ({data.employeeId}) - {data.role}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 text-ink-black dark:text-pearl text-sm hover:bg-cloud dark:hover:bg-nebula-purple/20">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>

        {/* Summary Card */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6 mb-6 bg-gradient-to-br from-celestial-indigo/5 to-transparent">
          <div className="flex items-center gap-2 text-sm text-silver-mist mb-2">
            <Calendar className="w-4 h-4" />
            Effective: {data.effectiveDate}
          </div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.totalCompensation)}
            </h2>
            <div className="flex items-center gap-1 text-aurora-green text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +{data.yearOverYearChange}% YoY
            </div>
          </div>
          <p className="text-sm text-silver-mist mt-1">Total Annual Compensation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
            <h3 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-celestial-indigo" />
              Compensation Breakdown
            </h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <div
                  className="w-48 h-48 rounded-full"
                  style={{ background: generateConicGradient() }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-white dark:bg-stellar-blue flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs text-silver-mist">Total</p>
                      <p className="text-sm font-bold text-ink-black dark:text-pearl">
                        {formatCurrency(data.totalCompensation)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 mt-4">
              {data.components.map((comp) => (
                <div key={comp.label} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: comp.color }}
                  />
                  <span className="text-sm text-ink-black dark:text-pearl flex-1">
                    {comp.label}
                  </span>
                  <span className="text-sm text-silver-mist">
                    {comp.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Component Details */}
          <div className="space-y-4">
            {data.components.map((comp, index) => {
              const icons = [DollarSign, TrendingUp, Gift, Heart];
              const Icon = icons[index] || DollarSign;

              return (
                <div
                  key={comp.label}
                  className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${comp.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: comp.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">
                        {comp.label}
                      </p>
                      <p className="text-xs text-silver-mist">
                        {comp.percentage}% of total
                      </p>
                    </div>
                    <p className="text-lg font-bold text-ink-black dark:text-pearl">
                      {formatCurrency(comp.amount)}
                    </p>
                  </div>
                  <div className="mt-3 w-full h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/30">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${comp.percentage}%`,
                        backgroundColor: comp.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
