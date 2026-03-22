/**
 * @module MobilePayslip
 * @description Mobile payslip viewer — month carousel, earnings/deductions breakdown,
 *              YTD summary, download, and share (Sec 15.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PayslipLineItem {
  label: string;
  amount: number;
  isHighlighted?: boolean;
}

interface MonthlyPayslip {
  month: string;
  year: number;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  employerContributions: number;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  employerContributionItems: PayslipLineItem[];
  ytdGross: number;
  ytdNet: number;
  ytdTax: number;
}

// ── Data is fetched from API ─────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

// ── Component ─────────────────────────────────────────────────────────────────

export function MobilePayslip() {
  const [payslips, setPayslips] = useState<MonthlyPayslip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    earnings: true,
    deductions: false,
    employer: false,
    ytd: false,
  });

  const fetchPayslips = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/payroll/payslips');
      const json = await res.json();
      const list = json.data || [];
      if (list.length > 0) {
        setPayslips(list.map((p: any) => ({
          month: p.month || new Date(p.periodStart || p.createdAt).toLocaleString('en-US', { month: 'long' }),
          year: p.year || new Date(p.periodStart || p.createdAt).getFullYear(),
          grossPay: Number(p.grossSalary || p.grossPay || 0),
          netPay: Number(p.netSalary || p.netPay || 0),
          totalDeductions: Number(p.totalDeductions || 0),
          employerContributions: Number(p.employerContributions || 0),
          earnings: Array.isArray(p.earnings) ? p.earnings.map((e: any) => ({ label: e.label || e.name, amount: Number(e.amount || 0), isHighlighted: e.isHighlighted })) : [{ label: 'Basic Salary', amount: Number(p.basicSalary || p.grossPay || 0) }],
          deductions: Array.isArray(p.deductions) ? p.deductions.map((d: any) => ({ label: d.label || d.name, amount: Number(d.amount || 0), isHighlighted: d.isHighlighted })) : [],
          employerContributionItems: Array.isArray(p.employerContributionItems) ? p.employerContributionItems : [],
          ytdGross: Number(p.ytdGross || 0),
          ytdNet: Number(p.ytdNet || 0),
          ytdTax: Number(p.ytdTax || 0),
        })));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchPayslips(); }, [fetchPayslips]);

  const slip = payslips[currentIndex];
  const prevSlip = payslips[currentIndex + 1];
  const netTrend = prevSlip && slip ? slip.netPay - prevSlip.netPay : 0;

  if (!slip) {
    return (
      <div className="flex items-center justify-center min-h-96 text-gray-400">
        <p>Loading payslips...</p>
      </div>
    );
  }

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      {/* Month Selector */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex(Math.min(currentIndex + 1, payslips.length - 1))}
            disabled={currentIndex >= payslips.length - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-lg">
              {slip.month} {slip.year}
            </p>
            <p className="text-xs text-gray-500">Pay Period</p>
          </div>
          <button
            onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
            disabled={currentIndex <= 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Month dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {payslips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? 'bg-indigo-600 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Net Pay Hero */}
        <div className="mx-4 mt-4 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-80">Net Pay</p>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-4xl font-bold">{fmt(slip.netPay)}</p>
            <div className="flex items-center gap-1 mb-1">
              {netTrend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-300" />
              )}
              <span
                className={`text-sm font-medium ${netTrend >= 0 ? 'text-emerald-300' : 'text-red-300'}`}
              >
                {netTrend >= 0 ? '+' : ''}
                {fmt(Math.abs(netTrend))}
              </span>
            </div>
          </div>
          <p className="text-xs opacity-70 mt-1">vs previous month</p>

          <div className="grid grid-cols-3 gap-3 mt-4 bg-white/10 rounded-xl p-3">
            <div className="text-center">
              <p className="text-xs opacity-70">Gross Pay</p>
              <p className="font-bold text-sm mt-0.5">{fmt(slip.grossPay)}</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-xs opacity-70">Deductions</p>
              <p className="font-bold text-sm mt-0.5 text-red-300">{fmt(slip.totalDeductions)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs opacity-70">Employer</p>
              <p className="font-bold text-sm mt-0.5 text-emerald-300">
                {fmt(slip.employerContributions)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mx-4 mt-4">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-gray-500" />
            Download PDF
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Share2 className="w-4 h-4 text-gray-500" />
            Share
          </button>
        </div>

        {/* Earnings Section */}
        <CollapsibleSection
          title="Earnings"
          total={fmt(slip.grossPay)}
          totalColor="text-emerald-600"
          isOpen={expanded.earnings}
          onToggle={() => toggle('earnings')}
          items={slip.earnings}
          accentColor="emerald"
        />

        {/* Deductions Section */}
        <CollapsibleSection
          title="Deductions"
          total={`-${fmt(slip.totalDeductions)}`}
          totalColor="text-red-600"
          isOpen={expanded.deductions}
          onToggle={() => toggle('deductions')}
          items={slip.deductions}
          accentColor="red"
        />

        {/* Employer Contributions */}
        <CollapsibleSection
          title="Employer Contributions"
          total={fmt(slip.employerContributions)}
          totalColor="text-blue-600"
          isOpen={expanded.employer}
          onToggle={() => toggle('employer')}
          items={slip.employerContributionItems}
          accentColor="blue"
        />

        {/* YTD Summary */}
        <div className="mx-4 mt-3 mb-6 bg-white rounded-2xl overflow-hidden">
          <button
            onClick={() => toggle('ytd')}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-violet-600" />
              </div>
              <p className="font-semibold text-gray-900">YTD Summary</p>
            </div>
            {expanded.ytd ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expanded.ytd && (
            <div className="border-t border-gray-50 px-4 pb-4 space-y-3">
              {[
                { label: 'YTD Gross Pay', value: fmt(slip.ytdGross), color: 'text-gray-900' },
                { label: 'YTD Net Pay', value: fmt(slip.ytdNet), color: 'text-emerald-600' },
                { label: 'YTD Tax Paid', value: fmt(slip.ytdTax), color: 'text-red-600' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-600">{row.label}</span>
                  <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  total,
  totalColor,
  isOpen,
  onToggle,
  items,
  accentColor,
}: {
  title: string;
  total: string;
  totalColor: string;
  isOpen: boolean;
  onToggle: () => void;
  items: PayslipLineItem[];
  accentColor: string;
}) {
  const iconBg = `bg-${accentColor}-50`;
  const iconColor = `text-${accentColor}-600`;

  return (
    <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
            <span className={`text-sm font-bold ${iconColor}`}>{title[0]}</span>
          </div>
          <p className="font-semibold text-gray-900">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${totalColor}`}>{total}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-50 px-4 pb-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.label}
              className={`flex justify-between py-2 border-b border-gray-50 last:border-0 ${
                item.isHighlighted ? 'bg-amber-50 -mx-4 px-4 rounded' : ''
              }`}
            >
              <span
                className={`text-sm ${item.isHighlighted ? 'font-semibold text-amber-700' : 'text-gray-600'}`}
              >
                {item.label}
                {item.isHighlighted && <span className="ml-1 text-xs">(bonus)</span>}
              </span>
              <span
                className={`text-sm font-semibold ${item.isHighlighted ? 'text-amber-700' : 'text-gray-900'}`}
              >
                {item.amount.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MobilePayslip;
