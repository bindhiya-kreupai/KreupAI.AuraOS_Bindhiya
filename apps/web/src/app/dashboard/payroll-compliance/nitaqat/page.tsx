"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Target,
  UserPlus,
  UserMinus,
  Building2,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

type NitaqatBand = 'PLATINUM' | 'GREEN_HIGH' | 'GREEN_MEDIUM' | 'GREEN_LOW' | 'YELLOW' | 'RED';

const bandColors: Record<NitaqatBand, { bg: string; text: string; border: string; name: string; nameAr: string }> = {
  PLATINUM: { bg: 'bg-gradient-to-r from-slate-300 to-slate-400', text: 'text-slate-900', border: 'border-slate-400', name: 'Platinum', nameAr: 'البلاتيني' },
  GREEN_HIGH: { bg: 'bg-gradient-to-r from-green-600 to-green-700', text: 'text-white', border: 'border-green-600', name: 'High Green', nameAr: 'الأخضر المرتفع' },
  GREEN_MEDIUM: { bg: 'bg-gradient-to-r from-green-500 to-green-600', text: 'text-white', border: 'border-green-500', name: 'Medium Green', nameAr: 'الأخضر المتوسط' },
  GREEN_LOW: { bg: 'bg-gradient-to-r from-green-400 to-green-500', text: 'text-white', border: 'border-green-400', name: 'Low Green', nameAr: 'الأخضر المنخفض' },
  YELLOW: { bg: 'bg-gradient-to-r from-amber-400 to-amber-500', text: 'text-white', border: 'border-amber-400', name: 'Yellow', nameAr: 'الأصفر' },
  RED: { bg: 'bg-gradient-to-r from-red-500 to-red-600', text: 'text-white', border: 'border-red-500', name: 'Red', nameAr: 'الأحمر' },
};

interface IndustryInfo {
  code: string;
  name: string;
  nameAr: string;
}

export default function NitaqatPage() {
  const [industry, setIndustry] = useState('47');
  const [saudiEmployees, setSaudiEmployees] = useState(25);
  const [nonSaudiEmployees, setNonSaudiEmployees] = useState(75);
  const [simulateSaudi, setSimulateSaudi] = useState(0);
  const [simulateNonSaudi, setSimulateNonSaudi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [industries, setIndustries] = useState<IndustryInfo[]>([]);
  const [apiBandColors, setApiBandColors] = useState<any>(null);
  const [currentStatus, setCurrentStatus] = useState<any>(null);
  const [simStatus, setSimStatus] = useState<any>(null);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Calculate status via API whenever inputs change
  useEffect(() => {
    if (!loading) {
      calculateStatus();
    }
  }, [saudiEmployees, nonSaudiEmployees, industry]);

  const fetchReferenceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/compliance/nitaqat');
      const result = await response.json();
      if (result.success) {
        setIndustries(result.data.industries || []);
        setApiBandColors(result.data.bandColors || null);
      } else {
        setError(result.error || 'Failed to load Nitaqat reference data');
      }
    } catch (err: any) {
      console.error('Error fetching Nitaqat data:', err);
      setError('Failed to connect to Nitaqat service');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = async () => {
    const totalEmployees = saudiEmployees + nonSaudiEmployees;
    if (totalEmployees === 0) return;

    try {
      const response = await fetch('/api/compliance/nitaqat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'default',
          industryCode: industry,
          industryName: industries.find(i => i.code === industry)?.name || 'Unknown',
          totalEmployees,
          saudiEmployees,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCurrentStatus(result.data);
      }
    } catch (err: any) {
      console.error('Error calculating Nitaqat status:', err);
    }
  };

  const handleSimulate = async () => {
    if (simulateSaudi === 0 && simulateNonSaudi === 0) {
      setSimStatus(null);
      return;
    }

    const totalEmployees = saudiEmployees + nonSaudiEmployees;
    const params = new URLSearchParams({
      action: 'simulate',
      companyId: 'default',
      industryCode: industry,
      industryName: industries.find(i => i.code === industry)?.name || 'Unknown',
      totalEmployees: totalEmployees.toString(),
      saudiEmployees: saudiEmployees.toString(),
      saudiChange: simulateSaudi.toString(),
      nonSaudiChange: simulateNonSaudi.toString(),
    });

    try {
      const response = await fetch(`/api/compliance/nitaqat?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setSimStatus(result.data);
      }
    } catch (err: any) {
      console.error('Error simulating Nitaqat:', err);
    }
  };

  // Trigger simulation when simulate values change
  useEffect(() => {
    handleSimulate();
  }, [simulateSaudi, simulateNonSaudi]);

  const totalEmployees = saudiEmployees + nonSaudiEmployees;
  const currentRatio = totalEmployees > 0 ? (saudiEmployees / totalEmployees) * 100 : 0;

  // Use API status band if available, otherwise fallback to local calculation
  const currentBand: NitaqatBand = currentStatus?.status?.band || (() => {
    if (currentRatio >= 40) return 'PLATINUM';
    if (currentRatio >= 27) return 'GREEN_HIGH';
    if (currentRatio >= 20) return 'GREEN_MEDIUM';
    if (currentRatio >= 10) return 'GREEN_LOW';
    if (currentRatio >= 5) return 'YELLOW';
    return 'RED';
  })();
  const bandInfo = bandColors[currentBand];

  // Simulation
  const simTotalEmployees = saudiEmployees + simulateSaudi + nonSaudiEmployees + simulateNonSaudi;
  const simSaudiEmployees = saudiEmployees + simulateSaudi;
  const simRatio = simTotalEmployees > 0 ? (simSaudiEmployees / simTotalEmployees) * 100 : 0;
  const simBand: NitaqatBand = simStatus?.simulated?.band || (() => {
    if (simRatio >= 40) return 'PLATINUM';
    if (simRatio >= 27) return 'GREEN_HIGH';
    if (simRatio >= 20) return 'GREEN_MEDIUM';
    if (simRatio >= 10) return 'GREEN_LOW';
    if (simRatio >= 5) return 'YELLOW';
    return 'RED';
  })();
  const simBandInfo = bandColors[simBand];

  // Calculate how many Saudis needed for next band
  const getNextBandTarget = (band: NitaqatBand): { target: number; needed: number } => {
    const thresholds: Record<NitaqatBand, number> = {
      PLATINUM: 40,
      GREEN_HIGH: 40,
      GREEN_MEDIUM: 27,
      GREEN_LOW: 20,
      YELLOW: 10,
      RED: 5,
    };
    const target = thresholds[band];
    const needed = Math.ceil((target / 100) * totalEmployees) - saudiEmployees;
    return { target, needed: Math.max(0, needed) };
  };

  const nextBandInfo = getNextBandTarget(currentBand);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-slate-500">Loading Nitaqat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/payroll-compliance" className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Compliance
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Users className="w-7 h-7 text-green-500" />
            Nitaqat - Saudization
            <span className="text-sm font-normal text-slate-500 mr-2">|</span>
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-400" dir="rtl">نطاقات - التوطين</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track and manage Saudi workforce nationalization ratios
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <span className="text-xl">🇸🇦</span>
          <span className="font-medium text-green-700 dark:text-green-400">Saudi Arabia</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-sm">Dismiss</button>
        </div>
      )}

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Band Status */}
        <div className={`${bandInfo.bg} ${bandInfo.text} rounded-2xl p-6`}>
          <div className="text-sm opacity-90 mb-2">Current Nitaqat Band</div>
          <div className="text-3xl font-bold mb-1">{bandInfo.name}</div>
          <div className="text-lg opacity-90" dir="rtl">{bandInfo.nameAr}</div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-sm opacity-90">Saudization Ratio</div>
            <div className="text-2xl font-bold">{currentRatio.toFixed(1)}%</div>
          </div>
        </div>

        {/* Employee Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="text-sm text-slate-500 mb-4">Workforce Composition</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Saudi Employees</div>
                  <div className="text-sm text-slate-500" dir="rtl">موظفون سعوديون</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">{saudiEmployees}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Non-Saudi Employees</div>
                  <div className="text-sm text-slate-500" dir="rtl">موظفون غير سعوديين</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{nonSaudiEmployees}</div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="font-medium">Total Employees</div>
              <div className="text-2xl font-bold">{totalEmployees}</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="text-sm text-slate-500 mb-4">Recommendations | <span dir="rtl">التوصيات</span></div>
          {currentBand === 'PLATINUM' ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <div className="font-medium text-green-700 dark:text-green-400">Excellent Status!</div>
                <div className="text-sm text-green-600">Maintain current ratio to keep Platinum status</div>
                <div className="text-sm text-green-500 mt-1" dir="rtl">حافظ على النسبة الحالية للبقاء في البلاتيني</div>
              </div>
            </div>
          ) : currentBand === 'RED' || currentBand === 'YELLOW' ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <div className="font-medium text-red-700 dark:text-red-400">Action Required</div>
                <div className="text-sm text-red-600">
                  Hire {nextBandInfo.needed} Saudi employees to improve band
                </div>
                <div className="text-sm text-red-500 mt-1" dir="rtl">
                  وظّف {nextBandInfo.needed} موظف سعودي لتحسين النطاق
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Target className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-400">Room for Improvement</div>
                <div className="text-sm text-blue-600">
                  Hire {nextBandInfo.needed} more Saudis to reach next band
                </div>
                <div className="text-sm text-blue-500 mt-1" dir="rtl">
                  وظّف {nextBandInfo.needed} سعودي للوصول للنطاق التالي
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-6 text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Workforce Simulator
          <span className="text-sm font-normal text-slate-500 mr-2">|</span>
          <span className="text-base font-medium text-slate-600 dark:text-slate-400" dir="rtl">محاكاة القوى العاملة</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Industry | <span dir="rtl">الصناعة</span>
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
            >
              {industries.length > 0 ? industries.map((ind) => (
                <option key={ind.code} value={ind.code}>
                  {ind.name} {ind.nameAr ? `| ${ind.nameAr}` : ''}
                </option>
              )) : (
                <>
                  <option value="47">Retail Trade</option>
                  <option value="41">Construction</option>
                  <option value="62">IT & Technology</option>
                  <option value="55">Hospitality</option>
                  <option value="86">Healthcare</option>
                  <option value="64">Financial Services</option>
                </>
              )}
            </select>
          </div>

          {/* Current Employees */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Saudi Employees
            </label>
            <input
              type="number"
              value={saudiEmployees}
              onChange={(e) => setSaudiEmployees(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Non-Saudi Employees
            </label>
            <input
              type="number"
              value={nonSaudiEmployees}
              onChange={(e) => setNonSaudiEmployees(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
            />
          </div>

          {/* Simulation Actions */}
          <div className="flex flex-col justify-end gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setSimulateSaudi(s => s + 1)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-200"
              >
                <UserPlus className="w-4 h-4" />
                +Saudi
              </button>
              <button
                onClick={() => setSimulateNonSaudi(s => s - 1)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200"
              >
                <UserMinus className="w-4 h-4" />
                -Non-Saudi
              </button>
            </div>
            <button
              onClick={() => { setSimulateSaudi(0); setSimulateNonSaudi(0); setSimStatus(null); }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200"
            >
              Reset Simulation
            </button>
          </div>
        </div>

        {/* Simulation Result */}
        {(simulateSaudi !== 0 || simulateNonSaudi !== 0) && (
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">Simulated Changes</div>
                <div className="font-medium">
                  {simulateSaudi !== 0 && <span className={simulateSaudi > 0 ? 'text-green-600' : 'text-red-600'}>{simulateSaudi > 0 ? '+' : ''}{simulateSaudi} Saudi</span>}
                  {simulateSaudi !== 0 && simulateNonSaudi !== 0 && ', '}
                  {simulateNonSaudi !== 0 && <span className={simulateNonSaudi > 0 ? 'text-blue-600' : 'text-amber-600'}>{simulateNonSaudi > 0 ? '+' : ''}{simulateNonSaudi} Non-Saudi</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-sm text-slate-500">New Ratio</div>
                  <div className="text-xl font-bold">{simRatio.toFixed(1)}%</div>
                </div>
                <div className={`px-4 py-2 rounded-xl ${simBandInfo.bg} ${simBandInfo.text}`}>
                  <div className="text-sm opacity-90">New Band</div>
                  <div className="font-bold">{simBandInfo.name}</div>
                </div>
                {simBand !== currentBand && (
                  <div className="flex items-center gap-1">
                    {['PLATINUM', 'GREEN_HIGH', 'GREEN_MEDIUM'].includes(simBand) ? (
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Band Scale */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
          Nitaqat Bands | <span dir="rtl">نطاقات التصنيف</span>
        </h2>
        <div className="flex gap-1 h-12 rounded-xl overflow-hidden">
          {Object.entries(bandColors).map(([band, info]) => (
            <div
              key={band}
              className={`flex-1 ${info.bg} ${info.text} flex items-center justify-center text-sm font-medium ${
                band === currentBand ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''
              }`}
            >
              {info.name}
            </div>
          ))}
        </div>
        <div className="flex mt-2 text-xs text-slate-500">
          <div className="flex-1 text-center">&lt;5%</div>
          <div className="flex-1 text-center">5-10%</div>
          <div className="flex-1 text-center">10-20%</div>
          <div className="flex-1 text-center">20-27%</div>
          <div className="flex-1 text-center">27-40%</div>
          <div className="flex-1 text-center">&gt;40%</div>
        </div>
      </div>
    </div>
  );
}

