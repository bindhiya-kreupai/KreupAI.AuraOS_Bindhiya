"use client";

import React, { useState } from "react";
import {
  Wallet,
  TrendingUp,
  Building2,
  Receipt,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "expense" | "contribution" | "employer";
  category: string;
}

interface HSAFSAData {
  accountType: "HSA" | "FSA";
  currentBalance: number;
  annualLimit: number;
  contributionsYTD: number;
  employerContributions: number;
  totalSpentYTD: number;
  eligibleExpenses: string[];
  recentTransactions: Transaction[];
}

const mockData: HSAFSAData = {
  accountType: "HSA",
  currentBalance: 4825.50,
  annualLimit: 4150,
  contributionsYTD: 2750,
  employerContributions: 1000,
  totalSpentYTD: 1425.50,
  eligibleExpenses: [
    "Doctor visits & copays",
    "Prescription medications",
    "Dental cleanings & procedures",
    "Vision exams & glasses",
    "Mental health therapy",
    "Physical therapy",
    "Lab tests & X-rays",
    "Medical equipment",
  ],
  recentTransactions: [
    { id: "t-001", date: "2026-01-15", description: "CVS Pharmacy - Prescription", amount: -45.00, type: "expense", category: "Pharmacy" },
    { id: "t-002", date: "2026-01-10", description: "Bi-weekly Contribution", amount: 115.00, type: "contribution", category: "Contribution" },
    { id: "t-003", date: "2026-01-05", description: "Dr. Smith - Office Visit", amount: -125.00, type: "expense", category: "Medical" },
    { id: "t-004", date: "2026-01-01", description: "Employer Quarterly Match", amount: 250.00, type: "employer", category: "Employer" },
    { id: "t-005", date: "2025-12-28", description: "Bi-weekly Contribution", amount: 115.00, type: "contribution", category: "Contribution" },
    { id: "t-006", date: "2025-12-20", description: "Vision Center - Eye Exam", amount: -85.00, type: "expense", category: "Vision" },
  ],
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));

export default function HSAFSAManagement() {
  const [data] = useState<HSAFSAData>(mockData);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "eligible">("overview");

  const contributionPercent = (data.contributionsYTD / data.annualLimit) * 100;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-celestial-indigo" />
            <div>
              <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
                {data.accountType} Management
              </h1>
              <p className="text-sm text-silver-mist">
                Health Savings Account Dashboard
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-celestial-indigo text-white text-sm font-medium hover:bg-celestial-indigo/90">
            <PlusCircle className="w-4 h-4" /> Add Contribution
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.currentBalance)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Contributions YTD</p>
            <p className="text-2xl font-bold text-aurora-green">
              {formatCurrency(data.contributionsYTD)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Employer Match</p>
            <p className="text-2xl font-bold text-celestial-indigo">
              {formatCurrency(data.employerContributions)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
            <p className="text-xs text-silver-mist mb-1">Spent YTD</p>
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.totalSpentYTD)}
            </p>
          </div>
        </div>

        {/* Contribution Progress */}
        <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-black dark:text-pearl">
              Annual Contribution Progress
            </span>
            <span className="text-sm text-silver-mist">
              {formatCurrency(data.contributionsYTD)} of {formatCurrency(data.annualLimit)} limit
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-cloud dark:bg-nebula-purple/30">
            <div
              className="h-full rounded-full bg-celestial-indigo transition-all"
              style={{ width: `${Math.min(contributionPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-silver-mist mt-2">
            {formatCurrency(data.annualLimit - data.contributionsYTD)} remaining for the year
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50 mb-6">
          {[
            { key: "overview", label: "Overview" },
            { key: "transactions", label: "Transactions" },
            { key: "eligible", label: "Eligible Expenses" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-celestial-indigo text-celestial-indigo"
                  : "border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "transactions" && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
            <div className="divide-y divide-cloud dark:divide-nebula-purple/50">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === "expense"
                      ? "bg-red-50 dark:bg-red-900/20"
                      : tx.type === "employer"
                      ? "bg-celestial-indigo/10"
                      : "bg-aurora-green/10"
                  }`}>
                    {tx.type === "expense" ? (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    ) : tx.type === "employer" ? (
                      <Building2 className="w-4 h-4 text-celestial-indigo" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-aurora-green" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {tx.description}
                    </p>
                    <p className="text-xs text-silver-mist">{tx.date} - {tx.category}</p>
                  </div>
                  <span className={`text-sm font-medium ${
                    tx.amount < 0 ? "text-red-500" : "text-aurora-green"
                  }`}>
                    {tx.amount < 0 ? "-" : "+"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "eligible" && (
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-aurora-green" />
              Eligible Expenses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.eligibleExpenses.map((expense) => (
                <div key={expense} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
                  <Receipt className="w-4 h-4 text-celestial-indigo" />
                  <span className="text-sm text-ink-black dark:text-pearl">{expense}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-celestial-indigo" />
                Account Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">Opening Balance</span>
                  <span className="text-sm text-ink-black dark:text-pearl">{formatCurrency(3500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">+ Employee Contributions</span>
                  <span className="text-sm text-aurora-green">+{formatCurrency(data.contributionsYTD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">+ Employer Contributions</span>
                  <span className="text-sm text-celestial-indigo">+{formatCurrency(data.employerContributions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-silver-mist">- Expenses</span>
                  <span className="text-sm text-red-500">-{formatCurrency(data.totalSpentYTD)}</span>
                </div>
                <div className="pt-2 border-t border-cloud dark:border-nebula-purple/50 flex justify-between">
                  <span className="text-sm font-medium text-ink-black dark:text-pearl">Current Balance</span>
                  <span className="text-sm font-bold text-ink-black dark:text-pearl">{formatCurrency(data.currentBalance)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
              <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left">
                  <PlusCircle className="w-5 h-5 text-celestial-indigo" />
                  <span className="text-sm text-ink-black dark:text-pearl">Make a Contribution</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left">
                  <Receipt className="w-5 h-5 text-celestial-indigo" />
                  <span className="text-sm text-ink-black dark:text-pearl">Submit a Claim</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud dark:hover:bg-nebula-purple/10 text-left">
                  <Wallet className="w-5 h-5 text-celestial-indigo" />
                  <span className="text-sm text-ink-black dark:text-pearl">Change Contribution Amount</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
