/**
 * @module AnalyticsDashboard
 * @description Configurable analytics dashboard — widget grid, date filter,
 *              department filter, add/remove widgets, full-screen expand (Sec 23.1)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState } from 'react';
import {
  BarChart2,
  Users,
  RefreshCw,
  Plus,
  X,
  Maximize2,
  Minimize2,
  Filter,
  Calendar,
  Download,
} from 'lucide-react';
import {
  LineChart,
  BarChart,
  DonutChart,
  HeatmapChart,
  FunnelChart,
  KPICard,
} from './PeopleAnalyticsCharts';

// ── Types ─────────────────────────────────────────────────────────────────────

type WidgetType = 'kpi' | 'line' | 'bar' | 'donut' | 'heatmap' | 'funnel';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  span?: 1 | 2; // column span (1 = half, 2 = full)
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const HEADCOUNT_TREND_SERIES = [
  {
    name: 'Total',
    color: '#3b82f6',
    data: [240, 248, 255, 261, 268, 272, 278, 280, 282, 285, 287, 290],
  },
  {
    name: 'New Hires',
    color: '#10b981',
    data: [12, 10, 9, 8, 10, 6, 8, 5, 4, 5, 4, 6],
  },
];
const MONTH_LABELS = [
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
];

const TURNOVER_SERIES = [
  {
    name: 'Voluntary',
    color: '#f59e0b',
    data: [2.1, 2.8, 2.4, 3.1, 2.7, 2.3, 2.9, 2.6, 2.2, 2.8, 3.0, 2.5],
  },
  {
    name: 'Involuntary',
    color: '#ef4444',
    data: [0.5, 0.4, 0.6, 0.5, 0.4, 0.7, 0.5, 0.4, 0.6, 0.5, 0.4, 0.5],
  },
];

const GENDER_DATA = [
  { label: 'Male', value: 158, color: '#3b82f6' },
  { label: 'Female', value: 112, color: '#ec4899' },
  { label: 'Non-binary', value: 10, color: '#8b5cf6' },
  { label: 'Not specified', value: 5, color: '#94a3b8' },
];

const DEPT_HEADCOUNT = [
  { label: 'Engineering', value: 68 },
  { label: 'Sales', value: 45 },
  { label: 'Operations', value: 38 },
  { label: 'Marketing', value: 28 },
  { label: 'Product', value: 22 },
  { label: 'HR', value: 18 },
  { label: 'Finance', value: 16 },
  { label: 'Legal', value: 8 },
];

// Absence heatmap: 5 days x 12 weeks (absence rate %)
const ABSENCE_HEATMAP: number[][] = [
  [2.1, 1.8, 2.3, 1.9, 2.5, 2.1, 1.7, 2.4, 2.0, 1.8, 2.2, 2.6],
  [1.5, 1.9, 1.6, 2.0, 1.8, 1.4, 1.9, 1.7, 1.5, 1.8, 2.0, 1.6],
  [1.8, 2.1, 1.7, 1.9, 2.2, 1.8, 2.0, 1.6, 1.9, 2.1, 1.7, 1.9],
  [2.4, 2.0, 2.6, 2.2, 2.8, 2.3, 2.1, 2.7, 2.3, 2.0, 2.5, 2.9],
  [3.1, 2.8, 3.4, 2.9, 3.6, 3.0, 2.7, 3.3, 2.8, 2.6, 3.1, 3.5],
];
const WEEK_LABELS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];

const RECRUITMENT_FUNNEL = [
  { label: 'Applied', value: 1240, color: '#8b5cf6' },
  { label: 'Screened', value: 620, color: '#6d28d9' },
  { label: 'Interviewed', value: 186, color: '#5b21b6' },
  { label: 'Offered', value: 52, color: '#4c1d95' },
  { label: 'Hired', value: 40, color: '#3b0764' },
];

// ── Widget Library ─────────────────────────────────────────────────────────────

const WIDGET_LIBRARY: Widget[] = [
  {
    id: 'headcount-kpi',
    type: 'kpi',
    title: 'Total Headcount',
    description: 'Current total employees',
  },
  {
    id: 'turnover-kpi',
    type: 'kpi',
    title: 'Turnover Rate',
    description: 'Monthly voluntary + involuntary',
  },
  {
    id: 'avg-tenure-kpi',
    type: 'kpi',
    title: 'Avg. Tenure',
    description: 'Average employee tenure',
  },
  { id: 'absence-kpi', type: 'kpi', title: 'Absence Rate', description: 'Current month absence %' },
  {
    id: 'headcount-trend',
    type: 'line',
    title: 'Headcount Trend',
    description: '12-month headcount & hiring',
    span: 2,
  },
  {
    id: 'turnover-trend',
    type: 'line',
    title: 'Turnover Rate Trend',
    description: 'Voluntary vs involuntary',
    span: 2,
  },
  {
    id: 'gender-ratio',
    type: 'donut',
    title: 'Gender Distribution',
    description: 'Workforce gender breakdown',
  },
  {
    id: 'dept-headcount',
    type: 'bar',
    title: 'Headcount by Department',
    description: 'Employees per department',
  },
  {
    id: 'absence-heatmap',
    type: 'heatmap',
    title: 'Absence Pattern',
    description: 'Absence rate by day & week',
    span: 2,
  },
  {
    id: 'recruitment-funnel',
    type: 'funnel',
    title: 'Recruitment Funnel',
    description: 'Applicant-to-hire pipeline',
  },
];

const DEFAULT_WIDGET_IDS = [
  'headcount-kpi',
  'turnover-kpi',
  'avg-tenure-kpi',
  'absence-kpi',
  'headcount-trend',
  'gender-ratio',
  'dept-headcount',
  'absence-heatmap',
];

// ── Widget Renderer ───────────────────────────────────────────────────────────

function WidgetContent({ widget }: { widget: Widget }) {
  switch (widget.id) {
    case 'headcount-kpi':
      return (
        <KPICard
          title="Total Headcount"
          value="285"
          subtitle="Active employees"
          trend={1.8}
          trendLabel="vs last month"
          color="#3b82f6"
        />
      );
    case 'turnover-kpi':
      return (
        <KPICard
          title="Turnover Rate"
          value="2.5%"
          subtitle="This month"
          trend={-0.3}
          trendLabel="vs last month"
          color="#f59e0b"
        />
      );
    case 'avg-tenure-kpi':
      return (
        <KPICard
          title="Avg. Tenure"
          value="2.8 yrs"
          subtitle="All employees"
          trend={0.2}
          trendLabel="vs last year"
          color="#10b981"
        />
      );
    case 'absence-kpi':
      return (
        <KPICard
          title="Absence Rate"
          value="2.1%"
          subtitle="This month"
          trend={-0.4}
          trendLabel="vs last month"
          color="#8b5cf6"
        />
      );
    case 'headcount-trend':
      return (
        <LineChart
          series={HEADCOUNT_TREND_SERIES}
          labels={MONTH_LABELS}
          height={200}
          title="Headcount Trend"
        />
      );
    case 'turnover-trend':
      return (
        <LineChart
          series={TURNOVER_SERIES}
          labels={MONTH_LABELS}
          height={200}
          title="Turnover Rate (%)"
          yLabel="%"
        />
      );
    case 'gender-ratio':
      return (
        <DonutChart
          data={GENDER_DATA}
          size={150}
          centerLabel="285"
          centerSubLabel="Employees"
          title="Gender Distribution"
        />
      );
    case 'dept-headcount':
      return (
        <BarChart data={DEPT_HEADCOUNT} height={180} color="#3b82f6" title="Department Headcount" />
      );
    case 'absence-heatmap':
      return (
        <HeatmapChart
          data={ABSENCE_HEATMAP}
          rowLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
          colLabels={WEEK_LABELS}
          title="Absence Rate by Day (%)"
          height={120}
        />
      );
    case 'recruitment-funnel':
      return <FunnelChart stages={RECRUITMENT_FUNNEL} title="Recruitment Funnel" height={200} />;
    default:
      return <div className="text-slate-400 text-sm text-center py-8">Widget content</div>;
  }
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  isAdmin?: boolean;
}

export default function AnalyticsDashboard({ isAdmin: _isAdmin = false }: AnalyticsDashboardProps) {
  const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(DEFAULT_WIDGET_IDS);
  const [expandedWidgetId, setExpandedWidgetId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [dateRange, setDateRange] = useState('last_12_months');
  const [department, setDepartment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const activeWidgets = activeWidgetIds
    .map((id) => WIDGET_LIBRARY.find((w) => w.id === id))
    .filter(Boolean) as Widget[];

  const availableWidgets = WIDGET_LIBRARY.filter((w) => !activeWidgetIds.includes(w.id));

  const removeWidget = (id: string) =>
    setActiveWidgetIds((prev) => prev.filter((wid) => wid !== id));
  const addWidget = (id: string) => {
    setActiveWidgetIds((prev) => [...prev, id]);
    setShowLibrary(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const expandedWidget = expandedWidgetId
    ? WIDGET_LIBRARY.find((w) => w.id === expandedWidgetId)
    : null;

  // KPI widgets in first row, chart widgets in grid
  const kpiWidgets = activeWidgets.filter((w) => w.type === 'kpi');
  const chartWidgets = activeWidgets.filter((w) => w.type !== 'kpi');

  return (
    <>
      {/* Full-screen widget modal */}
      {expandedWidget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">{expandedWidget.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{expandedWidget.description}</p>
              </div>
              <button
                onClick={() => setExpandedWidgetId(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <WidgetContent widget={expandedWidget} />
            </div>
          </div>
        </div>
      )}

      {/* Widget library modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Add Widget</h2>
              <button
                onClick={() => setShowLibrary(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {availableWidgets.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">
                  All widgets are already on your dashboard
                </p>
              ) : (
                availableWidgets.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-800">{w.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{w.description}</p>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-1 inline-block capitalize">
                        {w.type}
                      </span>
                    </div>
                    <button
                      onClick={() => addWidget(w.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              People analytics &amp; workforce insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className={`p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Widget
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Global filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border-0 bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="last_30_days">Last 30 days</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="text-sm border-0 bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
              <option value="operations">Operations</option>
            </select>
          </div>
        </div>

        {/* KPI row */}
        {kpiWidgets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpiWidgets.map((widget) => (
              <div key={widget.id} className="relative group">
                <WidgetContent widget={widget} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => setExpandedWidgetId(widget.id)}
                    className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500 hover:text-slate-700"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart widget grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chartWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`bg-white border border-slate-200 rounded-xl p-4 relative group ${
                widget.span === 2 ? 'lg:col-span-2' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">{widget.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{widget.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setExpandedWidgetId(widget.id)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <WidgetContent widget={widget} />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {activeWidgets.length === 0 && (
          <div className="py-20 text-center">
            <BarChart2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium mb-2">No widgets on your dashboard</p>
            <p className="text-slate-400 text-sm mb-4">
              Add widgets from the library to build your custom view
            </p>
            <button
              onClick={() => setShowLibrary(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Widgets
            </button>
          </div>
        )}
      </div>
    </>
  );
}
