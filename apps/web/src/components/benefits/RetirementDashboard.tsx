"use client";

import React from "react";
import {
  PiggyBank,
  TrendingUp,
  Building2,
  Clock,
  PieChart,
  ArrowUpRight,
  DollarSign,
  Calendar,
} from "lucide-react";

interface InvestmentAllocation {
  name: string;
  percentage: number;
  color: string;
  returnYTD: number;
}

interface VestingSchedule {
  year: number;
  percentage: number;
  vested: boolean;
}

interface RetirementData {
  planType: string;
  currentBalance: number;
  contributionRate: number;
  maxContributionRate: number;
  annualContribution: number;
  employerMatchPercent: number;
  employerMatchLimit: number;
  employerMatchYTD: number;
  vestingSchedule: VestingSchedule[];
  currentVested: number;
  investments: InvestmentAllocation[];
  ytdReturn: number;
  ytdReturnPercent: number;
  projectedBalance65: number;
}

const mockData: RetirementData = {
  planType: "401(k)",
  currentBalance: 187450.32,
  contributionRate: 12,
  maxContributionRate: 75,
  annualContribution: 19800,
  employerMatchPercent: 50,
  employerMatchLimit: 6,
  employerMatchYTD: 4950,
  vestingSchedule: [
    { year: 1, percentage: 25, vested: true },
    { year: 2, percentage: 50, vested: true },
    { year: 3, percentage: 75, vested: true },
    { year: 4, percentage: 100, vested: false },
  ],
  currentVested: 75,
  investments: [
    { name: "S&P 500 Index", percentage: 45, color: "#4F46E5", returnYTD: 12.4 },
    { name: "International Equity", percentage: 20, color: "#10B981", returnYTD: 8.7 },
    { name: "Bond Index", percentage: 20, color: "#F59E0B", returnYTD: 3.2 },
    { name: "Target Date 2055", percentage: 10, color: "#8B5CF6", returnYTD: 9.8 },
    { name: "REIT Fund", percentage: 5, color: "#EC4899", returnYTD: 5.1 },
  ],
  ytdReturn: 18234.56,
  ytdReturnPercent: 10.8,
  projectedBalance65: 2450000,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function RetirementDashboard() {
  const data = mockData;

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <PiggyBank className="w-6 h-6 text-celestial-indigo" />
          <div>
            <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">
              Retirement Dashboard
            </h1>
            <p className="text-sm text-silver-mist">{data.planType} Plan Summary</p>
          </div>
        </div>

        {/* Balance & Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 md:col-span-2 bg-gradient-to-br from-celestial-indigo/5 to-transparent">
            <p className="text-sm text-silver-mist mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-ink-black dark:text-pearl">
              {formatCurrency(data.currentBalance)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ArrowUpRight className="w-4 h-4 text-aurora-green" />
              <span className="text-sm text-aurora-green font-medium">
                +{formatCurrency(data.ytdReturn)} (+{data.ytdReturnPercent}%) YTD
              </span>
            </div>
            <p className="text-xs text-silver-mist mt-3">
              Projected at retirement (age 65): {formatCurrency(data.projectedBalance65)}
            </p>
          </div>
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <p className="text-sm text-silver-mist mb-1">Contribution Rate</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-bold text-celestial-indigo">{data.contributionRate}%</p>
              <p className="text-sm text-silver-mist">of salary</p>
            </div>
            <p className="text-xs text-silver-mist mt-2">
              {formatCurrency(data.annualContribution)}/year
            </p>
            <div className="mt-3 w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
              <div
                className="h-full rounded-full bg-celestial-indigo"
                style={{ width: `${(data.contributionRate / data.maxContributionRate) * 100}%` }}
              />
            </div>
            <p className="text-xs text-silver-mist mt-1">Max: {data.maxContributionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employer Match */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <h3 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-celestial-indigo" />
              Employer Match
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-silver-mist">Match Formula</span>
                <span className="text-sm font-medium text-ink-black dark:text-pearl">
                  {data.employerMatchPercent}% up to {data.employerMatchLimit}% of salary
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-silver-mist">Employer Match YTD</span>
                <span className="text-sm font-bold text-aurora-green">
                  {formatCurrency(data.employerMatchYTD)}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-aurora-green/5 border border-aurora-green/20">
                <p className="text-xs text-aurora-green">
                  You are maximizing your employer match. Keep it up!
                </p>
              </div>
            </div>
          </div>

          {/* Vesting Schedule */}
          <div className="rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
            <h3 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-celestial-indigo" />
              Vesting Schedule
            </h3>
            <div className="space-y-3">
              {data.vestingSchedule.map((vs) => (
                <div key={vs.year} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    vs.vested
                      ? "bg-aurora-green/10 text-aurora-green"
                      : "bg-cloud dark:bg-nebula-purple/20 text-silver-mist"
                  }`}>
                    {vs.year}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink-black dark:text-pearl">Year {vs.year}</span>
                      <span className={`text-sm font-medium ${vs.vested ? "text-aurora-green" : "text-silver-mist"}`}>
                        {vs.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-cloud dark:bg-nebula-purple/30">
                      <div
                        className={`h-full rounded-full ${vs.vested ? "bg-aurora-green" : "bg-silver-mist/30"}`}
                        style={{ width: `${vs.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-silver-mist pt-2 border-t border-cloud dark:border-nebula-purple/50">
                Currently {data.currentVested}% vested in employer contributions
              </p>
            </div>
          </div>
        </div>

        {/* Investment Allocation */}
        <div className="mt-6 rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="text-base font-semibold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-celestial-indigo" />
            Investment Allocation
          </h3>
          <div className="space-y-3">
            {data.investments.map((inv) => (
              <div key={inv.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: inv.color }} />
                <span className="text-sm text-ink-black dark:text-pearl flex-1">{inv.name}</span>
                <div className="w-32">
                  <div className="w-full h-2 rounded-full bg-cloud dark:bg-nebula-purple/30">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${inv.percentage}%`, backgroundColor: inv.color }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-ink-black dark:text-pearl w-12 text-right">
                  {inv.percentage}%
                </span>
                <span className={`text-xs font-medium w-16 text-right ${
                  inv.returnYTD >= 0 ? "text-aurora-green" : "text-red-500"
                }`}>
                  {inv.returnYTD >= 0 ? "+" : ""}{inv.returnYTD}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
