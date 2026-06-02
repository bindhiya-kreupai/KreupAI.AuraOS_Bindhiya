// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module InternalCommunications
 * @description Internal communications hub — announcements, newsletters, town halls,
 *              knowledge base, and content analytics (Sec 13.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Video,
  BookOpen,
  BarChart2,
  Plus,
  Search,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'announcements' | 'newsletters' | 'townhalls' | 'knowledge' | 'analytics';
type AnnouncementCategory = 'company' | 'department' | 'hr' | 'it';
type AnnouncementPriority = 'urgent' | 'important' | 'normal';
type NewsletterStatus = 'sent' | 'scheduled' | 'draft';
type TownHallStatus = 'upcoming' | 'live' | 'recorded';
type KBCategory = 'policies' | 'faqs' | 'how-tos' | 'benefits' | 'onboarding';

interface Announcement {
  id: string;
  title: string;
  excerpt: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  publishDate: string;
  readCount: number;
  totalAudience: number;
  author: string;
}

interface Newsletter {
  id: string;
  subject: string;
  sendDate: string;
  status: NewsletterStatus;
  openRate: number;
  clickRate: number;
  recipients: number;
}

interface TownHall {
  id: string;
  title: string;
  date: string;
  time: string;
  speakers: string[];
  agenda: string[];
  registrations: number;
  capacity: number;
  status: TownHallStatus;
  recordingUrl?: string;
}

interface KBArticle {
  id: string;
  title: string;
  category: KBCategory;
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  readTime: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a-001',
    title: 'Q1 2026 All-Hands Meeting — Save the Date',
    excerpt:
      'Join us for our quarterly all-hands on March 15th. CEO Sarah Chen will share company updates, Q4 results, and vision for 2026.',
    category: 'company',
    priority: 'important',
    publishDate: '2026-02-25',
    readCount: 248,
    totalAudience: 290,
    author: 'Sarah Chen',
  },
  {
    id: 'a-002',
    title: 'Critical Security Patch — Action Required by March 1',
    excerpt:
      'IT Security has identified a critical vulnerability. All employees must update their laptops before March 1st to maintain system access.',
    category: 'it',
    priority: 'urgent',
    publishDate: '2026-02-24',
    readCount: 212,
    totalAudience: 290,
    author: 'IT Security Team',
  },
  {
    id: 'a-003',
    title: 'Updated Remote Work Policy Effective April 1',
    excerpt:
      'HR has updated the remote work policy to allow up to 3 days WFH per week for eligible roles. Please review the full policy document.',
    category: 'hr',
    priority: 'important',
    publishDate: '2026-02-22',
    readCount: 265,
    totalAudience: 290,
    author: 'People Operations',
  },
  {
    id: 'a-004',
    title: 'Engineering Team — Sprint 45 Launch',
    excerpt:
      'The Engineering department kicks off Sprint 45 this week focusing on performance optimization and new API endpoints.',
    category: 'department',
    priority: 'normal',
    publishDate: '2026-02-20',
    readCount: 72,
    totalAudience: 85,
    author: 'Tom Johnson',
  },
  {
    id: 'a-005',
    title: 'Open Enrollment Benefits Period — Closes Feb 28',
    excerpt:
      'Benefits open enrollment closes this Friday. Ensure you review and confirm your selections for health, dental, vision, and 401(k).',
    category: 'hr',
    priority: 'urgent',
    publishDate: '2026-02-18',
    readCount: 245,
    totalAudience: 290,
    author: 'Benefits Team',
  },
];

const NEWSLETTERS: Newsletter[] = [
  {
    id: 'nl-001',
    subject: 'The Pulse — February 2026 Edition',
    sendDate: '2026-02-01',
    status: 'sent',
    openRate: 72,
    clickRate: 28,
    recipients: 290,
  },
  {
    id: 'nl-002',
    subject: 'The Pulse — January 2026 Edition',
    sendDate: '2026-01-03',
    status: 'sent',
    openRate: 68,
    clickRate: 24,
    recipients: 282,
  },
  {
    id: 'nl-003',
    subject: 'The Pulse — December 2025 Edition',
    sendDate: '2025-12-05',
    status: 'sent',
    openRate: 81,
    clickRate: 35,
    recipients: 278,
  },
  {
    id: 'nl-004',
    subject: 'The Pulse — March 2026 Edition',
    sendDate: '2026-03-01',
    status: 'scheduled',
    openRate: 0,
    clickRate: 0,
    recipients: 292,
  },
  {
    id: 'nl-005',
    subject: 'Engineering Newsletter Q1 2026',
    sendDate: '',
    status: 'draft',
    openRate: 0,
    clickRate: 0,
    recipients: 0,
  },
];

const TOWN_HALLS: TownHall[] = [
  {
    id: 'th-001',
    title: 'Q1 2026 All-Hands Meeting',
    date: '2026-03-15',
    time: '10:00 AM PST',
    status: 'upcoming',
    speakers: ['Sarah Chen (CEO)', 'Mike Roberts (CFO)', 'Lisa Park (CPO)'],
    agenda: [
      'Q4 2025 Financial Results',
      '2026 Company Strategy',
      'Product Roadmap Update',
      'Q&A Session',
    ],
    registrations: 218,
    capacity: 400,
  },
  {
    id: 'th-002',
    title: 'Engineering Town Hall — Tech Strategy 2026',
    date: '2026-02-28',
    time: '2:00 PM PST',
    status: 'upcoming',
    speakers: ['Tom Johnson (CTO)', 'James Miller (Principal Engineer)'],
    agenda: ['Architecture Evolution', 'Platform Migration Update', 'Hiring Plans', 'Open Q&A'],
    registrations: 76,
    capacity: 100,
  },
  {
    id: 'th-003',
    title: 'Q4 2025 All-Hands Meeting',
    date: '2025-12-12',
    time: '10:00 AM PST',
    status: 'recorded',
    speakers: ['Sarah Chen (CEO)', 'Mike Roberts (CFO)'],
    agenda: ['Q3 Results', 'Year-End Highlights', '2026 Preview'],
    registrations: 265,
    capacity: 400,
    recordingUrl: '#',
  },
];

const KB_ARTICLES: KBArticle[] = [
  {
    id: 'kb-001',
    title: 'How to Submit a Leave Request',
    category: 'how-tos',
    views: 1240,
    helpful: 342,
    notHelpful: 12,
    lastUpdated: '2026-01-15',
    readTime: '3 min',
  },
  {
    id: 'kb-002',
    title: 'Employee Benefits Overview 2026',
    category: 'benefits',
    views: 980,
    helpful: 287,
    notHelpful: 8,
    lastUpdated: '2026-01-01',
    readTime: '8 min',
  },
  {
    id: 'kb-003',
    title: 'Remote Work Policy — Complete Guide',
    category: 'policies',
    views: 856,
    helpful: 234,
    notHelpful: 24,
    lastUpdated: '2026-02-22',
    readTime: '6 min',
  },
  {
    id: 'kb-004',
    title: 'Onboarding Checklist for New Employees',
    category: 'onboarding',
    views: 742,
    helpful: 198,
    notHelpful: 5,
    lastUpdated: '2026-02-01',
    readTime: '5 min',
  },
  {
    id: 'kb-005',
    title: 'FAQs: Performance Review Process',
    category: 'faqs',
    views: 620,
    helpful: 168,
    notHelpful: 18,
    lastUpdated: '2025-11-20',
    readTime: '4 min',
  },
  {
    id: 'kb-006',
    title: 'Expense Reimbursement Policy',
    category: 'policies',
    views: 584,
    helpful: 152,
    notHelpful: 22,
    lastUpdated: '2026-01-10',
    readTime: '4 min',
  },
  {
    id: 'kb-007',
    title: 'How to Set Up VPN Access',
    category: 'how-tos',
    views: 512,
    helpful: 148,
    notHelpful: 31,
    lastUpdated: '2026-02-14',
    readTime: '2 min',
  },
  {
    id: 'kb-008',
    title: '401(k) Enrollment FAQs',
    category: 'faqs',
    views: 468,
    helpful: 132,
    notHelpful: 6,
    lastUpdated: '2026-01-05',
    readTime: '5 min',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const TAB_LIST: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'newsletters', label: 'Newsletters', icon: Mail },
  { id: 'townhalls', label: 'Town Halls', icon: Video },
  { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

function priorityConfig(p: AnnouncementPriority) {
  const map = {
    urgent: {
      label: 'Urgent',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-500',
    },
    important: {
      label: 'Important',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Info,
      iconColor: 'text-amber-500',
    },
    normal: {
      label: 'Normal',
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: CheckCircle,
      iconColor: 'text-gray-400',
    },
  };
  return map[p];
}

function categoryColor(c: AnnouncementCategory): string {
  const map: Record<AnnouncementCategory, string> = {
    company: 'bg-blue-100 text-blue-700',
    department: 'bg-purple-100 text-purple-700',
    hr: 'bg-pink-100 text-pink-700',
    it: 'bg-cyan-100 text-cyan-700',
  };
  return map[c];
}

function kbCategoryColor(c: KBCategory): string {
  const map: Record<KBCategory, string> = {
    policies: 'bg-blue-100 text-blue-700',
    faqs: 'bg-purple-100 text-purple-700',
    'how-tos': 'bg-green-100 text-green-700',
    benefits: 'bg-amber-100 text-amber-700',
    onboarding: 'bg-indigo-100 text-indigo-700',
  };
  return map[c];
}

function statusNewsletterColor(s: NewsletterStatus): string {
  return s === 'sent'
    ? 'bg-green-100 text-green-700'
    : s === 'scheduled'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600';
}

// ── Tab: Announcements ────────────────────────────────────────────────────────

function AnnouncementsTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | AnnouncementPriority>('all');

  const filtered = ANNOUNCEMENTS.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'all' || a.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'urgent', 'important', 'normal'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${priorityFilter === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Create Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Announcement title..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Company</option>
                  <option>Department</option>
                  <option>HR</option>
                  <option>IT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Normal</option>
                  <option>Important</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Employees</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex gap-2 p-2 bg-gray-50 border-b border-gray-200">
                  {['B', 'I', 'U', 'Link', 'List'].map((t) => (
                    <button
                      key={t}
                      className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded"
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={5}
                  placeholder="Write your announcement content here..."
                  className="w-full px-3 py-2 text-sm focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Save Draft
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((a) => {
          const { label, color, icon: Icon, iconColor } = priorityConfig(a.priority);
          const readPct = Math.round((a.readCount / a.totalAudience) * 100);
          return (
            <div
              key={a.id}
              className={`bg-white rounded-xl border shadow-sm p-4 ${a.priority === 'urgent' ? 'border-red-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-800 text-sm">{a.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}
                      >
                        {label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor(a.category)}`}
                      >
                        {a.category.charAt(0).toUpperCase() + a.category.slice(1)}
                      </span>
                    </div>
                    <button className="shrink-0 text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">
                      View
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed line-clamp-2">
                    {a.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>By {a.author}</span>
                    <span>{a.publishDate}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Eye className="w-3.5 h-3.5" />
                      <span>
                        {a.readCount}/{a.totalAudience} read ({readPct}%)
                      </span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-1">
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${readPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Newsletters ──────────────────────────────────────────────────────────

function NewslettersTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" /> Create Newsletter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Newsletter Archive</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Send Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recipients
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Open Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Click Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {NEWSLETTERS.map((nl) => (
              <tr key={nl.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{nl.subject}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusNewsletterColor(nl.status)}`}
                  >
                    {nl.status.charAt(0).toUpperCase() + nl.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{nl.sendDate || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{nl.recipients || '—'}</td>
                <td className="px-4 py-3">
                  {nl.openRate > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${nl.openRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">{nl.openRate}%</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {nl.clickRate > 0 ? (
                    <span className="text-xs font-semibold text-blue-600">{nl.clickRate}%</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs text-blue-600 hover:underline">View</button>
                    {nl.status === 'draft' && (
                      <button className="text-xs text-gray-500 hover:underline">Edit</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Town Halls ───────────────────────────────────────────────────────────

function TownHallsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOWN_HALLS.map((th) => {
          const isUpcoming = th.status === 'upcoming';
          const isRecorded = th.status === 'recorded';
          const regPct = Math.round((th.registrations / th.capacity) * 100);

          return (
            <div
              key={th.id}
              className={`bg-white rounded-xl border shadow-sm p-5 ${isUpcoming ? 'border-blue-200' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium mb-2 inline-block ${
                      isUpcoming
                        ? 'bg-blue-100 text-blue-700'
                        : th.status === 'live'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {th.status === 'upcoming'
                      ? 'Upcoming'
                      : th.status === 'live'
                        ? 'LIVE'
                        : 'Recorded'}
                  </span>
                  <h4 className="font-semibold text-gray-800">{th.title}</h4>
                </div>
                {isRecorded && th.recordingUrl && (
                  <a
                    href={th.recordingUrl}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Video className="w-3.5 h-3.5" /> Watch Recording
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {th.date} at {th.time}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Speakers</p>
                <div className="flex flex-wrap gap-1">
                  {th.speakers.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Agenda</p>
                <ul className="space-y-0.5">
                  {th.agenda.map((item, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {isUpcoming && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {th.registrations} registered
                    </span>
                    <span>
                      {regPct}% of {th.capacity} capacity
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full ${regPct > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${regPct}%` }}
                    />
                  </div>
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    Register
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Knowledge Base ───────────────────────────────────────────────────────

function KnowledgeBaseTab() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | KBCategory>('all');

  const categories: { id: 'all' | KBCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'policies', label: 'Policies' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'how-tos', label: 'How-Tos' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'onboarding', label: 'Onboarding' },
  ];

  const filtered = KB_ARTICLES.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${categoryFilter === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {filtered.map((article) => {
          const helpfulPct = Math.round(
            (article.helpful / (article.helpful + article.notHelpful)) * 100
          );
          return (
            <div
              key={article.id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <a href="#" className="font-medium text-gray-800 text-sm hover:text-blue-600">
                    {article.title}
                  </a>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${kbCategoryColor(article.category)}`}
                  >
                    {article.category.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {article.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {article.readTime} read
                  </span>
                  <span>Updated {article.lastUpdated}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-semibold text-emerald-600">{helpfulPct}%</span>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded"
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                    title="Not Helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Analytics ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const topContent = [
    { title: 'Updated Remote Work Policy', type: 'Announcement', reach: 265, engagement: 87 },
    {
      title: 'Employee Benefits Overview 2026',
      type: 'Knowledge Base',
      reach: 980,
      engagement: 97,
    },
    { title: 'The Pulse — February 2026', type: 'Newsletter', reach: 209, engagement: 72 },
    { title: 'Q4 2025 All-Hands Meeting', type: 'Town Hall', reach: 265, engagement: 91 },
    { title: 'How to Submit a Leave Request', type: 'Knowledge Base', reach: 1240, engagement: 97 },
  ];

  const contentTypeStats = [
    { type: 'Announcements', sent: 24, avgReach: 82, color: 'bg-blue-500' },
    { type: 'Newsletters', sent: 3, avgReach: 72, color: 'bg-purple-500' },
    { type: 'Town Halls', sent: 4, avgReach: 91, color: 'bg-emerald-500' },
    { type: 'KB Articles', sent: 48, avgReach: 68, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Content Pieces Published',
            value: '79',
            sub: 'This quarter',
            color: 'text-blue-600',
          },
          { label: 'Total Reach', value: '18.4K', sub: 'Unique views', color: 'text-emerald-600' },
          {
            label: 'Avg Engagement Rate',
            value: '78%',
            sub: '+4% vs last qtr',
            color: 'text-purple-600',
          },
          {
            label: 'Knowledge Base Articles',
            value: '142',
            sub: 'Total published',
            color: 'text-amber-600',
          },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Engagement by Content Type</h3>
          <div className="space-y-4">
            {contentTypeStats.map((ct) => (
              <div key={ct.type} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-28">{ct.type}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${ct.color}`}
                    style={{ width: `${ct.avgReach}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                  {ct.avgReach}%
                </span>
                <span className="text-xs text-gray-400 w-16 text-right">{ct.sent} pieces</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            {topContent.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 text-sm font-bold text-gray-400">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate">{c.title}</p>
                  <span className="text-xs text-gray-400">{c.type}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-emerald-600">{c.engagement}% eng</p>
                  <p className="text-xs text-gray-400">{c.reach} reach</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function InternalCommunications() {
  const [activeTab, setActiveTab] = useState<TabId>('announcements');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internal Communications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Announce, inform, and engage your workforce
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <Plus className="w-4 h-4" /> New Communication
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TAB_LIST.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'announcements' && <AnnouncementsTab />}
          {activeTab === 'newsletters' && <NewslettersTab />}
          {activeTab === 'townhalls' && <TownHallsTab />}
          {activeTab === 'knowledge' && <KnowledgeBaseTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </>
      )}
    </div>
  );
}
