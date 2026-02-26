/**
 * @module InternalMobilityPortal
 * @description Internal Mobility Portal — internal job board with skill match, career path visualizer,
 *              skill gap radar, gig marketplace, mentor directory, application tracker (Sec 20.6)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  Map,
  Star,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  RefreshCw,
  Award,
  Layers,
  Zap,
  ArrowRight,
  Target,
} from 'lucide-react';
import {
  InternalMobilityService,
  type InternalPosting,
  type CareerPath,
  type GigOpportunity,
  type MentorMatch,
  type InternalApplication,
  type SkillMatch,
} from '@/services/internalMobilityService';

// ── Skill Match Ring ──────────────────────────────────────────────────────────

function MatchRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : '#f59e0b';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fontWeight={700}
        fill={color}
      >
        {pct}%
      </text>
    </svg>
  );
}

// ── Internal Job Card ─────────────────────────────────────────────────────────

function JobCard({
  posting,
  onApply,
  onViewMatch,
}: {
  posting: InternalPosting;
  onApply: (id: string) => void;
  onViewMatch: (id: string) => void;
}) {
  const [matchPct] = useState(() => Math.floor(Math.random() * 35) + 55);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {posting.isNew && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                New
              </span>
            )}
            <span className="text-xs text-gray-400">{posting.level}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{posting.jobTitle}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{posting.department}</p>
        </div>
        <MatchRing pct={matchPct} />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <MapPin size={10} />
          {posting.location}
        </span>
        {posting.isRemote && <span className="flex items-center gap-1">🌐 Remote OK</span>}
        <span className="flex items-center gap-1">
          <Users size={10} />
          {posting.applicantsCount} applied
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {posting.requiredSkills.slice(0, 3).map((skill) => (
          <span key={skill} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
            {skill}
          </span>
        ))}
        {posting.requiredSkills.length > 3 && (
          <span className="text-xs text-gray-400">+{posting.requiredSkills.length - 3}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApply(posting.id)}
          className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
        >
          Apply
        </button>
        <button
          onClick={() => onViewMatch(posting.id)}
          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50"
        >
          Skill Match
        </button>
      </div>
    </div>
  );
}

// ── Career Path Timeline ───────────────────────────────────────────────────────

function CareerPathTimeline({ path }: { path: CareerPath }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{path.name}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Avg {path.avgTimeToTarget} months · {path.successRate}% success rate ·{' '}
            {path.employeesOnPath} on this path
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${path.type === 'promotion' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
        >
          {path.type}
        </span>
      </div>
      <div className="relative">
        {path.progression.map((node, i) => (
          <div key={node.roleId} className="flex items-start gap-4 pb-4 relative">
            {i < path.progression.length - 1 && (
              <div
                className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"
                style={{ bottom: 0 }}
              />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${i === 0 ? 'bg-blue-100 border-2 border-blue-400' : i === path.progression.length - 1 ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100 border-2 border-gray-300'}`}
            >
              <span className="text-xs font-bold text-gray-700">{i + 1}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{node.title}</p>
              <p className="text-xs text-gray-400">
                {node.department} · {node.level}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {node.avgTimeInRole}mo avg
                </span>
                <span className="text-green-600 font-medium">
                  ${(node.avgSalary / 1000).toFixed(0)}K
                </span>
                {node.openings > 0 && <span className="text-blue-600">{node.openings} open</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <p className="text-xs font-medium text-gray-600 mb-1">Key skills to acquire:</p>
        <div className="flex flex-wrap gap-1">
          {path.keySkillsToAcquire.map((skill) => (
            <span
              key={skill}
              className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Skill Match Detail ────────────────────────────────────────────────────────

function SkillMatchDetail({ match, onClose }: { match: SkillMatch; onClose: () => void }) {
  const dims = [
    ...match.matchedSkills.map((s) => s.skill),
    ...match.missingSkills.map((s) => s.skill),
  ].slice(0, 6);
  const vals = [
    ...match.matchedSkills.map((_s) => 80 + Math.floor(Math.random() * 20)),
    ...match.missingSkills.map(() => 10 + Math.floor(Math.random() * 20)),
  ].slice(0, 6);

  const n = dims.length;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const xpt = (i: number, v: number) => cx + Math.cos(angle(i)) * r * (v / 100);
  const ypt = (i: number, v: number) => cy + Math.sin(angle(i)) * r * (v / 100);
  const toPath = (vv: number[]) =>
    vv.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xpt(i, v)} ${ypt(i, v)}`).join(' ') + ' Z';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Skill Match Analysis</h3>
            <p className="text-sm text-gray-500">Your skills vs. role requirements</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{match.overallMatchPercent}%</p>
            <p className="text-xs text-gray-400">overall match</p>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {[25, 50, 75, 100].map((l) => (
              <polygon
                key={l}
                points={Array.from({ length: n })
                  .map((_, i) => `${xpt(i, l)},${ypt(i, l)}`)
                  .join(' ')}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            ))}
            {Array.from({ length: n }).map((_, i) => (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={xpt(i, 100)}
                y2={ypt(i, 100)}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
            ))}
            <path
              d={toPath(Array(n).fill(75))}
              fill="#3b82f620"
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="3,2"
            />
            <path d={toPath(vals)} fill="#10b98130" stroke="#10b981" strokeWidth={2} />
            {dims.map((d, i) => (
              <text
                key={i}
                x={xpt(i, 118)}
                y={ypt(i, 118)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={7}
                fill="#374151"
              >
                {d.length > 10 ? d.slice(0, 8) + '…' : d}
              </text>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
              <CheckCircle size={12} /> Matched Skills
            </h4>
            <div className="space-y-1">
              {match.matchedSkills.map((s) => (
                <div
                  key={s.skill}
                  className="flex items-center justify-between text-xs bg-green-50 px-2 py-1 rounded"
                >
                  <span className="text-gray-700">{s.skill}</span>
                  <span className="text-green-600 font-medium">{s.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
              <Target size={12} /> Skills to Develop
            </h4>
            <div className="space-y-1">
              {match.missingSkills.map((s) => (
                <div key={s.skill} className="text-xs bg-amber-50 px-2 py-1 rounded">
                  <p className="text-gray-700 font-medium">{s.skill}</p>
                  <p className="text-gray-400">{s.learningTime}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 mb-1">
            Time to readiness: {match.timeToReadiness}
          </p>
          <ul className="space-y-0.5">
            {match.developmentPlan.map((step, i) => (
              <li key={i} className="text-xs text-blue-700 flex items-center gap-1">
                <ArrowRight size={9} />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── Gig Card ──────────────────────────────────────────────────────────────────

function GigCard({ gig, onApply }: { gig: GigOpportunity; onApply: (id: string) => void }) {
  const spotsLeft = gig.maxParticipants - Math.floor(gig.applicantsCount * 0.4);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{gig.title}</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {gig.hostDepartment} · {gig.hostTeam}
          </p>
        </div>
        {spotsLeft <= 2 && (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">
            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{gig.description}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {gig.duration}
        </span>
        <span>{gig.hoursPerWeek}h/week</span>
        <span className="flex items-center gap-1">
          <MapPin size={10} />
          {gig.isRemote ? 'Remote' : gig.location}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {gig.skillsGained.map((skill) => (
          <span key={skill} className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
            {skill}
          </span>
        ))}
      </div>
      <button
        onClick={() => onApply(gig.id)}
        className="w-full py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700"
      >
        Apply for Gig
      </button>
    </div>
  );
}

// ── Mentor Card ───────────────────────────────────────────────────────────────

function MentorCard({ match }: { match: MentorMatch }) {
  const m = match.mentor;
  return (
    <div
      className={`bg-white border rounded-xl p-4 transition-all ${m.isAvailable ? 'border-gray-200 hover:border-blue-300 hover:shadow-sm' : 'border-gray-100 opacity-70'}`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {m.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
            <div className="flex items-center gap-0.5">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-gray-700">{m.rating}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {m.title} · {m.department}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{match.compatibilityScore}%</p>
          <p className="text-xs text-gray-400">match</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {m.expertise.slice(0, 3).map((e) => (
          <span key={e} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
            {e}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{m.bio}</p>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {m.isAvailable
            ? `${m.maxMentees - m.menteeCount} spots · ${m.meetingFrequency}`
            : 'Currently full'}
        </div>
        <button
          disabled={!m.isAvailable}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Request Mentorship
        </button>
      </div>
    </div>
  );
}

// ── Application Status Card ───────────────────────────────────────────────────

function ApplicationCard({ app }: { app: InternalApplication }) {
  const statusCfg: Record<string, { cls: string; label: string }> = {
    submitted: { cls: 'bg-blue-100 text-blue-700', label: 'Submitted' },
    under_review: { cls: 'bg-yellow-100 text-yellow-700', label: 'Under Review' },
    interview: { cls: 'bg-purple-100 text-purple-700', label: 'Interview' },
    offered: { cls: 'bg-green-100 text-green-700', label: 'Offered' },
    accepted: { cls: 'bg-green-200 text-green-800', label: 'Accepted' },
    rejected: { cls: 'bg-red-100 text-red-600', label: 'Not Selected' },
    withdrawn: { cls: 'bg-gray-100 text-gray-500', label: 'Withdrawn' },
    draft: { cls: 'bg-gray-100 text-gray-500', label: 'Draft' },
  };
  const sc = statusCfg[app.status] ?? { cls: 'bg-gray-100 text-gray-500', label: app.status };
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
      <MatchRing pct={app.skillMatchPercent} />
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm">{app.jobTitle}</p>
        <p className="text-xs text-gray-400">
          {app.department} · Applied {app.appliedDate}
        </p>
        {app.nextStep && <p className="text-xs text-blue-600 mt-0.5">Next: {app.nextStep}</p>}
        {app.feedback && (
          <p className="text-xs text-gray-400 mt-0.5 italic">&quot;{app.feedback}&quot;</p>
        )}
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sc.cls}`}>{sc.label}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'jobs' | 'careers' | 'gigs' | 'mentors' | 'myapps';

export default function InternalMobilityPortal() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [postings, setPostings] = useState<InternalPosting[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [gigs, setGigs] = useState<GigOpportunity[]>([]);
  const [mentorMatches, setMentorMatches] = useState<MentorMatch[]>([]);
  const [myApps, setMyApps] = useState<InternalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<SkillMatch | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [p, cp, g, mm, apps] = await Promise.all([
        InternalMobilityService.getInternalPostings(),
        InternalMobilityService.getCareerPaths(),
        InternalMobilityService.getGigOpportunities(),
        InternalMobilityService.getMentorMatches('emp-current'),
        InternalMobilityService.getInternalApplications('emp-current'),
      ]);
      setPostings(p);
      setCareerPaths(cp);
      setGigs(g);
      setMentorMatches(mm);
      setMyApps(apps);
      setLoading(false);
    };
    load();
  }, []);

  const handleApply = async (jobId: string) => {
    await InternalMobilityService.applyInternal(jobId, 'emp-current');
    alert('Application submitted successfully!');
  };

  const handleViewMatch = async (jobId: string) => {
    const match = await InternalMobilityService.getSkillMatch('emp-current', jobId);
    setSelectedMatch(match);
  };

  const handleGigApply = async (gigId: string) => {
    const result = await InternalMobilityService.applyForGig(gigId, 'emp-current');
    alert(result.message);
  };

  const filteredPostings = postings.filter(
    (p) =>
      p.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'jobs', label: 'Internal Jobs', icon: <Briefcase size={14} />, count: postings.length },
    { id: 'careers', label: 'Career Paths', icon: <Map size={14} />, count: careerPaths.length },
    { id: 'gigs', label: 'Gig Marketplace', icon: <Zap size={14} />, count: gigs.length },
    { id: 'mentors', label: 'Mentors', icon: <Users size={14} />, count: mentorMatches.length },
    { id: 'myapps', label: 'My Applications', icon: <Layers size={14} />, count: myApps.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Internal Mobility Portal</h1>
        <p className="text-sm text-gray-500 mt-1">
          Explore career opportunities, gig projects, and mentorship within KreupAI
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Open Positions',
            value: postings.length,
            icon: <Briefcase size={18} className="text-blue-600" />,
            bg: 'bg-blue-50',
          },
          {
            label: 'Career Paths',
            value: careerPaths.length,
            icon: <TrendingUp size={18} className="text-green-600" />,
            bg: 'bg-green-50',
          },
          {
            label: 'Gig Opportunities',
            value: gigs.filter((g) => g.status === 'open').length,
            icon: <Zap size={18} className="text-purple-600" />,
            bg: 'bg-purple-50',
          },
          {
            label: 'Available Mentors',
            value: mentorMatches.length,
            icon: <Award size={18} className="text-amber-600" />,
            bg: 'bg-amber-50',
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
          >
            <div className={`p-2.5 rounded-lg ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* Internal Jobs */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or department..."
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPostings.map((posting) => (
                  <JobCard
                    key={posting.id}
                    posting={posting}
                    onApply={handleApply}
                    onViewMatch={handleViewMatch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Career Paths */}
          {activeTab === 'careers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {careerPaths.map((path) => (
                <CareerPathTimeline key={path.id} path={path} />
              ))}
            </div>
          )}

          {/* Gig Marketplace */}
          {activeTab === 'gigs' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Take on short-term projects to gain new skills, build relationships, and contribute
                beyond your current role.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} onApply={handleGigApply} />
                ))}
              </div>
            </div>
          )}

          {/* Mentors */}
          {activeTab === 'mentors' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Connect with experienced leaders who can guide your career journey. Matched based on
                your goals and interests.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentorMatches.map((match) => (
                  <MentorCard key={match.mentor.id} match={match} />
                ))}
              </div>
            </div>
          )}

          {/* My Applications */}
          {activeTab === 'myapps' && (
            <div className="space-y-3">
              {myApps.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Briefcase size={32} className="mx-auto mb-2" />
                  <p>No applications yet. Explore open positions!</p>
                </div>
              ) : (
                myApps.map((app) => <ApplicationCard key={app.id} app={app} />)
              )}
            </div>
          )}
        </div>
      </div>

      {selectedMatch && (
        <SkillMatchDetail match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
