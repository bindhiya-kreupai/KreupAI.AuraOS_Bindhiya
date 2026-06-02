'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Briefcase, Zap, Star,
  Search, Filter, Plus, ChevronRight,
  TrendingUp, Clock, Target, Bot,
  ShieldCheck, BarChart3, Mail,
  MessageSquare, Calendar, Sparkles,
  ArrowUpRight, AlertCircle, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RecruitmentAnalyticsService,
  CandidateApplicationService,
  JobRequisitionService
} from '@/app/dashboard/recruitment/services';

export default function RecruitmentPage() {
  const [stats, setStats] = useState<any>(null);
  const [activeRequisitions, setActiveRequisitions] = useState<any[]>([]);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecruitmentData();
  }, []);

  const loadRecruitmentData = async () => {
    try {
      setIsLoading(true);
      const [analytics, requisitions, applications] = await Promise.all([
        RecruitmentAnalyticsService.getStats(),
        JobRequisitionService.getRequisitions({ status: 'open' }),
        CandidateApplicationService.getApplications()
      ]);

      setStats(analytics);
      setActiveRequisitions(requisitions.slice(0, 4));

      // Mock AI Matching logic for 5-star UI demo
      const matched = applications
        .filter(a => (a.rating || 0) >= 4)
        .slice(0, 3)
        .map(a => ({
          ...a,
          matchScore: Math.floor(Math.random() * 15) + 85, // 85-100%
          reason: 'Strong match in React & Node.js ecosystem'
        }));
      setTopCandidates(matched);

    } catch (error: any) {
      console.error('Failed to load recruitment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Leadership Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-cloud dark:border-nebula-purple/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">
            <Bot className="w-4 h-4" /> AI Recruitment Orchestrator
          </div>
          <h1 className="text-4xl font-extrabold text-ink-black dark:text-pearl tracking-tight">
            Hiring <span className="text-indigo-600 dark:text-indigo-400">Command Center</span>
          </h1>
          <p className="text-silver-mist text-sm max-w-2xl leading-relaxed">
            Unify sourcing, screening, and requisition management. AI-powered matching identifies top 1% talent while optimizing the hiring lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl text-xs font-bold text-ink-black dark:text-pearl hover:bg-slate-50 transition-all shadow-sm">
            <Calendar className="w-4 h-4" /> Interview Board
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all">
            <Plus className="w-4 h-4" /> Create Requisition
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RecruitStatCard title="Open Requisitions" value={stats?.openRequisitions || 0} icon={Briefcase} color="indigo" />
        <RecruitStatCard title="New Applicants" value={stats?.totalApplications || 0} icon={Users} color="emerald" trend="+12%" />
        <RecruitStatCard title="Avg Time to Hire" value={`${stats?.averageTimeToHire || 0}d`} icon={Clock} color="amber" />
        <RecruitStatCard title="Offer Acceptance" value={`${stats?.offerAcceptanceRate || 0}%`} icon={Target} color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Workspace */}
        <div className="xl:col-span-2 space-y-8">
          {/* Active Requisitions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Critical Vacancies</h2>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-[2.5rem] p-1 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {activeRequisitions.length > 0 ? activeRequisitions.map((req, i) => (
                  <div key={req.id} className="p-8 border-r border-b last:border-b-0 md:even:border-r-0 border-cloud dark:border-nebula-purple/10 hover:bg-slate-50/50 dark:hover:bg-indigo-900/5 transition-all group cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn(
                          "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                          req.priority === 'urgent' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {req.priority || 'High'}
                        </span>
                        <span className="text-[10px] font-bold text-silver-mist">Created 4d ago</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-ink-black dark:text-pearl mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{req.jobTitle}</h3>
                    <p className="text-xs text-silver-mist mb-8 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> {req.departmentName} <span className="text-slate-200">•</span> <Target className="w-3.5 h-3.5" /> {req.locationName}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(j => (
                          <div key={j} className="w-10 h-10 rounded-full border-4 border-white dark:border-stellar-blue bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black">
                            {j}
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-4 border-white dark:border-stellar-blue bg-indigo-600 flex items-center justify-center text-xs font-black text-white">
                          +8
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-ink-black dark:text-pearl">12</p>
                        <p className="text-[9px] font-black text-silver-mist uppercase tracking-widest leading-none">Candidates</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-ink-black dark:text-pearl uppercase tracking-tight">Zero Critical Gaps</p>
                      <p className="text-sm text-silver-mist italic leading-relaxed max-w-sm mx-auto">Your requisition pipeline is currently clear. AI predicts next headcount requirement in Q3.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sourcing Channel Pipeline */}
          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Sourcing Funnel Tracking
            </h2>
            <div className="space-y-6">
              {(() => {
                const sourceMap = stats?.applicationsBySource || {};
                const entries = Object.entries(sourceMap).sort(([,a]: any, [,b]: any) => b - a);
                const total = entries.reduce((sum, [, count]: any) => sum + count, 0) || 1;
                const colors = ['blue', 'indigo', 'emerald', 'rose'];
                return entries.length > 0 ? entries.slice(0, 4).map(([source, count]: any, i) => (
                  <SourcingBar
                    key={source}
                    label={source.charAt(0).toUpperCase() + source.slice(1).replace(/_/g, ' ')}
                    percentage={Math.round((count / total) * 100)}
                    color={colors[i % colors.length]}
                    count={count}
                  />
                )) : (
                  <p className="text-sm text-silver-mist text-center py-4">No sourcing data available yet</p>
                );
              })()}
            </div>
          </div>
        </div>

        {/* AI Sentinel Board */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/30 relative overflow-hidden group border border-indigo-500">
            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <UserCheck className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-200 font-bold text-xs uppercase tracking-widest mb-4">
                <Sparkles className="w-4 h-4 text-indigo-200" /> AI Talent Matcher
              </div>
              <h3 className="text-xl font-extrabold mb-4">Top Auto-Matches</h3>

              <div className="space-y-3">
                {topCandidates.map((can, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/20 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm">{can.firstName} {can.lastName}</div>
                      <div className="text-indigo-200 font-black text-xs">{can.matchScore}%</div>
                    </div>
                    <div className="text-[10px] text-indigo-100/70 truncate mb-2">{can.jobTitle}</div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-300" style={{ width: `${can.matchScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-xl text-xs font-black shadow-lg hover:bg-indigo-50 transition-colors uppercase tracking-widest">
                Screen All Matches
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Hiring Velocity
            </h3>
            <div className="space-y-4">
              <VelocityMetric label="Screening" time="1.2 days" status="Optimal" />
              <VelocityMetric label="Interviewing" time="3.5 days" status="Delayed" alert />
              <VelocityMetric label="Offer Prep" time="0.8 days" status="Fast" />
            </div>
            <button className="w-full mt-6 py-3 border border-cloud dark:border-nebula-purple/20 rounded-xl text-xs font-bold text-silver-mist hover:bg-slate-50 transition-all uppercase tracking-widest">
              Optimization Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruitStatCard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-3xl p-6 border border-cloud dark:border-nebula-purple/30 shadow-sm group hover:border-indigo-500/50 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-2xl", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <p className="text-[10px] font-extrabold text-silver-mist uppercase tracking-widest">{title}</p>
      <div className="text-3xl font-black text-ink-black dark:text-pearl mt-1 group-hover:scale-105 transition-transform origin-left">{value}</div>
    </div>
  );
}

function SourcingBar({ label, percentage, color, count }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-ink-black dark:text-pearl">{label}</span>
        <span className="text-silver-mist">{count} Apps • {percentage}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-1000", colors[color])} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function VelocityMetric({ label, time, status, alert }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-cloud dark:border-nebula-purple/10 last:border-0">
      <div>
        <div className="text-xs font-bold text-ink-black dark:text-pearl">{label}</div>
        <div className="text-[10px] text-silver-mist uppercase tracking-widest font-black">{time}</div>
      </div>
      <div className={cn(
        "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider",
        alert ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-silver-mist"
      )}>
        {status}
      </div>
    </div>
  );
}
