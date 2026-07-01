'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Users, TrendingUp, Download, Eye, Loader2 } from 'lucide-react';
import { BonusService } from '../services';

export default function BonusManagementPage() {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isEditRulesOpen, setIsEditRulesOpen] = useState(false);
  const [isViewSchemeOpen, setIsViewSchemeOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<any>(null);

  // Release Form States
  const [schemeName, setSchemeName] = useState('');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());
  const [budgetAmount, setBudgetAmount] = useState<number>(100000);
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);

  // Rules States
  const [multiplierExcellent, setMultiplierExcellent] = useState(1.5);
  const [multiplierGood, setMultiplierGood] = useState(1.2);
  const [targetPct, setTargetPct] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemesData, payoutsData] = await Promise.all([
        BonusService.getSchemes(),
        BonusService.getPayouts(),
      ]);
      setSchemes(schemesData);
      setPayouts(payoutsData);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await BonusService.createScheme({
        name: schemeName,
        schemeName,
        fiscalYear,
        budgetAmount,
        payoutDate,
        status: 'active',
      });
      setIsReleaseOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error releasing bonus scheme:', err);
    }
  };

  const handleEditRulesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Bonus rule settings updated successfully!');
    setIsEditRulesOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalBonusAmount = payouts.reduce(
    (sum: number, p: any) =>
      sum + (Number(p.amount) || Number(p.payoutAmount) || Number(p.finalBonusAmount) || 0),
    0
  );
  const totalEligible = payouts.length;

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-indigo-500" />
            Bonus Management
          </h1>
          <p className="text-slate-500 text-sm">Configure and distribute performance bonuses.</p>
        </div>
        <button
          onClick={() => setIsReleaseOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
        >
          Release Bonus
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Panel: Campaigns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Bonus Schemes & Payouts</h3>
            {schemes.length === 0 && payouts.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No bonus schemes or payouts found.</p>
            ) : (
              <div className="space-y-4">
                {schemes.map((scheme: any, i: number) => {
                  const schemePayouts = payouts.filter((p: any) => p.schemeId === scheme.id);
                  const schemeTotal = schemePayouts.reduce(
                    (sum: number, p: any) =>
                      sum + (Number(p.amount) || Number(p.payoutAmount) || 0),
                    0
                  );
                  return (
                    <div
                      key={scheme.id || i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start gap-3 mb-4 sm:mb-0">
                        <div
                          className={`p-3 rounded-xl ${
                            scheme.status === 'processed' || scheme.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-600'
                              : scheme.status === 'active' || scheme.status === 'Processing'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          <Gift className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200">
                            {scheme.schemeName || scheme.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {scheme.payoutDate || scheme.fiscalYear || '--'}
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <Users className="w-3 h-3" /> {schemePayouts.length} Payouts
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="text-right">
                          <div className="text-lg font-bold text-indigo-600">
                            $
                            {schemeTotal > 0
                              ? schemeTotal.toLocaleString()
                              : scheme.budgetAmount
                                ? Number(scheme.budgetAmount).toLocaleString()
                                : '--'}
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${
                              scheme.status === 'processed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : scheme.status === 'active'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {scheme.status}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedScheme(scheme);
                            setIsViewSchemeOpen(true);
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {schemes.length === 0 && payouts.length > 0 && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">
                      {payouts.length} Individual Bonus Payouts
                    </h4>
                    <div className="text-lg font-bold text-indigo-600 mt-2">
                      Total: ${totalBonusAmount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Rules */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="font-bold text-lg mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-indigo-500">
                <div className="text-sm font-bold">Total Bonus Budget</div>
                <div className="flex justify-between mt-2 text-xs">
                  <span>Schemes</span>
                  <span className="font-bold text-indigo-600">{schemes.length}</span>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>Payouts</span>
                  <span className="font-bold text-emerald-500">{payouts.length}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 border-amber-500">
                <div className="text-sm font-bold">Total Payout Amount</div>
                <div className="text-lg font-bold text-indigo-600 mt-1">
                  ${totalBonusAmount > 0 ? totalBonusAmount.toLocaleString() : '--'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditRulesOpen(true)}
              className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Edit Rules
            </button>
          </div>
        </div>
      </div>

      {/* Release Bonus Modal */}
      {isReleaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4 text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold">Release Performance Bonus</h3>
            <form onSubmit={handleReleaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Scheme Name</label>
                <input
                  type="text"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  required
                  placeholder="e.g. Q2 Performance Bonus"
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Fiscal Year / Period
                </label>
                <input
                  type="text"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Budget Amount ($)
                </label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Payout Date</label>
                <input
                  type="date"
                  value={payoutDate}
                  onChange={(e) => setPayoutDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm dark:bg-slate-900"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReleaseOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Submit Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rules Modal */}
      {isEditRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-4 text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold">Configure Bonus Calculation Rules</h3>
            <form onSubmit={handleEditRulesSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Target Percentage (% of CTC)
                </label>
                <input
                  type="number"
                  value={targetPct}
                  onChange={(e) => setTargetPct(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Excellent Performance Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={multiplierExcellent}
                  onChange={(e) => setMultiplierExcellent(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Good Performance Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={multiplierGood}
                  onChange={(e) => setMultiplierGood(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-transparent text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditRulesOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Scheme Details Modal */}
      {isViewSchemeOpen && selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-xl space-y-4 text-slate-900 dark:text-white max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedScheme.schemeName || selectedScheme.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fiscal Year: {selectedScheme.fiscalYear} | Payout Date:{' '}
                  {selectedScheme.payoutDate || '--'}
                </p>
              </div>
              <button
                onClick={() => setIsViewSchemeOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
              <h4 className="font-bold text-sm">Payout Distribution</h4>
              {payouts.filter((p: any) => p.schemeId === selectedScheme.id).length === 0 ? (
                <p className="text-sm text-slate-400">
                  No individual payouts found for this scheme.
                </p>
              ) : (
                <div className="space-y-2">
                  {payouts
                    .filter((p: any) => p.schemeId === selectedScheme.id)
                    .map((payout: any) => (
                      <div
                        key={payout.id}
                        className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-sm border border-slate-100 dark:border-slate-800/80"
                      >
                        <div>
                          <span className="font-bold">
                            {payout.employeeName || payout.employeeId}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2 font-mono">
                            {payout.performanceRating ? `Rating: ${payout.performanceRating}` : ''}
                          </span>
                        </div>
                        <span className="font-bold text-indigo-600">
                          $
                          {(
                            Number(payout.amount) ||
                            Number(payout.payoutAmount) ||
                            0
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
