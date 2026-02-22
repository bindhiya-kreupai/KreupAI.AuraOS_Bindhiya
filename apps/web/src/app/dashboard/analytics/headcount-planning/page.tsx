"use client";

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Plus, Minus, Target, Calendar, Building2, ArrowUpRight, Loader2 } from 'lucide-react';

interface DeptPlan {
  department: string;
  currentHC: number;
  openReqs: number;
}

export default function HeadcountPlanningPage() {
  const [loading, setLoading] = useState(true);
  const [totalCurrent, setTotalCurrent] = useState(0);
  const [totalOpen, setTotalOpen] = useState(0);
  const [newHiresThisMonth, setNewHiresThisMonth] = useState(0);
  const [separationsThisMonth, setSeparationsThisMonth] = useState(0);
  const [deptPlans, setDeptPlans] = useState<DeptPlan[]>([]);
  const [trends, setTrends] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/v1/analytics/headcount');
      const json = await res.json();
      const data = json?.data;

      if (data) {
        setTotalCurrent(data.total || 0);
        setNewHiresThisMonth(data.newHires?.thisMonth || 0);
        setSeparationsThisMonth(data.separations?.thisMonth || 0);

        const depts = (data.byDepartment || []).map((d: any) => ({
          department: d.department,
          currentHC: d.count,
          openReqs: 0,
        }));
        setDeptPlans(depts);
        setTotalOpen(depts.reduce((s: number, d: DeptPlan) => s + d.openReqs, 0));
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Error loading headcount data:', error);
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

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">Headcount Planning</h1>
        <p className="text-sm text-silver-mist mt-1">Plan and forecast workforce needs across departments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Current Headcount</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{totalCurrent}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">New Hires (Month)</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{newHiresThisMonth}</p>
          <p className="text-[10px] text-emerald-600 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> this month</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Separations (Month)</p>
          <p className="text-2xl font-bold text-sunset-amber mt-1">{separationsThisMonth}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Net Growth</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{newHiresThisMonth - separationsThisMonth >= 0 ? '+' : ''}{newHiresThisMonth - separationsThisMonth}</p>
          <p className="text-[10px] text-silver-mist">this month</p>
        </div>
      </div>

      {trends.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Headcount Trend</h3>
          <div className="grid grid-cols-7 gap-3">
            {trends.map((t) => (
              <div key={t.month} className="text-center p-3 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                <p className="text-xs font-medium text-ink-black dark:text-pearl">{t.month}</p>
                <p className="text-sm font-bold text-celestial-indigo mt-1">{t.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {deptPlans.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-cloud dark:border-nebula-purple/50">
            <h3 className="font-bold text-sm text-ink-black dark:text-pearl">Department Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-silver-mist uppercase border-b border-cloud dark:border-nebula-purple/50">
                  <th className="text-left px-5 py-3 font-medium">Department</th>
                  <th className="text-right px-5 py-3 font-medium">Current HC</th>
                  <th className="text-right px-5 py-3 font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {deptPlans.map((dept) => (
                  <tr key={dept.department} className="border-b border-cloud dark:border-nebula-purple/50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-celestial-indigo" />
                        <span className="text-sm font-medium text-ink-black dark:text-pearl">{dept.department}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-ink-black dark:text-pearl">{dept.currentHC}</td>
                    <td className="px-5 py-3 text-sm text-right text-silver-mist">
                      {totalCurrent > 0 ? ((dept.currentHC / totalCurrent) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deptPlans.length === 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <Users className="w-8 h-8 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No headcount data available yet</p>
        </div>
      )}
    </div>
  );
}

