'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, TrendingUp, PieChart, PlusCircle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const Skeleton = () => (
  <div className="animate-pulse space-y-4 w-full h-full">
    <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="p-6 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
    <p className="font-bold">Error loading portfolios</p>
    <p className="text-sm">{message}</p>
  </div>
);

export default function WealthManagementPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [clientName, setClientName] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [portfolioType, setPortfolioType] = useState('Growth');

  const {
    data: portfolios,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['wealthPortfolios'],
    queryFn: async () => {
      const res = await fetch('/api/financial-services/wealth/portfolios');
      if (!res.ok) throw new Error('Failed to fetch portfolios');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPortfolio: any) => {
      const res = await fetch('/api/financial-services/wealth/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPortfolio),
      });
      if (!res.ok) throw new Error('Failed to create portfolio');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealthPortfolios'] });
      toast.success('Portfolio created successfully!');
      setIsModalOpen(false);
      setClientName('');
      setTotalValue('');
    },
    onError: () => {
      toast.error('Failed to create portfolio');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/financial-services/wealth/portfolios/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete portfolio');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealthPortfolios'] });
      toast.success('Portfolio deleted');
    },
    onError: () => {
      toast.error('Failed to delete portfolio');
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!totalValue || isNaN(Number(totalValue))) {
      toast.error('Please enter a valid amount');
      return;
    }

    createMutation.mutate({
      clientName: clientName || 'New Client',
      totalValue: Number(totalValue),
      portfolioType,
    });
  };

  // Derived Metrics
  let totalAUM = 0;
  let weightedYtd = 0;
  const allocSum: Record<string, number> = {
    Equities: 0,
    'Fixed Income': 0,
    Alternatives: 0,
    Cash: 0,
  };

  if (portfolios && portfolios.length > 0) {
    portfolios.forEach((p: any) => {
      const val = Number(p.totalValue) || 0;
      totalAUM += val;

      const ytd = p.performance?.ytdReturn || 0;
      weightedYtd += val * ytd;

      if (p.assetAllocation && Array.isArray(p.assetAllocation)) {
        p.assetAllocation.forEach((a: any) => {
          if (allocSum[a.assetClass] !== undefined) {
            allocSum[a.assetClass] += (Number(a.percentage) * val) / 100;
          } else {
            allocSum['Alternatives'] += (Number(a.percentage) * val) / 100; // lump others into alternatives
          }
        });
      }
    });
  }

  const avgYtdReturn = totalAUM > 0 ? weightedYtd / totalAUM : 0;

  const typicalAllocation = [
    {
      class: 'Equities',
      val: totalAUM ? ((allocSum['Equities'] / totalAUM) * 100).toFixed(1) + '%' : '0%',
      color: 'bg-indigo-500',
    },
    {
      class: 'Fixed Income',
      val: totalAUM ? ((allocSum['Fixed Income'] / totalAUM) * 100).toFixed(1) + '%' : '0%',
      color: 'bg-emerald-500',
    },
    {
      class: 'Alternatives',
      val: totalAUM ? ((allocSum['Alternatives'] / totalAUM) * 100).toFixed(1) + '%' : '0%',
      color: 'bg-amber-500',
    },
    {
      class: 'Cash',
      val: totalAUM ? ((allocSum['Cash'] / totalAUM) * 100).toFixed(1) + '%' : '0%',
      color: 'bg-slate-500',
    },
  ];

  // Generate historical graph based strictly on YTD (no random noise)
  const currentAUM = totalAUM;
  const startAUM = currentAUM / (1 + avgYtdReturn / 100);
  const monthlyData = Array.from({ length: 12 }).map((_, i) => {
    // Interpolate linearly from startAUM to currentAUM
    return startAUM + (currentAUM - startAUM) * (i / 11);
  });

  // Scale for percentage heights (0 to 100 for the max value)
  const maxAUM = Math.max(...monthlyData, currentAUM) * 1.1 || 1; // +10% padding
  const chartHeights = monthlyData.map((val) => (val / maxAUM) * 100);

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Wealth Management
          </h1>
          <p className="text-slate-500 text-sm">
            Manage client portfolios and investment strategies.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> New Portfolio
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Portfolio Performance Overview</h3>
              <div
                className={`flex items-center gap-2 font-bold px-3 py-1 rounded-lg ${avgYtdReturn >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}
              >
                <TrendingUp className={`w-4 h-4 ${avgYtdReturn < 0 ? 'rotate-180' : ''}`} />
                {isLoading
                  ? '...'
                  : `${avgYtdReturn > 0 ? '+' : ''}${avgYtdReturn.toFixed(1)}% YTD`}
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-1 px-4">
              {chartHeights.map((heightPercent, i) => {
                const valStr =
                  monthlyData[i] >= 1000000
                    ? `$${(monthlyData[i] / 1000000).toFixed(1)}M`
                    : `$${(monthlyData[i] / 1000).toFixed(0)}k`;

                return (
                  <div
                    key={i}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm relative group"
                  >
                    <div
                      className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <div className="invisible group-hover:visible absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-1 rounded z-10 font-bold whitespace-nowrap">
                      {valStr}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg mb-4">Active Portfolios</h3>
            {isLoading && <Skeleton />}
            {error && <ErrorState message={(error as Error).message} />}

            {!isLoading && !error && portfolios?.length === 0 && (
              <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
                No portfolios found.
              </div>
            )}

            {!isLoading && !error && portfolios?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolios.map((portfolio: any) => (
                  <div
                    key={portfolio.portfolioId}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{portfolio.clientName}</div>
                        <div className="text-xs text-slate-500">{portfolio.portfolioId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600">
                          ${Number(portfolio.totalValue).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">{portfolio.portfolioType}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(portfolio.portfolioId)}
                      disabled={deleteMutation.isPending}
                      className="absolute top-2 right-1/2 translate-x-1/2 p-2 bg-rose-100 text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-200 disabled:opacity-50"
                      title="Delete portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-xs font-bold opacity-80 uppercase mb-1">Total AUM</div>
              <div className="text-3xl font-bold">
                {isLoading
                  ? '...'
                  : `$${(portfolios?.reduce((acc: number, curr: any) => acc + Number(curr.totalValue), 0) / 1000000).toFixed(1)}M`}
              </div>
              <div className="text-xs opacity-80 mt-4 pt-4 border-t border-indigo-500">
                {isLoading ? '...' : portfolios?.length || 0} Managed Portfolios
              </div>
            </div>
            <PieChart className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 text-white" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-sm mb-4 uppercase text-slate-500">Typical Allocation</h3>
            <div className="space-y-3">
              {typicalAllocation.map((asset, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{asset.class}</span>
                    <span>{isLoading ? '...' : asset.val}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${asset.color}`}
                      style={{ width: asset.val === 'NaN%' ? '0%' : asset.val }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Portfolio Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg">New Portfolio</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Total Value ($)
                </label>
                <input
                  type="number"
                  value={totalValue}
                  onChange={(e) => setTotalValue(e.target.value)}
                  placeholder="500000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Portfolio Type
                </label>
                <select
                  value={portfolioType}
                  onChange={(e) => setPortfolioType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Growth">Growth</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Aggressive">Aggressive</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Income">Income</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Submit Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
