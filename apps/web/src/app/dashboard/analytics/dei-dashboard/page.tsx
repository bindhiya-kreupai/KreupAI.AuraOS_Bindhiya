"use client";

import React, { useState, useEffect } from 'react';
import { Users, Heart, TrendingUp, Award, BarChart3, Globe, Loader2 } from 'lucide-react';

export default function DEIDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [tenureData, setTenureData] = useState<{ range: string; count: number; percentage: number }[]>([]);
  const [deptBreakdown, setDeptBreakdown] = useState<{ department: string; count: number; percentage: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/v1/analytics/diversity');
      const json = await res.json();
      const data = json?.data;

      if (data) {
        setTotalEmployees(data.totalEmployees || 0);
        setTenureData(data.tenure?.distribution || []);
        setDeptBreakdown(data.departmentBreakdown || []);
      }
    } catch (error) {
      console.error('Error loading DEI data:', error);
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
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">DEI Dashboard</h1>
        <p className="text-sm text-silver-mist mt-1">Diversity, Equity & Inclusion metrics and progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Total Workforce</p>
          <p className="text-2xl font-bold text-celestial-indigo mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Departments</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">{deptBreakdown.length}</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Avg Tenure Distribution</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{tenureData.length} bands</p>
        </div>
        <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50">
          <p className="text-xs text-silver-mist uppercase font-medium">Data Status</p>
          <p className="text-2xl font-bold text-ink-black dark:text-pearl mt-1">Live</p>
          <p className="text-[10px] text-silver-mist">From employee records</p>
        </div>
      </div>

      {deptBreakdown.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Workforce by Department</h3>
          <div className="space-y-3">
            {deptBreakdown.map((dept) => (
              <div key={dept.department}>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-ink-black dark:text-pearl">{dept.department}</span>
                  <span className="text-silver-mist">{dept.count} ({dept.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-deep-cosmos rounded-full overflow-hidden">
                  <div className="bg-celestial-indigo h-full rounded-full" style={{ width: `${dept.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tenureData.length > 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5">
          <h3 className="font-bold text-sm text-ink-black dark:text-pearl mb-4">Tenure Distribution</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tenureData.map((item) => (
              <div key={item.range} className="text-center p-4 bg-slate-50 dark:bg-deep-cosmos rounded-lg">
                <p className="text-xs text-silver-mist mb-1">{item.range}</p>
                <p className="text-2xl font-bold text-ink-black dark:text-pearl">{item.count}</p>
                <p className="text-[10px] text-silver-mist mt-1">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalEmployees === 0 && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-8 text-center">
          <Users className="w-8 h-8 text-silver-mist mx-auto mb-2" />
          <p className="text-sm text-silver-mist">No DEI data available yet</p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Globe className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Data Privacy Notice</p>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
            All demographic data is self-reported and aggregated. Individual responses are confidential. Data is shown only where groups have 5+ members to protect anonymity.
          </p>
        </div>
      </div>
    </div>
  );
}
