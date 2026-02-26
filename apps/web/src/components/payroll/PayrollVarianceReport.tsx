'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Search,
  Users,
  ChevronUp,
  ChevronDown,
  Minus,
  UserPlus,
  UserMinus,
  RefreshCw,
  BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VarianceCategory =
  | 'NEW_JOINER'
  | 'SALARY_REVISION'
  | 'OVERTIME'
  | 'LOP'
  | 'DEDUCTION_CHANGE'
  | 'TERMINATION'
  | 'ARREARS'
  | 'NO_CHANGE';

interface EmployeeVariance {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  currentGross: number;
  previousGross: number;
  varianceAmount: number;
  variancePercent: number;
  varianceCategory: VarianceCategory;
  notes: string;
}

interface DepartmentVariance {
  department: string;
  headcount: number;
  prevHeadcount: number;
  currentTotal: number;
  previousTotal: number;
  varianceAmount: number;
  variancePercent: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_EMPLOYEE_VARIANCES: EmployeeVariance[] = [
  {
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'Senior Engineer',
    currentGross: 122769,
    previousGross: 102308,
    varianceAmount: 20461,
    variancePercent: 19.99,
    varianceCategory: 'SALARY_REVISION',
    notes: 'Annual appraisal — 20% increment effective Feb 1',
  },
  {
    employeeId: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Rahul Mehta',
    department: 'Engineering',
    designation: 'Tech Lead',
    currentGross: 180000,
    previousGross: 180000,
    varianceAmount: 0,
    variancePercent: 0,
    varianceCategory: 'NO_CHANGE',
    notes: '',
  },
  {
    employeeId: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    department: 'Product',
    designation: 'Product Manager',
    currentGross: 152500,
    previousGross: 142500,
    varianceAmount: 10000,
    variancePercent: 7.02,
    varianceCategory: 'OVERTIME',
    notes: '20 hours overtime in Feb',
  },
  {
    employeeId: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    department: 'Engineering',
    designation: 'Junior Engineer',
    currentGross: 0,
    previousGross: 50000,
    varianceAmount: -50000,
    variancePercent: -100,
    varianceCategory: 'TERMINATION',
    notes: 'Resigned — last working day Feb 15',
  },
  {
    employeeId: 'emp-005',
    employeeCode: 'EMP005',
    employeeName: 'Kavita Singh',
    department: 'HR',
    designation: 'HR Manager',
    currentGross: 91250,
    previousGross: 100000,
    varianceAmount: -8750,
    variancePercent: -8.75,
    varianceCategory: 'LOP',
    notes: '2.5 days LOP in Feb',
  },
  {
    employeeId: 'emp-006',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    department: 'Sales',
    designation: 'Sales Manager',
    currentGross: 200000,
    previousGross: 200000,
    varianceAmount: 0,
    variancePercent: 0,
    varianceCategory: 'NO_CHANGE',
    notes: '',
  },
  {
    employeeId: 'emp-007',
    employeeCode: 'EMP007',
    employeeName: 'Nisha Verma',
    department: 'Engineering',
    designation: 'QA Engineer',
    currentGross: 75000,
    previousGross: 0,
    varianceAmount: 75000,
    variancePercent: 100,
    varianceCategory: 'NEW_JOINER',
    notes: 'Joined Feb 1, 2026',
  },
  {
    employeeId: 'emp-008',
    employeeCode: 'EMP008',
    employeeName: 'David Chen',
    department: 'Engineering',
    designation: 'Backend Engineer',
    currentGross: 130000,
    previousGross: 140000,
    varianceAmount: -10000,
    variancePercent: -7.14,
    varianceCategory: 'DEDUCTION_CHANGE',
    notes: 'Additional loan EMI started Feb',
  },
  {
    employeeId: 'emp-009',
    employeeCode: 'EMP009',
    employeeName: 'Meera Pillai',
    department: 'Finance',
    designation: 'Finance Analyst',
    currentGross: 98000,
    previousGross: 75000,
    varianceAmount: 23000,
    variancePercent: 30.67,
    varianceCategory: 'ARREARS',
    notes: 'Nov-Jan arrears paid in Feb',
  },
];

const MOCK_DEPT_VARIANCES: DepartmentVariance[] = [
  {
    department: 'Engineering',
    headcount: 82,
    prevHeadcount: 81,
    currentTotal: 9840000,
    previousTotal: 9635000,
    varianceAmount: 205000,
    variancePercent: 2.13,
  },
  {
    department: 'Sales',
    headcount: 55,
    prevHeadcount: 55,
    currentTotal: 4125000,
    previousTotal: 4042500,
    varianceAmount: 82500,
    variancePercent: 2.04,
  },
  {
    department: 'Product',
    headcount: 20,
    prevHeadcount: 20,
    currentTotal: 1900000,
    previousTotal: 1854000,
    varianceAmount: 46000,
    variancePercent: 2.48,
  },
  {
    department: 'Finance',
    headcount: 22,
    prevHeadcount: 21,
    currentTotal: 1980000,
    previousTotal: 1940000,
    varianceAmount: 40000,
    variancePercent: 2.06,
  },
  {
    department: 'HR',
    headcount: 18,
    prevHeadcount: 18,
    currentTotal: 1440000,
    previousTotal: 1440000,
    varianceAmount: 0,
    variancePercent: 0,
  },
  {
    department: 'Operations',
    headcount: 50,
    prevHeadcount: 48,
    currentTotal: 1255000,
    previousTotal: 1168000,
    varianceAmount: 87000,
    variancePercent: 7.45,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG: Record<
  VarianceCategory,
  { label: string; color: string; icon: React.ReactNode }
> = {
  NEW_JOINER: {
    label: 'New Joiner',
    color: 'bg-blue-100 text-blue-700',
    icon: <UserPlus className="w-3 h-3" />,
  },
  SALARY_REVISION: {
    label: 'Salary Revision',
    color: 'bg-green-100 text-green-700',
    icon: <TrendingUp className="w-3 h-3" />,
  },
  OVERTIME: {
    label: 'Overtime',
    color: 'bg-purple-100 text-purple-700',
    icon: <TrendingUp className="w-3 h-3" />,
  },
  LOP: {
    label: 'Loss of Pay',
    color: 'bg-orange-100 text-orange-700',
    icon: <TrendingDown className="w-3 h-3" />,
  },
  DEDUCTION_CHANGE: {
    label: 'Deduction Change',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Minus className="w-3 h-3" />,
  },
  TERMINATION: {
    label: 'Termination',
    color: 'bg-red-100 text-red-700',
    icon: <UserMinus className="w-3 h-3" />,
  },
  ARREARS: {
    label: 'Arrears',
    color: 'bg-indigo-100 text-indigo-700',
    icon: <RefreshCw className="w-3 h-3" />,
  },
  NO_CHANGE: {
    label: 'No Change',
    color: 'bg-gray-100 text-gray-500',
    icon: <Minus className="w-3 h-3" />,
  },
};

function fmt(n: number): string {
  if (n === 0) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(n));
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PayrollVarianceReport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<VarianceCategory | 'ALL'>('ALL');
  const [filterDept, setFilterDept] = useState('ALL');
  const [showHighVarianceOnly, setShowHighVarianceOnly] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'variancePercent' | 'varianceAmount'>(
    'variancePercent'
  );
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPeriod] = useState('2026-02');
  const [prevPeriod] = useState('2026-01');

  const departments = [
    'ALL',
    ...Array.from(new Set(MOCK_EMPLOYEE_VARIANCES.map((e) => e.department))),
  ];

  const filtered = useMemo(() => {
    let data = [...MOCK_EMPLOYEE_VARIANCES];
    if (searchQuery) {
      data = data.filter(
        (e) =>
          e.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterCategory !== 'ALL') data = data.filter((e) => e.varianceCategory === filterCategory);
    if (filterDept !== 'ALL') data = data.filter((e) => e.department === filterDept);
    if (showHighVarianceOnly) data = data.filter((e) => Math.abs(e.variancePercent) >= 5);

    data.sort((a, b) => {
      let diff = 0;
      if (sortField === 'name') diff = a.employeeName.localeCompare(b.employeeName);
      else if (sortField === 'variancePercent')
        diff = Math.abs(b.variancePercent) - Math.abs(a.variancePercent);
      else diff = Math.abs(b.varianceAmount) - Math.abs(a.varianceAmount);
      return sortAsc ? -diff : diff;
    });

    return data;
  }, [searchQuery, filterCategory, filterDept, showHighVarianceOnly, sortField, sortAsc]);

  const currentTotal = MOCK_EMPLOYEE_VARIANCES.reduce((s, e) => s + e.currentGross, 0);
  const previousTotal = MOCK_EMPLOYEE_VARIANCES.reduce((s, e) => s + e.previousGross, 0);
  const totalVariance = currentTotal - previousTotal;
  const totalVariancePct = previousTotal > 0 ? (totalVariance / previousTotal) * 100 : 0;

  const higherCount = filtered.filter((e) => e.variancePercent >= 5).length;
  const lowerCount = filtered.filter((e) => e.variancePercent <= -5).length;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc((a) => !a);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll Variance Report</h1>
            <p className="text-sm text-gray-500 mt-1">
              Month-over-month comparison: <span className="font-medium">{prevPeriod}</span>
              <span className="mx-2">→</span>
              <span className="font-medium">{currentPeriod}</span>
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:border-gray-300 transition-colors">
            <Download className="w-4 h-4 text-gray-500" /> Export Excel
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Current Period Total',
              value: fmt(currentTotal),
              sub: currentPeriod,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50',
            },
            {
              label: 'Previous Period Total',
              value: fmt(previousTotal),
              sub: prevPeriod,
              color: 'text-gray-600',
              bg: 'bg-gray-50',
            },
            {
              label: 'Total Variance',
              value: `${totalVariance >= 0 ? '+' : ''}${fmt(totalVariance)}`,
              sub: `${totalVariancePct >= 0 ? '+' : ''}${totalVariancePct.toFixed(2)}%`,
              color: totalVariance >= 0 ? 'text-green-600' : 'text-red-600',
              bg: totalVariance >= 0 ? 'bg-green-50' : 'bg-red-50',
            },
            {
              label: 'High Variance Employees',
              value: `${higherCount + lowerCount}`,
              sub: `${higherCount} higher, ${lowerCount} lower`,
              color: 'text-yellow-600',
              bg: 'bg-yellow-50',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
            >
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Department Summary */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Department Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                    Department
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                    Headcount
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                    Current
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                    Previous
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                    Variance
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">%</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DEPT_VARIANCES.map((dept) => (
                  <tr key={dept.department} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      {dept.department}
                      {dept.headcount !== dept.prevHeadcount && (
                        <span
                          className={`ml-2 text-xs px-1.5 py-0.5 rounded ${dept.headcount > dept.prevHeadcount ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {dept.headcount > dept.prevHeadcount
                            ? `+${dept.headcount - dept.prevHeadcount}`
                            : dept.headcount - dept.prevHeadcount}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{dept.headcount}</td>
                    <td className="px-4 py-2.5 text-right text-gray-800">
                      {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(
                        dept.currentTotal
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500">
                      {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(
                        dept.previousTotal
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={dept.varianceAmount >= 0 ? 'text-green-600' : 'text-red-600'}
                      >
                        {dept.varianceAmount >= 0 ? '+' : ''}
                        {new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(
                          dept.varianceAmount
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          Math.abs(dept.variancePercent) > 10
                            ? dept.variancePercent > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            : dept.variancePercent > 0
                              ? 'bg-green-100 text-green-700'
                              : dept.variancePercent < 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {dept.variancePercent >= 0 ? '+' : ''}
                        {dept.variancePercent.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as VarianceCategory | 'ALL')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {(Object.keys(CATEGORY_CONFIG) as VarianceCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_CONFIG[cat].label}
              </option>
            ))}
          </select>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-lg px-3 py-2">
            <input
              type="checkbox"
              checked={showHighVarianceOnly}
              onChange={(e) => setShowHighVarianceOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">High variance only (&gt;5%)</span>
          </label>
        </div>

        {/* Employee Variance Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-800">Employee-level Variances</h3>
              <span className="text-xs text-gray-500">({filtered.length} records)</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th
                    className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Employee{' '}
                    {sortField === 'name' ? (
                      sortAsc ? (
                        <ChevronUp className="w-3 h-3 inline" />
                      ) : (
                        <ChevronDown className="w-3 h-3 inline" />
                      )
                    ) : null}
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                    Department
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                    Category
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                    Current Gross
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                    Previous Gross
                  </th>
                  <th
                    className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('varianceAmount')}
                  >
                    Variance{' '}
                    {sortField === 'varianceAmount' ? (
                      sortAsc ? (
                        <ChevronUp className="w-3 h-3 inline" />
                      ) : (
                        <ChevronDown className="w-3 h-3 inline" />
                      )
                    ) : null}
                  </th>
                  <th
                    className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 cursor-pointer"
                    onClick={() => handleSort('variancePercent')}
                  >
                    %{' '}
                    {sortField === 'variancePercent' ? (
                      sortAsc ? (
                        <ChevronUp className="w-3 h-3 inline" />
                      ) : (
                        <ChevronDown className="w-3 h-3 inline" />
                      )
                    ) : null}
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const isHighVariance = Math.abs(emp.variancePercent) >= 5;
                  const cat = CATEGORY_CONFIG[emp.varianceCategory];
                  return (
                    <tr
                      key={emp.employeeId}
                      className={`border-b border-gray-50 hover:bg-gray-50 ${isHighVariance ? 'bg-yellow-50/30' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <div>
                          <p className="font-medium text-gray-800">{emp.employeeName}</p>
                          <p className="text-xs text-gray-400">{emp.employeeCode}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 text-xs">{emp.department}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}
                        >
                          {cat.icon}
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-800">
                        {emp.currentGross > 0 ? (
                          new Intl.NumberFormat('en-IN').format(emp.currentGross)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-500">
                        {emp.previousGross > 0 ? (
                          new Intl.NumberFormat('en-IN').format(emp.previousGross)
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {emp.varianceAmount !== 0 ? (
                          <span
                            className={`font-medium ${emp.varianceAmount > 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {emp.varianceAmount > 0 ? '+' : ''}
                            {new Intl.NumberFormat('en-IN').format(emp.varianceAmount)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {emp.variancePercent !== 0 ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              isHighVariance && emp.variancePercent > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : isHighVariance && emp.variancePercent < 0
                                  ? 'bg-red-100 text-red-700'
                                  : emp.variancePercent > 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isHighVariance && <AlertTriangle className="w-2.5 h-2.5" />}
                            {emp.variancePercent > 0 ? '+' : ''}
                            {emp.variancePercent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td
                        className="px-4 py-2.5 text-xs text-gray-500 max-w-[200px] truncate"
                        title={emp.notes}
                      >
                        {emp.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
