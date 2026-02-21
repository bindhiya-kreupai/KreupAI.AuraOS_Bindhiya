"use client";

import React, { useState, useEffect } from 'react';
import { TrendingDown, Users, AlertTriangle, BarChart3, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';

interface DeptTurnover {
  department: string;
  rate: number;
  voluntary: number;
  involuntary: number;
}

export default function TurnoverAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [overallRate, setOverallRate] = useState(0);
  const [voluntaryRate, setVoluntaryRate] = useState(0);
  const [involuntaryRate, setInvoluntaryRate] = useState(0);
  const [deptData, setDeptData] = useState<DeptTurnover[]>([]);
  const [exitReasons, setExitReasons] = useState<{ reason: string; count: number; percent: number }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; separations: number }[]>([]);
  const [costData, setCostData] = useState({ avgCost: 0, totalYTD: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/v1/analytics/turnover');
      const json = await res.json();
      const data = json?.data;

      if (data) {
        setOverallRate(data.overall?.turnoverRate ?? 0);
        setVoluntaryRate(data.overall?.voluntaryRate ?? 0);
        setInvoluntaryRate(data.overall?.involuntaryRate ?? 0);
        setDeptData(
          (data.byDepartment || []).map((d: any) => ({
            department: d.department,
            rate: d.rate,
            voluntary: d.voluntary,
            involuntary: d.involuntary,
          }))
        );
        setExitReasons(
          (data.reasons || []).slice(0, 6).map((r: any) => ({
            reason: r.reason,
            count: r.count,
            percent: r.percentage,
          }))
        );
        setMonthlyTrend(
          (data.monthlyTrend || []).map((m: any) => ({
            month: m.month.split('-')[1] || m.month,
            separations: m.separations,
          }))
        );
        setCostData({
          avgCost: data.costOfTurnover?.averageCostPerEmployee ?? 0,
          totalYTD: data.costOfTurnover?.totalCostYTD ?? 0,
        });
      }
    } catch (error) {
      console.error('Error loading turnover data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-celestial-indigo" />
      </div>
    );
  }

  const maxSeparations = Math.max(...monthlyTrend.map((m) => m.separations), 1);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Turnover Analysis</h1>
        <p className="text-sm text-silver-mist mt-1">Understand attrition patterns and retention insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Overall Turnover</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{overallRate}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Voluntary Rate</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{voluntaryRate}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Involuntary Rate</p>
          <p className="text-2xl font-bold text-silver-mist mt-1">{involuntaryRate}%</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Cost of Turnover (YTD)</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">${(costData.totalYTD / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-silver-mist">Avg: ${(costData.avgCost / 1000).toFixed(0)}K per exit</p>
        </div>
      </div>

      {monthlyTrend.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Monthly Exits</h3>
          <div className="flex items-end gap-3 h-32">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-ink-black dark:text-pearl">{m.separations}</span>
                <div className="w-full flex flex-col items-center justify-end h-20">
                  <div
                    className="w-full rounded-t bg-coral-alert/70"
                    style={{ height: `${(m.separations / maxSeparations) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-silver-mist">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {deptData.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Department Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-5 py-3 font-medium">Department</th>
                  <th className="text-right px-5 py-3 font-medium">Rate</th>
                  <th className="text-right px-5 py-3 font-medium">Voluntary</th>
                  <th className="text-right px-5 py-3 font-medium">Involuntary</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((dept) => (
                  <tr key={dept.department} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <span className={`font-bold ${dept.rate > 15 ? 'text-coral-alert' : dept.rate > 10 ? 'text-sunset-amber' : 'text-emerald-600'}`}>
                        {dept.rate}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.voluntary}%</td>
                    <td className="px-5 py-3 text-sm text-right text-silver-mist">{dept.involuntary}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {exitReasons.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Top Exit Reasons</h3>
          <div className="space-y-3">
            {exitReasons.map((item) => (
              <div key={item.reason} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-ink-black dark:text-pearl">{item.reason}</span>
                    <span className="text-xs text-silver-mist">{item.count} exits ({item.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div className="h-full bg-coral-alert/60 rounded-full" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deptData.length === 0 && exitReasons.length === 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <TrendingDown className="w-8 h-8 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No turnover data available yet</p>
        </div>
      )}
    </div>
  );
}
