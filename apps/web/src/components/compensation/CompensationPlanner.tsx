/**
 * @module CompensationPlanner
 * @description Main compensation planner with budget allocation, salary reviews, benchmarks, and history
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Users, BarChart3, History, Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SalaryReview, type EmployeeReviewData } from './SalaryReview';
import { BudgetAllocation, type DepartmentAllocation } from './BudgetAllocation';
import { BenchmarkComparison, type BenchmarkData } from './BenchmarkComparison';
import { CompReviewHistory, type CompReviewRecord } from './CompReviewHistory';

type ActiveTab = 'reviews' | 'budget' | 'benchmarks' | 'history';

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES: EmployeeReviewData[] = [
  {
    id: 'emp-001',
    employeeName: 'Sarah Johnson',
    employeeCode: 'EMP001',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    grade: 'L5',
    currentSalary: 12000,
    currency: 'USD',
    compaRatio: 1.05,
    performanceRating: 4.5,
    performanceLabel: 'Exceeds Expectations',
    tenure: 36,
    lastIncrementDate: '2025-04-01',
    lastIncrementPercent: 8,
    marketMedian: 11500,
    marketPosition: 'leading',
    isEligible: true,
    status: 'pending',
  },
  {
    id: 'emp-002',
    employeeName: 'Michael Chen',
    employeeCode: 'EMP002',
    department: 'Engineering',
    designation: 'Software Engineer',
    grade: 'L4',
    currentSalary: 8500,
    currency: 'USD',
    compaRatio: 0.88,
    performanceRating: 4.0,
    performanceLabel: 'Exceeds Expectations',
    tenure: 20,
    lastIncrementDate: '2025-04-01',
    lastIncrementPercent: 6,
    marketMedian: 9600,
    marketPosition: 'lagging',
    isEligible: true,
    status: 'pending',
  },
  {
    id: 'emp-003',
    employeeName: 'Emily Rodriguez',
    employeeCode: 'EMP003',
    department: 'Engineering',
    designation: 'Junior Software Engineer',
    grade: 'L3',
    currentSalary: 5800,
    currency: 'USD',
    compaRatio: 0.95,
    performanceRating: 3.0,
    performanceLabel: 'Meets Expectations',
    tenure: 8,
    lastIncrementDate: '2025-07-01',
    lastIncrementPercent: 0,
    marketMedian: 6100,
    marketPosition: 'competitive',
    isEligible: false,
    status: 'pending',
  },
  {
    id: 'emp-004',
    employeeName: 'David Kim',
    employeeCode: 'EMP004',
    department: 'Product',
    designation: 'Product Manager',
    grade: 'L5',
    currentSalary: 13500,
    currency: 'USD',
    compaRatio: 1.12,
    performanceRating: 5.0,
    performanceLabel: 'Exceptional',
    tenure: 48,
    lastIncrementDate: '2025-01-01',
    lastIncrementPercent: 10,
    marketMedian: 12000,
    marketPosition: 'leading',
    isEligible: true,
    proposedIncrement: 12,
    proposedSalary: 15120,
    status: 'approved',
  },
  {
    id: 'emp-005',
    employeeName: 'Jessica Martinez',
    employeeCode: 'EMP005',
    department: 'Design',
    designation: 'UI/UX Designer',
    grade: 'L4',
    currentSalary: 9200,
    currency: 'USD',
    compaRatio: 0.92,
    performanceRating: 3.5,
    performanceLabel: 'Meets Expectations',
    tenure: 24,
    lastIncrementDate: '2025-04-01',
    lastIncrementPercent: 5,
    marketMedian: 10000,
    marketPosition: 'lagging',
    isEligible: true,
    status: 'pending',
  },
  {
    id: 'emp-006',
    employeeName: 'Alex Rivera',
    employeeCode: 'EMP006',
    department: 'Engineering',
    designation: 'Tech Lead',
    grade: 'L6',
    currentSalary: 16000,
    currency: 'USD',
    compaRatio: 0.98,
    performanceRating: 4.0,
    performanceLabel: 'Exceeds Expectations',
    tenure: 60,
    lastIncrementDate: '2025-04-01',
    lastIncrementPercent: 7,
    marketMedian: 16300,
    marketPosition: 'competitive',
    isEligible: true,
    status: 'pending',
  },
  {
    id: 'emp-007',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP007',
    department: 'Engineering',
    designation: 'Software Engineer',
    grade: 'L4',
    currentSalary: 8800,
    currency: 'USD',
    compaRatio: 0.92,
    performanceRating: 4.5,
    performanceLabel: 'Exceeds Expectations',
    tenure: 18,
    lastIncrementDate: '2025-07-01',
    lastIncrementPercent: 0,
    marketMedian: 9600,
    marketPosition: 'lagging',
    isEligible: true,
    proposedIncrement: 8,
    proposedSalary: 9504,
    status: 'proposed',
  },
  {
    id: 'emp-008',
    employeeName: 'Marcus Johnson',
    employeeCode: 'EMP008',
    department: 'Product',
    designation: 'Junior Product Analyst',
    grade: 'L3',
    currentSalary: 5200,
    currency: 'USD',
    compaRatio: 1.0,
    performanceRating: 2.5,
    performanceLabel: 'Developing',
    tenure: 10,
    lastIncrementDate: '2025-04-01',
    lastIncrementPercent: 3,
    marketMedian: 5200,
    marketPosition: 'competitive',
    isEligible: true,
    status: 'pending',
  },
];

const MOCK_DEPARTMENTS: DepartmentAllocation[] = [
  {
    id: 'dept-eng',
    name: 'Engineering',
    headcount: 5,
    totalSalary: 51100,
    allocatedBudget: 42000,
    usedBudget: 15120,
    avgPerformance: 4.0,
    eligibleCount: 4,
    isLocked: false,
  },
  {
    id: 'dept-prod',
    name: 'Product',
    headcount: 2,
    totalSalary: 18700,
    allocatedBudget: 18000,
    usedBudget: 12960,
    avgPerformance: 3.75,
    eligibleCount: 2,
    isLocked: false,
  },
  {
    id: 'dept-des',
    name: 'Design',
    headcount: 1,
    totalSalary: 9200,
    allocatedBudget: 8000,
    usedBudget: 0,
    avgPerformance: 3.5,
    eligibleCount: 1,
    isLocked: false,
  },
];

const MOCK_BENCHMARKS: BenchmarkData[] = [
  {
    id: 'bm-1',
    jobTitle: 'Senior Software Engineer',
    jobFamily: 'Engineering',
    grade: 'L5',
    geography: 'US - National',
    industry: 'Technology',
    source: 'Radford 2025',
    surveyDate: '2025-Q4',
    currency: 'USD',
    p25: 9800,
    p50: 11500,
    p75: 13200,
    p90: 15000,
    internalAvg: 12000,
    internalMin: 12000,
    internalMax: 12000,
    employeeCount: 1,
    marketRatio: 1.04,
    competitivePosition: 'leading',
    gap: 500,
    recommendation: 'Compensation is competitive. Maintain current positioning.',
  },
  {
    id: 'bm-2',
    jobTitle: 'Software Engineer',
    jobFamily: 'Engineering',
    grade: 'L4',
    geography: 'US - National',
    industry: 'Technology',
    source: 'Radford 2025',
    surveyDate: '2025-Q4',
    currency: 'USD',
    p25: 7500,
    p50: 9600,
    p75: 11200,
    p90: 12800,
    internalAvg: 8650,
    internalMin: 8500,
    internalMax: 8800,
    employeeCount: 2,
    marketRatio: 0.9,
    competitivePosition: 'lagging',
    gap: -950,
    recommendation:
      'Below market median by 10%. Consider market adjustment to reduce attrition risk.',
  },
  {
    id: 'bm-3',
    jobTitle: 'Tech Lead',
    jobFamily: 'Engineering',
    grade: 'L6',
    geography: 'US - National',
    industry: 'Technology',
    source: 'Radford 2025',
    surveyDate: '2025-Q4',
    currency: 'USD',
    p25: 14000,
    p50: 16300,
    p75: 18500,
    p90: 21000,
    internalAvg: 16000,
    internalMin: 16000,
    internalMax: 16000,
    employeeCount: 1,
    marketRatio: 0.98,
    competitivePosition: 'competitive',
    gap: -300,
    recommendation: 'Slightly below median. Monitor and adjust at next review.',
  },
  {
    id: 'bm-4',
    jobTitle: 'Product Manager',
    jobFamily: 'Product',
    grade: 'L5',
    geography: 'US - National',
    industry: 'Technology',
    source: 'Mercer 2025',
    surveyDate: '2025-Q4',
    currency: 'USD',
    p25: 10500,
    p50: 12000,
    p75: 14000,
    p90: 16500,
    internalAvg: 13500,
    internalMin: 13500,
    internalMax: 13500,
    employeeCount: 1,
    marketRatio: 1.13,
    competitivePosition: 'leading',
    gap: 1500,
    recommendation: 'Above P75 for this level. Well-positioned for retention.',
  },
  {
    id: 'bm-5',
    jobTitle: 'UI/UX Designer',
    jobFamily: 'Design',
    grade: 'L4',
    geography: 'US - National',
    industry: 'Technology',
    source: 'Mercer 2025',
    surveyDate: '2025-Q4',
    currency: 'USD',
    p25: 8000,
    p50: 10000,
    p75: 12000,
    p90: 13500,
    internalAvg: 9200,
    internalMin: 9200,
    internalMax: 9200,
    employeeCount: 1,
    marketRatio: 0.92,
    competitivePosition: 'lagging',
    gap: -800,
    recommendation: 'Below market median. Recommend 8-10% adjustment to reach competitive range.',
  },
];

const MOCK_HISTORY: CompReviewRecord[] = [
  {
    id: 'rev-001',
    cycleId: 'cyc-001',
    cycleName: 'Annual Merit Cycle 2025',
    fiscalYear: '2025-26',
    incrementType: 'merit',
    effectiveDate: '2025-04-01',
    processedDate: '2025-03-15',
    status: 'processed',
    totalBudget: 85000,
    usedBudget: 78200,
    currency: 'USD',
    totalEligible: 8,
    totalProcessed: 7,
    avgIncrementPercent: 7.2,
    minIncrementPercent: 3,
    maxIncrementPercent: 12,
    departments: [
      { name: 'Engineering', headcount: 4, avgIncrement: 7.5, totalCost: 48000 },
      { name: 'Product', headcount: 2, avgIncrement: 8.0, totalCost: 22000 },
      { name: 'Design', headcount: 1, avgIncrement: 5.0, totalCost: 8200 },
    ],
  },
  {
    id: 'rev-002',
    cycleId: 'cyc-002',
    cycleName: 'Market Adjustment Q3',
    fiscalYear: '2025-26',
    incrementType: 'market_adjustment',
    effectiveDate: '2025-10-01',
    processedDate: '2025-09-20',
    status: 'processed',
    totalBudget: 30000,
    usedBudget: 24600,
    currency: 'USD',
    totalEligible: 3,
    totalProcessed: 3,
    avgIncrementPercent: 5.5,
    minIncrementPercent: 4,
    maxIncrementPercent: 8,
    departments: [
      { name: 'Engineering', headcount: 2, avgIncrement: 6.0, totalCost: 18000 },
      { name: 'Design', headcount: 1, avgIncrement: 4.5, totalCost: 6600 },
    ],
  },
  {
    id: 'rev-003',
    cycleId: 'cyc-003',
    cycleName: 'Annual Merit Cycle 2024',
    fiscalYear: '2024-25',
    incrementType: 'merit',
    effectiveDate: '2024-04-01',
    processedDate: '2024-03-18',
    status: 'processed',
    totalBudget: 72000,
    usedBudget: 68500,
    currency: 'USD',
    totalEligible: 7,
    totalProcessed: 6,
    avgIncrementPercent: 6.8,
    minIncrementPercent: 3,
    maxIncrementPercent: 10,
    departments: [
      { name: 'Engineering', headcount: 3, avgIncrement: 7.0, totalCost: 38000 },
      { name: 'Product', headcount: 2, avgIncrement: 6.5, totalCost: 22500 },
      { name: 'Design', headcount: 1, avgIncrement: 5.0, totalCost: 8000 },
    ],
  },
  {
    id: 'rev-004',
    cycleId: 'cyc-004',
    cycleName: 'Retention Increment',
    fiscalYear: '2024-25',
    incrementType: 'retention',
    effectiveDate: '2024-08-01',
    processedDate: '2024-07-25',
    status: 'processed',
    totalBudget: 15000,
    usedBudget: 14200,
    currency: 'USD',
    totalEligible: 2,
    totalProcessed: 2,
    avgIncrementPercent: 9.0,
    minIncrementPercent: 8,
    maxIncrementPercent: 10,
    departments: [{ name: 'Engineering', headcount: 2, avgIncrement: 9.0, totalCost: 14200 }],
  },
];

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="px-3 py-2.5 rounded-xl border border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue">
    <div className="flex items-center gap-1.5 mb-1">
      <div className={`p-1 rounded-md ${color}`}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="text-[9px] text-silver-mist">{label}</span>
    </div>
    <p className="text-lg font-bold text-ink-black dark:text-pearl leading-none">{value}</p>
    {subtext && <p className="text-[9px] text-silver-mist mt-0.5">{subtext}</p>}
  </div>
);

export const CompensationPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('reviews');
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const totalBudget = 68000;
  const currency = 'USD';

  const eligible = useMemo(() => employees.filter((e) => e.isEligible), [employees]);
  const proposed = useMemo(
    () => employees.filter((e) => e.status === 'proposed' || e.status === 'approved'),
    [employees]
  );
  const pending = useMemo(
    () => employees.filter((e) => e.isEligible && e.status === 'pending'),
    [employees]
  );
  const _totalAllocated = useMemo(
    () => departments.reduce((s, d) => s + d.allocatedBudget, 0),
    [departments]
  );
  const totalUsed = useMemo(() => departments.reduce((s, d) => s + d.usedBudget, 0), [departments]);
  const budgetRemaining = totalBudget - totalUsed;

  const handlePropose = useCallback(
    (empId: string, percent: number, _amount: number, _justification: string) => {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === empId
            ? {
                ...e,
                proposedIncrement: percent,
                proposedSalary: Math.round(e.currentSalary * (1 + percent / 100)),
                status: 'proposed' as const,
              }
            : e
        )
      );
    },
    []
  );

  const handleAllocate = useCallback((deptId: string, amount: number) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, allocatedBudget: amount } : d))
    );
  }, []);

  const handleLock = useCallback((deptId: string) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, isLocked: !d.isLocked } : d))
    );
  }, []);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Wallet}
          label="Total Budget"
          value={`$${(totalBudget / 1000).toFixed(0)}K`}
          subtext={`$${(budgetRemaining / 1000).toFixed(0)}K remaining`}
          color="bg-sunset-amber/10 text-sunset-amber"
        />
        <StatCard
          icon={Users}
          label="Eligible"
          value={`${eligible.length}`}
          subtext={`${pending.length} pending review`}
          color="bg-celestial-indigo/10 text-celestial-indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label="Proposed"
          value={`${proposed.length}`}
          subtext={`${employees.filter((e) => e.status === 'approved').length} approved`}
          color="bg-neural-mint/10 text-neural-mint"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Increment"
          value={`${proposed.length > 0 ? (proposed.reduce((s, e) => s + (e.proposedIncrement || 0), 0) / proposed.length).toFixed(1) : '0'}%`}
          subtext="For proposed reviews"
          color="bg-nebula-purple/10 text-nebula-purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30 w-fit">
        {[
          { key: 'reviews' as ActiveTab, label: 'Salary Reviews', icon: Users },
          { key: 'budget' as ActiveTab, label: 'Budget', icon: Wallet },
          { key: 'benchmarks' as ActiveTab, label: 'Benchmarks', icon: BarChart3 },
          { key: 'history' as ActiveTab, label: 'History', icon: History },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'reviews' && (
        <div className="space-y-2">
          {employees.map((emp) => (
            <SalaryReview
              key={emp.id}
              employee={emp}
              budgetRemaining={budgetRemaining}
              onPropose={handlePropose}
            />
          ))}
        </div>
      )}

      {activeTab === 'budget' && (
        <BudgetAllocation
          totalBudget={totalBudget}
          currency={currency}
          departments={departments}
          onAllocate={handleAllocate}
          onLock={handleLock}
        />
      )}

      {activeTab === 'benchmarks' && <BenchmarkComparison benchmarks={MOCK_BENCHMARKS} />}

      {activeTab === 'history' && <CompReviewHistory reviews={MOCK_HISTORY} />}
    </div>
  );
};

export default CompensationPlanner;
