/**
 * @module TeamCapacityPlanner
 * @description Main view for team capacity planning with calendar, utilization bars, and workload chart
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Users, LayoutGrid, List, Search, Filter } from 'lucide-react';
import { CapacityBar, type TeamMemberCapacity } from './CapacityBar';
import { CapacityCalendar } from './CapacityCalendar';
import { WorkloadDistribution } from './WorkloadDistribution';

type ActiveTab = 'team' | 'calendar' | 'workload';
type ViewMode = 'cards' | 'compact';
type SortBy = 'name' | 'utilization' | 'available';

// ── Mock capacity data integrating with leave availability ──────────────────

const MOCK_TEAM_CAPACITY: TeamMemberCapacity[] = [
  {
    id: 'emp-001',
    name: 'Sarah Johnson',
    designation: 'Senior Software Engineer',
    workMode: 'hybrid',
    currentStatus: 'working',
    utilization: 82,
    allocatedHours: 33,
    availableHours: 7,
    totalHours: 40,
    onLeaveToday: false,
    upcomingLeaveDays: 2,
    leaveBalanceRemaining: 12,
    trend: 'up',
    trendDelta: 5,
    projectWork: 24,
    meetings: 6,
    adminTasks: 3,
  },
  {
    id: 'emp-002',
    name: 'Michael Chen',
    designation: 'Software Engineer',
    workMode: 'remote',
    currentStatus: 'wfh',
    utilization: 95,
    allocatedHours: 38,
    availableHours: 2,
    totalHours: 40,
    onLeaveToday: false,
    upcomingLeaveDays: 0,
    leaveBalanceRemaining: 15,
    trend: 'up',
    trendDelta: 12,
    projectWork: 28,
    meetings: 8,
    adminTasks: 2,
  },
  {
    id: 'emp-003',
    name: 'Emily Rodriguez',
    designation: 'Junior Software Engineer',
    workMode: 'office',
    currentStatus: 'working',
    utilization: 45,
    allocatedHours: 18,
    availableHours: 22,
    totalHours: 40,
    onLeaveToday: false,
    upcomingLeaveDays: 0,
    leaveBalanceRemaining: 20,
    trend: 'down',
    trendDelta: -8,
    projectWork: 12,
    meetings: 4,
    adminTasks: 2,
  },
  {
    id: 'emp-004',
    name: 'David Kim',
    designation: 'Senior Software Engineer',
    workMode: 'hybrid',
    currentStatus: 'on_leave',
    utilization: 0,
    allocatedHours: 0,
    availableHours: 0,
    totalHours: 40,
    onLeaveToday: true,
    upcomingLeaveDays: 3,
    leaveBalanceRemaining: 8,
    trend: 'stable',
    trendDelta: 0,
    projectWork: 0,
    meetings: 0,
    adminTasks: 0,
  },
  {
    id: 'emp-005',
    name: 'Jessica Martinez',
    designation: 'Software Engineer',
    workMode: 'office',
    currentStatus: 'working',
    utilization: 68,
    allocatedHours: 27,
    availableHours: 13,
    totalHours: 40,
    onLeaveToday: false,
    upcomingLeaveDays: 1,
    leaveBalanceRemaining: 18,
    trend: 'stable',
    trendDelta: 2,
    projectWork: 18,
    meetings: 5,
    adminTasks: 4,
  },
  {
    id: 'emp-006',
    name: 'Alex Rivera',
    designation: 'Tech Lead',
    workMode: 'hybrid',
    currentStatus: 'working',
    utilization: 88,
    allocatedHours: 35,
    availableHours: 5,
    totalHours: 40,
    onLeaveToday: false,
    upcomingLeaveDays: 0,
    leaveBalanceRemaining: 10,
    trend: 'up',
    trendDelta: 3,
    projectWork: 20,
    meetings: 10,
    adminTasks: 5,
  },
  {
    id: 'emp-007',
    name: 'Priya Sharma',
    designation: 'Software Engineer',
    workMode: 'remote',
    currentStatus: 'working',
    utilization: 72,
    allocatedHours: 29,
    availableHours: 11,
    totalHours: 40,
    onLeaveToday: false,
    upcomingLeaveDays: 4,
    leaveBalanceRemaining: 14,
    trend: 'down',
    trendDelta: -3,
    projectWork: 22,
    meetings: 4,
    adminTasks: 3,
  },
  {
    id: 'emp-008',
    name: 'Marcus Johnson',
    designation: 'Junior Developer',
    workMode: 'office',
    currentStatus: 'half_day',
    utilization: 35,
    allocatedHours: 14,
    availableHours: 6,
    totalHours: 20,
    onLeaveToday: false,
    upcomingLeaveDays: 0,
    leaveBalanceRemaining: 22,
    trend: 'up',
    trendDelta: 10,
    projectWork: 10,
    meetings: 2,
    adminTasks: 2,
  },
];

export const TeamCapacityPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('team');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('utilization');
  const [selectedMember, setSelectedMember] = useState<TeamMemberCapacity | null>(null);

  const filtered = useMemo(() => {
    let result = [...MOCK_TEAM_CAPACITY];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'utilization') return b.utilization - a.utilization;
      if (sortBy === 'available') return b.availableHours - a.availableHours;
      return 0;
    });
    return result;
  }, [search, sortBy]);

  // Team utilization percentage
  const teamUtilization = useMemo(() => {
    const working = MOCK_TEAM_CAPACITY.filter((m) => !m.onLeaveToday);
    if (working.length === 0) return 0;
    return Math.round(working.reduce((s, m) => s + m.utilization, 0) / working.length);
  }, []);

  const availableToday = MOCK_TEAM_CAPACITY.filter((m) => !m.onLeaveToday).length;

  return (
    <div className="space-y-5">
      {/* Team utilization percentage banner */}
      <div className="rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-ink-black dark:text-pearl">Team Utilization</h3>
            <p className="text-[10px] text-silver-mist">
              {availableToday} of {MOCK_TEAM_CAPACITY.length} members available today
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-ink-black dark:text-pearl">{teamUtilization}%</p>
            <p
              className={`text-[10px] font-semibold ${
                teamUtilization >= 80
                  ? 'text-sunset-amber'
                  : teamUtilization >= 60
                    ? 'text-celestial-indigo'
                    : 'text-neural-mint'
              }`}
            >
              {teamUtilization >= 80
                ? 'High utilization'
                : teamUtilization >= 60
                  ? 'Balanced'
                  : 'Capacity available'}
            </p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-cloud dark:bg-nebula-purple/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              teamUtilization >= 90
                ? 'bg-coral-alert'
                : teamUtilization >= 75
                  ? 'bg-sunset-amber'
                  : teamUtilization >= 50
                    ? 'bg-celestial-indigo'
                    : 'bg-neural-mint'
            }`}
            style={{ width: `${Math.min(teamUtilization, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[9px] text-silver-mist">
          <span>0%</span>
          <span>50% — Balanced</span>
          <span>100%</span>
        </div>
      </div>

      {/* Tabs & controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-pearl dark:bg-deep-cosmos rounded-xl p-0.5 border border-cloud dark:border-nebula-purple/30">
          {[
            { key: 'team' as ActiveTab, label: 'Team', icon: Users },
            { key: 'calendar' as ActiveTab, label: 'Calendar', icon: Calendar },
            { key: 'workload' as ActiveTab, label: 'Workload', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist hover:text-twilight dark:hover:text-pearl'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'team' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-7 pr-3 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none focus:border-celestial-indigo transition-colors w-40"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none pl-7 pr-6 py-1.5 rounded-lg border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue text-xs text-ink-black dark:text-pearl outline-none transition-colors"
              >
                <option value="utilization">By Utilization</option>
                <option value="name">By Name</option>
                <option value="available">By Availability</option>
              </select>
              <Filter className="w-3 h-3 text-silver-mist absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="flex items-center gap-0.5 border border-cloud dark:border-nebula-purple/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 transition-colors ${viewMode === 'cards' ? 'bg-celestial-indigo/10 text-celestial-indigo' : 'text-silver-mist hover:text-twilight'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 transition-colors ${viewMode === 'compact' ? 'bg-celestial-indigo/10 text-celestial-indigo' : 'text-silver-mist hover:text-twilight'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'team' && (
        <div>
          {viewMode === 'cards' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((member) => (
                <CapacityBar key={member.id} member={member} onClick={setSelectedMember} />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((member) => (
                <CapacityBar key={member.id} member={member} compact onClick={setSelectedMember} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-10">
              <Users className="w-8 h-8 text-silver-mist/20 mx-auto mb-2" />
              <p className="text-xs text-silver-mist">No team members match your search.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && <CapacityCalendar members={MOCK_TEAM_CAPACITY} />}

      {activeTab === 'workload' && <WorkloadDistribution members={MOCK_TEAM_CAPACITY} />}

      {/* Member detail panel */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-black/30 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl border border-cloud dark:border-nebula-purple/30 bg-white dark:bg-stellar-blue shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-cloud dark:border-nebula-purple/20 bg-pearl/30 dark:bg-deep-cosmos/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-black dark:text-pearl">
                {selectedMember.name}
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-[10px] text-silver-mist hover:text-ink-black dark:hover:text-pearl transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <CapacityBar member={selectedMember} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCapacityPlanner;
