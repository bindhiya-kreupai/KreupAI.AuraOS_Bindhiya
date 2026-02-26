'use client';

import React, { useState } from 'react';
import {
  Printer,
  Download,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Loader2,
  Mail,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EarningLine {
  description: string;
  amount: number;
  isYTD?: boolean;
}

interface DeductionLine {
  description: string;
  amount: number;
  isYTD?: boolean;
}

interface EmployerContribLine {
  description: string;
  amount: number;
}

interface Payslip {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  grade: string;
  pan: string;
  uan: string;
  bankLast4: string;
  period: string;
  workingDays: number;
  earnedDays: number;
  lopDays: number;
  earnings: EarningLine[];
  deductions: DeductionLine[];
  employerContributions: EmployerContribLine[];
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  ytdGross: number;
  ytdTDS: number;
  ytdPF: number;
  companyName: string;
  companyAddress: string;
  paymentDate: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_EMPLOYEES = [
  {
    id: 'emp-001',
    code: 'EMP001',
    name: 'Priya Sharma',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    grade: 'L5',
  },
  {
    id: 'emp-002',
    code: 'EMP002',
    name: 'Rahul Mehta',
    designation: 'Tech Lead',
    department: 'Engineering',
    grade: 'L6',
  },
  {
    id: 'emp-003',
    code: 'EMP003',
    name: 'Anita Nair',
    designation: 'Product Manager',
    department: 'Product',
    grade: 'M4',
  },
];

const MOCK_PAYSLIP: Payslip = {
  employeeId: 'emp-001',
  employeeCode: 'EMP001',
  employeeName: 'Priya Sharma',
  designation: 'Senior Software Engineer',
  department: 'Engineering',
  grade: 'L5',
  pan: 'ABCDE1234F',
  uan: '100987654321',
  bankLast4: '5678',
  period: '2026-01',
  workingDays: 26,
  earnedDays: 26,
  lopDays: 0,
  earnings: [
    { description: 'Basic Salary', amount: 48000 },
    { description: 'HRA', amount: 24000 },
    { description: 'Medical Allowance', amount: 1250 },
    { description: 'LTA', amount: 2000 },
    { description: 'Special Allowance', amount: 43750 },
    { description: 'Overtime Earnings', amount: 2769 },
  ],
  deductions: [
    { description: 'Employee PF (12%)', amount: 5760 },
    { description: 'Income Tax (TDS)', amount: 12000 },
    { description: 'Professional Tax', amount: 200 },
    { description: 'Loan EMI Recovery', amount: 5000 },
    { description: 'Group Health Insurance', amount: 1500 },
  ],
  employerContributions: [
    { description: 'Employer PF (12%)', amount: 5760 },
    { description: 'Gratuity Provision (4.81%)', amount: 2309 },
  ],
  grossEarnings: 121769,
  totalDeductions: 24460,
  netPay: 97309,
  ytdGross: 1346000,
  ytdTDS: 120000,
  ytdPF: 57600,
  companyName: 'KreupAI Technologies Pvt Ltd',
  companyAddress: '14th Floor, World Trade Center, Bengaluru — 560001, Karnataka, India',
  paymentDate: '2026-01-31',
};

const PERIODS = ['2026-01', '2025-12', '2025-11', '2025-10', '2025-09', '2025-08'];

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(n);
}

// ---------------------------------------------------------------------------
// Payslip View
// ---------------------------------------------------------------------------

function PayslipView({ slip }: { slip: Payslip }) {
  const [year, mon] = slip.period.split('-');
  const monthName = new Date(+year, +mon - 1).toLocaleString('default', { month: 'long' });

  return (
    <div
      id="payslip-print"
      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm"
    >
      {/* Header */}
      <div className="bg-indigo-700 text-white px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold">{slip.companyName}</h2>
            <p className="text-indigo-200 text-xs mt-0.5">{slip.companyAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-200">Pay Slip</p>
            <p className="text-sm font-semibold">
              {monthName} {year}
            </p>
            <p className="text-xs text-indigo-200">Payment Date: {slip.paymentDate}</p>
          </div>
        </div>
      </div>

      {/* Employee Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-200">
        {[
          { label: 'Employee Name', value: slip.employeeName },
          { label: 'Employee Code', value: slip.employeeCode },
          { label: 'Designation', value: slip.designation },
          { label: 'Department', value: slip.department },
          { label: 'Grade', value: slip.grade },
          { label: 'PAN', value: slip.pan },
          { label: 'UAN', value: slip.uan },
          { label: 'Bank A/C (Last 4)', value: `XXXX${slip.bankLast4}` },
        ].map((item) => (
          <div
            key={item.label}
            className="px-4 py-2.5 border-r border-b border-gray-100 last:border-r-0"
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="font-medium text-gray-800 text-xs mt-0.5 truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Row */}
      <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
        {[
          { label: 'Working Days', value: slip.workingDays },
          { label: 'Earned Days', value: slip.earnedDays },
          { label: 'LOP Days', value: slip.lopDays },
        ].map((item) => (
          <div
            key={item.label}
            className="text-center py-2.5 border-r border-gray-200 last:border-r-0"
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="font-bold text-gray-800 text-base">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Earnings */}
        <div className="border-r border-gray-100">
          <div className="bg-green-50 px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Earnings</p>
          </div>
          <div className="divide-y divide-gray-50">
            {slip.earnings.map((e) => (
              <div key={e.description} className="flex justify-between px-4 py-2">
                <span className="text-gray-600 text-xs">{e.description}</span>
                <span className="font-medium text-gray-800 text-xs">{fmt(e.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 py-2.5 bg-green-50 border-t border-green-200">
            <span className="text-sm font-bold text-green-800">Gross Earnings</span>
            <span className="text-sm font-bold text-green-800">{fmt(slip.grossEarnings)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <div className="bg-red-50 px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Deductions</p>
          </div>
          <div className="divide-y divide-gray-50">
            {slip.deductions.map((d) => (
              <div key={d.description} className="flex justify-between px-4 py-2">
                <span className="text-gray-600 text-xs">{d.description}</span>
                <span className="font-medium text-red-700 text-xs">{fmt(d.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 py-2.5 bg-red-50 border-t border-red-200">
            <span className="text-sm font-bold text-red-800">Total Deductions</span>
            <span className="text-sm font-bold text-red-800">{fmt(slip.totalDeductions)}</span>
          </div>
        </div>
      </div>

      {/* Employer Contributions */}
      <div className="border-t border-gray-200">
        <div className="bg-orange-50 px-4 py-2 border-b border-gray-100">
          <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
            Employer Contributions (not deducted from salary)
          </p>
        </div>
        <div className="flex flex-wrap gap-0">
          {slip.employerContributions.map((c) => (
            <div
              key={c.description}
              className="flex justify-between px-4 py-2 border-r border-gray-100 min-w-[200px] flex-1"
            >
              <span className="text-gray-600 text-xs">{c.description}</span>
              <span className="font-medium text-orange-700 text-xs">{fmt(c.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Net Pay */}
      <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-xs">Net Pay (Take Home)</p>
          <p className="text-2xl font-bold mt-0.5">₹{fmt(slip.netPay)}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-indigo-200 space-y-0.5">
            <p>YTD Gross: ₹{fmt(slip.ytdGross)}</p>
            <p>YTD TDS: ₹{fmt(slip.ytdTDS)}</p>
            <p>YTD PF: ₹{fmt(slip.ytdPF)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          This is a computer-generated payslip and does not require a signature. For queries,
          contact hr@kreupai.com
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PayslipGenerator() {
  const [selectedEmployee, setSelectedEmployee] = useState(MOCK_EMPLOYEES[0].id);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [loading, setLoading] = useState(false);
  const [showPayslip, setShowPayslip] = useState(true);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkSent, setBulkSent] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowPayslip(true);
    }, 800);
  };

  const handleBulkSend = () => {
    setBulkSending(true);
    setTimeout(() => {
      setBulkSending(false);
      setBulkSent(true);
      setTimeout(() => setBulkSent(false), 3000);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payslip Generator</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate, view, and distribute employee payslips
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkSend}
              disabled={bulkSending || bulkSent}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium hover:border-gray-300 disabled:opacity-60 transition-colors"
            >
              {bulkSent ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : bulkSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 text-gray-500" />
              )}
              {bulkSent ? 'Sent!' : bulkSending ? 'Sending...' : 'Bulk Email All'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <User className="w-3.5 h-3.5 inline mr-1" /> Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MOCK_EMPLOYEES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Pay Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {loading ? 'Loading...' : 'Generate'}
              </button>
              {showPayslip && (
                <>
                  <button
                    onClick={handlePrint}
                    className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Print"
                  >
                    <Printer className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payslip */}
        {showPayslip && !loading && <PayslipView slip={MOCK_PAYSLIP} />}

        {loading && (
          <div className="flex items-center justify-center h-48 bg-white border border-gray-200 rounded-xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Generating payslip...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
