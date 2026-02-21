"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, BarChart3, Clock, ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';
import { StockGrantService } from '../services';

export default function EquityManagementPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await StockGrantService.getGrants();
      setGrants(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVested = grants.reduce((sum: number, g: any) => sum + (g.vestedShares || g.vestedUnits || g.sharesVested || 0), 0);
  const totalUnvested = grants.reduce((sum: number, g: any) => {
    const total = g.totalShares || g.numberOfUnits || g.grantedShares || 0;
    const vested = g.vestedShares || g.vestedUnits || g.sharesVested || 0;
    return sum + (total - vested);
  }, 0);
  const currentPrice = grants.length > 0 ? (grants[0].currentPrice || grants[0].fairMarketValue || 0) : 0;
  const totalValue = totalVested * currentPrice;
  const totalGain = grants.reduce((sum: number, g: any) => {
    const vested = g.vestedShares || g.vestedUnits || g.sharesVested || 0;
    const price = g.currentPrice || g.fairMarketValue || 0;
    const exercise = g.exercisePrice || g.grantPrice || g.strikePrice || 0;
    return sum + (vested * (price - exercise));
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Equity Management</h1>
        <p className="text-sm text-silver-mist mt-1">Track your stock options, RSUs, and vesting schedule</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Vested Value</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">
            {totalValue > 0 ? `$${(totalValue / 1000).toFixed(0)}K` : '--'}
          </p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Unrealized Gain</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {totalGain > 0 ? `$${(totalGain / 1000).toFixed(0)}K` : '--'}
          </p>
          <p className="text-[10px] text-silver-mist">On vested shares</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Vested Shares</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{totalVested > 0 ? totalVested.toLocaleString() : '--'}</p>
          <p className="text-[10px] text-silver-mist">{totalUnvested > 0 ? totalUnvested.toLocaleString() : '0'} unvested</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Current Share Price</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">
            {currentPrice > 0 ? `$${currentPrice.toFixed(2)}` : '--'}
          </p>
        </div>
      </div>

      {/* Grants Table */}
      <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Equity Grants</h3>
        </div>
        {grants.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No equity grants found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Grant Date</th>
                  <th className="text-right px-5 py-3 font-medium">Total</th>
                  <th className="text-right px-5 py-3 font-medium">Vested</th>
                  <th className="text-right px-5 py-3 font-medium">Exercise Price</th>
                  <th className="text-right px-5 py-3 font-medium">Value</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((grant: any) => {
                  const total = grant.totalShares || grant.numberOfUnits || grant.grantedShares || 0;
                  const vested = grant.vestedShares || grant.vestedUnits || grant.sharesVested || 0;
                  const vestPercent = total > 0 ? Math.round((vested / total) * 100) : 0;
                  const exercisePrice = grant.exercisePrice || grant.grantPrice || grant.strikePrice || 0;
                  const fmv = grant.currentPrice || grant.fairMarketValue || 0;
                  const type = grant.stockType || grant.type || 'Stock';
                  return (
                    <tr key={grant.id} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${type === 'RSU' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                          {type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-silver-mist">{grant.grantDate || '--'}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">{total.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm font-mono text-ink-black dark:text-pearl">{vested.toLocaleString()}</span>
                          <span className="text-[10px] text-silver-mist">({vestPercent}%)</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-ink-black dark:text-pearl">
                        {exercisePrice > 0 ? `$${exercisePrice.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono font-medium text-emerald-600">
                        ${(vested * (fmv - exercisePrice)).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          grant.status === 'vested' || grant.status === 'exercised' ? 'bg-emerald-100 text-emerald-700' :
                          grant.status === 'vesting' || grant.status === 'active' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {grant.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vesting Timeline */}
      {grants.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-3">Active Grants</h3>
          <div className="space-y-3">
            {grants.filter((g: any) => g.status !== 'exercised' && g.status !== 'forfeited').map((grant: any) => {
              const total = grant.totalShares || grant.numberOfUnits || grant.grantedShares || 0;
              const vested = grant.vestedShares || grant.vestedUnits || grant.sharesVested || 0;
              return (
                <div key={grant.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                  <Clock className="w-4 h-4 text-celestial-indigo flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-black dark:text-pearl">
                      {total - vested} {grant.stockType || 'shares'} unvested
                    </p>
                    <p className="text-xs text-silver-mist">{grant.grantCode || grant.grantDate || '--'}</p>
                  </div>
                  <span className="text-sm font-bold text-celestial-indigo">
                    {grant.totalValue ? `$${Number(grant.totalValue).toLocaleString()}` : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
