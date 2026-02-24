"use client";

import React, { useState } from "react";
import { Award, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";

interface VestingEvent {
  date: string;
  shares: number;
  vested: boolean;
}

interface EquityGrant {
  id: string;
  grantDate: string;
  totalShares: number;
  vestedShares: number;
  unvestedShares: number;
  vestingSchedule: string;
  cliffDate: string;
  currentSharePrice: number;
  grantPrice: number;
  vestingEvents: VestingEvent[];
}

const mockGrants: EquityGrant[] = [
  {
    id: "grant-1",
    grantDate: "2023-03-01",
    totalShares: 5000,
    vestedShares: 2500,
    unvestedShares: 2500,
    vestingSchedule: "4 years, 1 year cliff, monthly vesting",
    cliffDate: "2024-03-01",
    currentSharePrice: 45.50,
    grantPrice: 28.00,
    vestingEvents: [
      { date: "2024-03-01", shares: 1250, vested: true },
      { date: "2025-03-01", shares: 1250, vested: true },
      { date: "2026-03-01", shares: 1250, vested: false },
      { date: "2027-03-01", shares: 1250, vested: false },
    ],
  },
  {
    id: "grant-2",
    grantDate: "2025-01-15",
    totalShares: 3000,
    vestedShares: 750,
    unvestedShares: 2250,
    vestingSchedule: "4 years, 1 year cliff, monthly vesting",
    cliffDate: "2026-01-15",
    currentSharePrice: 45.50,
    grantPrice: 38.00,
    vestingEvents: [
      { date: "2026-01-15", shares: 750, vested: true },
      { date: "2027-01-15", shares: 750, vested: false },
      { date: "2028-01-15", shares: 750, vested: false },
      { date: "2029-01-15", shares: 750, vested: false },
    ],
  },
];

export function EquityManagement() {
  const [selectedGrant, setSelectedGrant] = useState<string>(mockGrants[0].id);

  const totalVestedShares = mockGrants.reduce((s, g) => s + g.vestedShares, 0);
  const totalUnvestedShares = mockGrants.reduce((s, g) => s + g.unvestedShares, 0);
  const totalShares = totalVestedShares + totalUnvestedShares;
  const currentPrice = mockGrants[0].currentSharePrice;
  const totalCurrentValue = totalShares * currentPrice;
  const totalVestedValue = totalVestedShares * currentPrice;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Equity Management</h2>
        <p className="text-sm text-silver-mist mt-1">View and track your equity grants and vesting schedule.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Shares</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{totalShares.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Vested</span>
          </div>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{totalVestedShares.toLocaleString()}</p>
          <p className="text-xs text-silver-mist">{((totalVestedShares / totalShares) * 100).toFixed(0)}% of total</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-silver-mist uppercase font-medium">Unvested</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">{totalUnvestedShares.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-celestial-indigo" />
            <span className="text-xs text-silver-mist uppercase font-medium">Total Value</span>
          </div>
          <p className="text-xl font-bold text-ink-black dark:text-pearl">${(totalCurrentValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-silver-mist">@ ${currentPrice}/share</p>
        </div>
      </div>

      {/* Grants List */}
      <div className="space-y-4">
        {mockGrants.map((grant) => {
          const vestedPercent = (grant.vestedShares / grant.totalShares) * 100;
          const grantValue = grant.totalShares * grant.currentSharePrice;
          const vestedValue = grant.vestedShares * grant.currentSharePrice;
          const unrealizedGain = (grant.currentSharePrice - grant.grantPrice) * grant.vestedShares;
          const isExpanded = selectedGrant === grant.id;

          return (
            <div
              key={grant.id}
              className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setSelectedGrant(isExpanded ? "" : grant.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-celestial-indigo" />
                      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
                        Grant - {new Date(grant.grantDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </h3>
                    </div>
                    <p className="text-xs text-silver-mist mt-0.5">{grant.vestingSchedule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink-black dark:text-pearl">
                      {grant.totalShares.toLocaleString()} shares
                    </p>
                    <p className="text-xs text-silver-mist">
                      Value: ${(grantValue / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>

                {/* Vesting Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-silver-mist">Vesting Progress</span>
                    <span className="font-medium text-ink-black dark:text-pearl">{vestedPercent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-50 dark:bg-deep-cosmos overflow-hidden">
                    <div
                      className="h-full rounded-full bg-celestial-indigo transition-all"
                      style={{ width: `${vestedPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-silver-mist">
                    <span>{grant.vestedShares.toLocaleString()} vested</span>
                    <span>{grant.unvestedShares.toLocaleString()} unvested</span>
                  </div>
                </div>
              </div>

              {/* Expanded Timeline */}
              {isExpanded && (
                <div className="border-t border-cloud dark:border-nebula-purple/50 p-4 bg-slate-50 dark:bg-deep-cosmos">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-silver-mist">Grant Price</p>
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">${grant.grantPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-mist">Vested Value</p>
                      <p className="text-sm font-medium text-ink-black dark:text-pearl">${vestedValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-silver-mist">Unrealized Gain (Vested)</p>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        +${unrealizedGain.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-ink-black dark:text-pearl mb-3 uppercase tracking-wide">
                    Vesting Timeline
                  </h4>
                  <div className="space-y-2">
                    {grant.vestingEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          event.vested ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"
                        }`} />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-silver-mist" />
                            <span className="text-xs text-ink-black dark:text-pearl">
                              {new Date(event.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-ink-black dark:text-pearl">
                              {event.shares.toLocaleString()} shares
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              event.vested
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                : "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                            }`}>
                              {event.vested ? "Vested" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
