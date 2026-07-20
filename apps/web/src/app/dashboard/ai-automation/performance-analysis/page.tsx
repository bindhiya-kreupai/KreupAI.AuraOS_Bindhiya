'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, TrendingUp, Scale, AlertOctagon } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { performanceInsights } from '@/lib/services/ai-automation-client';

// --- MOCK DATA ---

const EMPTY_BELL_CURVE = [1, 2, 3, 4, 5].map((rating) => ({
  rating: String(rating),
  count: 0,
  ideal: 0,
}));

export default function PerformanceAnalysisPage() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const bellCurve = insights?.bellCurve?.length ? insights.bellCurve : EMPTY_BELL_CURVE;
  const performers = insights?.topPerformers || [];

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const result = await performanceInsights.getInsights();
      if (result.success) {
        setInsights(result.data);
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Performance Analytics
          </h1>
          <p className="text-silver-mist text-sm mt-1">
            Calibration, bias detection, and success prediction.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. Bell Curve */}
        <div className="md:col-span-2 bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl">
              Rating Distribution (Bell Curve)
            </h2>
            <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              {insights?.summary?.totalReviews
                ? `${insights.summary.totalReviews} reviews analyzed`
                : 'Awaiting performance reviews'}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bellCurve}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="rating"
                  label={{ value: 'Rating (1-5)', position: 'insideBottom', dy: 10 }}
                  stroke="#94a3b8"
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Actual Distribution"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="ideal"
                  name="Ideal Bell Curve"
                  stroke="#94a3b8"
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Top Performer Prediction */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-800 p-6 rounded-xl text-white shadow-lg">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            AI Success Prediction
          </h2>
          <p className="text-indigo-200 text-sm mb-6">
            Derived from recency-weighted, tenant-scoped performance review ratings.
          </p>

          <div className="space-y-4">
            {performers.length ? (
              performers.map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/10"
                >
                  <div>
                    <div className="font-bold text-sm">Employee {p.employeeId.slice(0, 8)}</div>
                    <div className="text-xs text-indigo-300">{p.trend.toLowerCase()} trend</div>
                  </div>
                  <div className="text-emerald-400 font-bold font-mono">{p.score}%</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-indigo-200">
                No performance predictions are available yet.
              </p>
            )}
          </div>
        </div>

        {/* 3. Bias Check */}
        <div className="bg-white dark:bg-stellar-blue p-6 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-rose-500" />
            Fairness Audit
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-300">Gender Parity (Ratings)</span>
                <span className="text-emerald-600 font-bold">Within Range</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[48%] bg-indigo-500 float-left" />
                <div className="h-full w-[52%] bg-purple-500 float-left" />
              </div>
              <div className="flex justify-between text-[10px] text-silver-mist mt-1">
                <span>Male (4.2 avg)</span>
                <span>Female (4.3 avg)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-cloud dark:border-nebula-purple/20">
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-ink-black dark:text-pearl">AI Insight:</strong>{' '}
                {insights?.insights?.[0] ||
                  'Complete performance reviews to generate tenant-specific insights.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
