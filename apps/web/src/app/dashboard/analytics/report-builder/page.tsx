"use client";

import React, { useState } from 'react';
import {
  BarChart3, Table, PieChart, LineChart, Download,
  Plus, Filter, Columns, Eye, Save, Play
} from 'lucide-react';

const dataSources = ['Employees', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Recruitment', 'Benefits'];
const chartTypes = [
  { id: 'table', icon: Table, label: 'Table' },
  { id: 'bar', icon: BarChart3, label: 'Bar Chart' },
  { id: 'line', icon: LineChart, label: 'Line Chart' },
  { id: 'pie', icon: PieChart, label: 'Pie Chart' },
];

const availableColumns: Record<string, string[]> = {
  Employees: ['Name', 'Department', 'Designation', 'Location', 'Hire Date', 'Status', 'Manager', 'Salary Band'],
  Attendance: ['Employee', 'Date', 'Check In', 'Check Out', 'Hours Worked', 'Status', 'Overtime'],
  Leave: ['Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Approver'],
  Payroll: ['Employee', 'Month', 'Gross Salary', 'Deductions', 'Net Pay', 'Tax', 'Status'],
  Performance: ['Employee', 'Review Cycle', 'Self Rating', 'Manager Rating', 'Final Rating', 'Goals Met'],
  Recruitment: ['Position', 'Department', 'Applications', 'Shortlisted', 'Interviewed', 'Offered', 'Status'],
  Benefits: ['Employee', 'Plan', 'Coverage', 'Dependents', 'Premium', 'Status'],
};

export default function ReportBuilderPage() {
  const [selectedSource, setSelectedSource] = useState('Employees');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['Name', 'Department', 'Designation', 'Location']);
  const [selectedChart, setSelectedChart] = useState('table');
  const [filters, setFilters] = useState<{ field: string; operator: string; value: string }[]>([]);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const addFilter = () => {
    setFilters((prev) => [...prev, { field: selectedColumns[0] || '', operator: 'equals', value: '' }]);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Report Builder</h1>
          <p className="text-sm text-silver-mist mt-1">Create custom reports with drag-and-drop simplicity</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-silver-mist bg-slate-50 dark:bg-deep-cosmos rounded-lg hover:bg-slate-100 transition-colors">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-celestial-indigo rounded-lg hover:bg-celestial-indigo/90 transition-colors">
            <Play className="w-3.5 h-3.5" /> Run Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Configuration */}
        <div className="space-y-4">
          {/* Data Source */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-xs font-bold text-ink-black dark:text-pearl uppercase mb-3">Data Source</h3>
            <div className="space-y-1">
              {dataSources.map((source) => (
                <button
                  key={source}
                  onClick={() => { setSelectedSource(source); setSelectedColumns([]); }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                    selectedSource === source
                      ? 'bg-celestial-indigo/10 text-celestial-indigo font-medium'
                      : 'text-silver-mist hover:bg-slate-50 dark:hover:bg-deep-cosmos'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-xs font-bold text-ink-black dark:text-pearl uppercase mb-3 flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5" /> Columns
            </h3>
            <div className="space-y-1">
              {(availableColumns[selectedSource] || []).map((col) => (
                <label key={col} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-deep-cosmos cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col)}
                    onChange={() => toggleColumn(col)}
                    className="rounded border-slate-300 text-celestial-indigo focus:ring-celestial-indigo/20"
                  />
                  <span className="text-xs text-ink-black dark:text-pearl">{col}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Chart Type */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <h3 className="text-xs font-bold text-ink-black dark:text-pearl uppercase mb-3">Visualization</h3>
            <div className="grid grid-cols-2 gap-2">
              {chartTypes.map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-lg text-xs transition-colors ${
                    selectedChart === chart.id
                      ? 'bg-celestial-indigo/10 text-celestial-indigo border border-celestial-indigo/30'
                      : 'text-silver-mist hover:bg-slate-50 dark:hover:bg-deep-cosmos border border-transparent'
                  }`}
                >
                  <chart.icon className="w-4 h-4" />
                  {chart.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main - Preview */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-ink-black dark:text-pearl uppercase flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filters
              </h3>
              <button onClick={addFilter} className="text-xs text-celestial-indigo font-medium flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Add Filter
              </button>
            </div>
            {filters.length === 0 ? (
              <p className="text-xs text-silver-mist">No filters applied. Click "Add Filter" to narrow results.</p>
            ) : (
              <div className="space-y-2">
                {filters.map((filter, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <select className="text-xs bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded px-2 py-1.5">
                      {selectedColumns.map((col) => <option key={col}>{col}</option>)}
                    </select>
                    <select className="text-xs bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded px-2 py-1.5">
                      <option>equals</option>
                      <option>contains</option>
                      <option>starts with</option>
                      <option>greater than</option>
                      <option>less than</option>
                    </select>
                    <input type="text" placeholder="Value" className="text-xs bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded px-2 py-1.5 flex-1" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Preview */}
          <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                <Eye className="w-4 h-4 text-celestial-indigo" /> Preview
              </h3>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-silver-mist hover:text-celestial-indigo bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
            <div className="p-4">
              {selectedColumns.length === 0 ? (
                <div className="text-center py-12">
                  <Columns className="w-8 h-8 text-silver-mist mx-auto mb-2" />
                  <p className="text-sm text-silver-mist">Select columns to preview your report</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-cloud dark:border-nebula-purple/50">
                        {selectedColumns.map((col) => (
                          <th key={col} className="text-left px-3 py-2 font-medium text-silver-mist uppercase">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-cloud dark:border-nebula-purple/50">
                        {selectedColumns.map((col) => (
                          <td key={col} className="px-3 py-2.5 text-ink-black dark:text-pearl">
                            <span className="bg-slate-100 dark:bg-deep-cosmos px-2 py-0.5 rounded text-silver-mist italic">Sample data</span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-cloud dark:border-nebula-purple/50">
                        {selectedColumns.map((col) => (
                          <td key={col} className="px-3 py-2.5 text-ink-black dark:text-pearl">
                            <span className="bg-slate-100 dark:bg-deep-cosmos px-2 py-0.5 rounded text-silver-mist italic">Sample data</span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-center text-[10px] text-silver-mist mt-3">Run report to see actual data</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
