'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  History,
  Send,
  Info,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: string;
  grade: string;
  joiningDate: string;
  currentCTC: number;
  currency: string;
  lastRevisionDate: string | null;
  lastRevisionPct: number | null;
}

interface ComponentBreakdown {
  name: string;
  code: string;
  category: string;
  currentAnnual: number;
  proposedAnnual: number;
}

interface RevisionRecord {
  id: string;
  effectiveDate: string;
  previousCTC: number;
  newCTC: number;
  increaseAmount: number;
  increasePercent: number;
  reason: string;
  approvedBy: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    code: 'EMP001',
    name: 'Priya Sharma',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    grade: 'L5',
    joiningDate: '2021-03-15',
    currentCTC: 1440000,
    currency: 'INR',
    lastRevisionDate: '2025-04-01',
    lastRevisionPct: 20,
  },
  {
    id: 'emp-002',
    code: 'EMP002',
    name: 'Rahul Mehta',
    designation: 'Tech Lead',
    department: 'Engineering',
    grade: 'L6',
    joiningDate: '2019-07-01',
    currentCTC: 2160000,
    currency: 'INR',
    lastRevisionDate: '2025-04-01',
    lastRevisionPct: 15,
  },
  {
    id: 'emp-003',
    code: 'EMP003',
    name: 'Anita Nair',
    designation: 'Product Manager',
    department: 'Product',
    grade: 'M4',
    joiningDate: '2022-01-10',
    currentCTC: 1800000,
    currency: 'INR',
    lastRevisionDate: '2025-04-01',
    lastRevisionPct: 18,
  },
  {
    id: 'emp-004',
    code: 'EMP004',
    name: 'Suresh Kumar',
    designation: 'Junior Engineer',
    department: 'Engineering',
    grade: 'L3',
    joiningDate: '2023-06-01',
    currentCTC: 600000,
    currency: 'INR',
    lastRevisionDate: null,
    lastRevisionPct: null,
  },
  {
    id: 'emp-005',
    code: 'EMP005',
    name: 'Kavita Singh',
    designation: 'HR Manager',
    department: 'HR',
    grade: 'M3',
    joiningDate: '2020-09-15',
    currentCTC: 1200000,
    currency: 'INR',
    lastRevisionDate: '2025-04-01',
    lastRevisionPct: 12,
  },
];

const MOCK_REVISION_HISTORY: RevisionRecord[] = [
  {
    id: 'rev-001',
    effectiveDate: '2025-04-01',
    previousCTC: 1200000,
    newCTC: 1440000,
    increaseAmount: 240000,
    increasePercent: 20,
    reason: 'Annual Appraisal — Exceeds Expectations',
    approvedBy: 'Sanjay Gupta',
    status: 'APPROVED',
  },
  {
    id: 'rev-002',
    effectiveDate: '2024-04-01',
    previousCTC: 1000000,
    newCTC: 1200000,
    increaseAmount: 200000,
    increasePercent: 20,
    reason: 'Annual Appraisal — Meets Expectations',
    approvedBy: 'Sanjay Gupta',
    status: 'APPROVED',
  },
  {
    id: 'rev-003',
    effectiveDate: '2023-04-01',
    previousCTC: 850000,
    newCTC: 1000000,
    increaseAmount: 150000,
    increasePercent: 17.6,
    reason: 'Joining Increment after probation',
    approvedBy: 'Sanjay Gupta',
    status: 'APPROVED',
  },
];

const REVISION_REASONS = [
  'Annual Performance Appraisal',
  'Mid-year Performance Review',
  'Promotion',
  'Market Correction',
  'Retention Bonus — Salary Enhancement',
  'Counter-offer Adjustment',
  'Role Change / Scope Expansion',
  'Probation Completion',
  'Other',
];

function calculateComponents(annualCTC: number): ComponentBreakdown[] {
  const basic = Math.round(annualCTC * 0.4);
  const hra = Math.round(basic * 0.5);
  const medical = 15000;
  const lta = 24000;
  const special =
    annualCTC -
    basic -
    hra -
    medical -
    lta -
    Math.round(basic * 0.12) -
    Math.round(basic * 0.12) -
    Math.round(basic * 0.0481);
  const eePF = Math.round(basic * 0.12);
  const erPF = Math.round(basic * 0.12);
  const gratuity = Math.round(basic * 0.0481);

  return [
    {
      name: 'Basic Salary',
      code: 'BASIC',
      category: 'BASIC',
      currentAnnual: 0,
      proposedAnnual: basic,
    },
    { name: 'HRA', code: 'HRA', category: 'ALLOWANCE', currentAnnual: 0, proposedAnnual: hra },
    {
      name: 'Medical Allowance',
      code: 'MEDICAL',
      category: 'ALLOWANCE',
      currentAnnual: 0,
      proposedAnnual: medical,
    },
    { name: 'LTA', code: 'LTA', category: 'ALLOWANCE', currentAnnual: 0, proposedAnnual: lta },
    {
      name: 'Special Allowance',
      code: 'SPECIAL',
      category: 'ALLOWANCE',
      currentAnnual: 0,
      proposedAnnual: Math.max(0, special),
    },
    {
      name: 'Employee PF',
      code: 'EE_PF',
      category: 'DEDUCTION',
      currentAnnual: 0,
      proposedAnnual: eePF,
    },
    {
      name: 'Employer PF',
      code: 'ER_PF',
      category: 'EMPLOYER_CONTRIBUTION',
      currentAnnual: 0,
      proposedAnnual: erPF,
    },
    {
      name: 'Gratuity',
      code: 'GRATUITY',
      category: 'EMPLOYER_CONTRIBUTION',
      currentAnnual: 0,
      proposedAnnual: gratuity,
    },
  ];
}

function fmt(n: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function SalaryRevision() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newCTC, setNewCTC] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'select' | 'edit' | 'review' | 'submitted'>('select');

  const filteredEmployees = useMemo(
    () =>
      MOCK_EMPLOYEES.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.department.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const proposedCTC = Number(newCTC) || 0;
  const increaseAmount = proposedCTC - (selectedEmployee?.currentCTC ?? 0);
  const increasePercent =
    selectedEmployee && selectedEmployee.currentCTC > 0
      ? (increaseAmount / selectedEmployee.currentCTC) * 100
      : 0;

  const currentComponents = selectedEmployee
    ? calculateComponents(selectedEmployee.currentCTC)
    : [];
  const proposedComponents = proposedCTC > 0 ? calculateComponents(proposedCTC) : [];

  const mergedComponents = currentComponents.map((c, i) => ({
    ...c,
    currentAnnual: c.proposedAnnual,
    proposedAnnual: proposedComponents[i]?.proposedAnnual ?? 0,
  }));

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setNewCTC(emp.currentCTC.toString());
    setStep('edit');
  };

  const handleSubmit = () => {
    setStep('submitted');
  };

  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Revision Submitted</h2>
          <p className="text-sm text-gray-600 mb-1">
            Salary revision for <strong>{selectedEmployee?.name}</strong> has been submitted for
            approval.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            New CTC: <strong>{fmt(proposedCTC)}</strong> effective <strong>{effectiveDate}</strong>
          </p>
          <button
            onClick={() => {
              setStep('select');
              setSelectedEmployee(null);
              setNewCTC('');
            }}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Revise Another Employee
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Revision</h1>
          <p className="text-sm text-gray-500 mt-1">
            Process salary revisions with side-by-side comparison and approval routing
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          {[
            { id: 'select', label: 'Select Employee' },
            { id: 'edit', label: 'Enter New CTC' },
            { id: 'review', label: 'Review & Submit' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.id}>
              <div
                className={`flex items-center gap-2 ${step === s.id ? 'text-indigo-700' : step === 'review' && i < 2 ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.id
                      ? 'bg-indigo-600 text-white'
                      : (step === 'review' && i < 2) || (step === 'edit' && i === 0)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Employee Selection */}
        {step === 'select' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Select Employee</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-semibold text-sm">
                      {emp.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{emp.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {emp.designation} · {emp.department} · {emp.grade}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{fmt(emp.currentCTC)}</p>
                    <p className="text-xs text-gray-500">
                      {emp.lastRevisionDate
                        ? `Last: ${emp.lastRevisionDate} (+${emp.lastRevisionPct}%)`
                        : 'No prior revision'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: New CTC Entry */}
        {(step === 'edit' || step === 'review') && selectedEmployee && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Input Form */}
            <div className="xl:col-span-1 space-y-4">
              {/* Employee Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-700 font-bold">
                      {selectedEmployee.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedEmployee.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedEmployee.code} · {selectedEmployee.grade}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Designation</span>
                    <span className="text-gray-700 font-medium text-right">
                      {selectedEmployee.designation}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department</span>
                    <span className="text-gray-700 font-medium">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Joined</span>
                    <span className="text-gray-700 font-medium">
                      {selectedEmployee.joiningDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current CTC</span>
                    <span className="text-gray-800 font-bold">
                      {fmt(selectedEmployee.currentCTC)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Revision Inputs */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Revision Details</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    New Annual CTC
                  </label>
                  <input
                    type="number"
                    value={newCTC}
                    onChange={(e) => setNewCTC(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter new CTC amount"
                  />
                  {proposedCTC > 0 && (
                    <div
                      className={`mt-2 flex items-center gap-2 text-sm ${increasePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {increasePercent >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {increasePercent >= 0 ? '+' : ''}
                        {increasePercent.toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        ({fmt(Math.abs(increaseAmount))}{' '}
                        {increaseAmount >= 0 ? 'increase' : 'decrease'})
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Calendar className="w-3.5 h-3.5 inline mr-1" /> Effective Date
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Revision Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select reason...</option>
                    {REVISION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                {reason === 'Other' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Custom Reason
                    </label>
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe the reason..."
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Any additional context..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep('select')}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('review')}
                    disabled={!proposedCTC || !effectiveDate || !reason}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Side-by-Side Comparison */}
            <div className="xl:col-span-2 space-y-4">
              {/* CTC Summary Comparison */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                  <p className="text-xs text-gray-500 mb-1">Current CTC</p>
                  <p className="text-lg font-bold text-gray-800">
                    {fmt(selectedEmployee.currentCTC)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fmt(Math.round(selectedEmployee.currentCTC / 12))}/month
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 shadow-sm text-center flex flex-col items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-indigo-500 mb-1" />
                  <p
                    className={`text-lg font-bold ${increasePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {increasePercent >= 0 ? '+' : ''}
                    {increasePercent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {increasePercent >= 0 ? 'Increase' : 'Decrease'}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-4 shadow-sm text-center border ${proposedCTC > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <p className="text-xs text-gray-500 mb-1">Proposed CTC</p>
                  <p
                    className={`text-lg font-bold ${proposedCTC > 0 ? 'text-green-700' : 'text-gray-400'}`}
                  >
                    {proposedCTC > 0 ? fmt(proposedCTC) : '—'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {proposedCTC > 0
                      ? `${fmt(Math.round(proposedCTC / 12))}/month`
                      : 'Enter new CTC'}
                  </p>
                </div>
              </div>

              {/* Component Comparison Table */}
              {proposedCTC > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Component Breakdown Comparison
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">
                            Component
                          </th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                            Current (Annual)
                          </th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                            Proposed (Annual)
                          </th>
                          <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mergedComponents.map((c) => {
                          const diff = c.proposedAnnual - c.currentAnnual;
                          const diffPct =
                            c.currentAnnual > 0 ? ((diff / c.currentAnnual) * 100).toFixed(1) : '—';
                          return (
                            <tr key={c.code} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="px-4 py-2.5">
                                <div>
                                  <span className="text-gray-800 font-medium">{c.name}</span>
                                  <span className="ml-2 text-xs text-gray-400">{c.category}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right text-gray-600">
                                {new Intl.NumberFormat('en-IN').format(c.currentAnnual)}
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                                {new Intl.NumberFormat('en-IN').format(c.proposedAnnual)}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                {diff !== 0 ? (
                                  <span
                                    className={`text-xs font-medium ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}
                                  >
                                    {diff > 0 ? '+' : ''}
                                    {new Intl.NumberFormat('en-IN').format(diff)}
                                    {diffPct !== '—' && ` (${diff > 0 ? '+' : ''}${diffPct}%)`}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-indigo-50 font-semibold">
                          <td className="px-4 py-3 text-indigo-800">Total CTC</td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {fmt(selectedEmployee.currentCTC)}
                          </td>
                          <td className="px-4 py-3 text-right text-indigo-800">
                            {fmt(proposedCTC)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`text-sm font-bold ${increaseAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {increaseAmount >= 0 ? '+' : ''}
                              {fmt(Math.abs(increaseAmount))}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Revision History */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Revision History</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {MOCK_REVISION_HISTORY.map((rev) => (
                    <div key={rev.id} className="px-5 py-3 flex items-center gap-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{rev.reason}</p>
                        <p className="text-xs text-gray-500">
                          Effective: {rev.effectiveDate} · Approved by: {rev.approvedBy}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-green-600">
                          +{rev.increasePercent.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {fmt(rev.previousCTC)} → {fmt(rev.newCTC)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit (Review step) */}
              {step === 'review' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Info className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-indigo-800">Confirm Revision</p>
                      <p className="text-xs text-indigo-600 mt-0.5">
                        This will route to the employee&apos;s manager and HR for approval. Employee
                        will be notified once approved.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Employee:</span>{' '}
                      <span className="font-medium text-gray-800 ml-1">
                        {selectedEmployee.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">New CTC:</span>{' '}
                      <span className="font-medium text-green-700 ml-1">{fmt(proposedCTC)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Increase:</span>{' '}
                      <span className="font-medium text-green-700 ml-1">
                        +{increasePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Effective:</span>{' '}
                      <span className="font-medium text-gray-800 ml-1">{effectiveDate}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Reason:</span>{' '}
                      <span className="font-medium text-gray-800 ml-1">
                        {reason === 'Other' ? customReason : reason}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('edit')}
                      className="flex-1 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Submit for Approval
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
