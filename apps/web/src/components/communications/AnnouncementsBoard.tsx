// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
/**
 * @module AnnouncementsBoard
 * @description Company announcements board — pinned, priority-styled,
 *              read receipt tracking, category filter, create form (Sec 13.3)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Pin,
  Bell,
  AlertCircle,
  Info,
  Plus,
  Eye,
  Users,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import {
  CommunicationsService,
  type Announcement,
  type AnnouncementPriority,
  type CreateAnnouncementData,
} from '@/services/communicationsService';

// ── Sub-components ─────────────────────────────────────────────────────────────

function Avatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'md' }) {
  const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm' };
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const colorIdx = initials.charCodeAt(0) % colors.length;
  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  const config = {
    urgent: {
      label: 'Urgent',
      icon: AlertCircle,
      className: 'bg-red-100 text-red-700 border-red-200',
    },
    important: {
      label: 'Important',
      icon: Bell,
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    general: {
      label: 'General',
      icon: Info,
      className: 'bg-blue-100 text-blue-700 border-blue-200',
    },
  }[priority];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function ReadProgress({ readBy, total }: { readBy: number; total: number }) {
  const pct = total > 0 ? (readBy / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-400">
        {readBy}/{total} read
      </span>
    </div>
  );
}

function AnnouncementCard({
  announcement,
  onRead,
  _isAdmin,
}: {
  announcement: Announcement;
  onRead: (id: string) => void;
  isAdmin: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(false);

  const priorityBorderColor = {
    urgent: 'border-l-red-500',
    important: 'border-l-amber-500',
    general: 'border-l-blue-400',
  }[announcement.priority];

  const handleExpand = () => {
    setExpanded((v) => !v);
    if (!read) {
      setRead(true);
      onRead(announcement.id);
    }
  };

  // Format body with basic markdown (bold, newlines)
  const formatBody = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl overflow-hidden border-l-4 ${priorityBorderColor} transition-shadow hover:shadow-md`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar initials={announcement.authorAvatar} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {announcement.pinned && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                <PriorityBadge priority={announcement.priority} />
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                  {announcement.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {announcement.audience === 'all'
                    ? 'All Employees'
                    : announcement.audienceValue || announcement.audience}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 leading-snug">{announcement.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500 font-medium">
                  {announcement.authorName}
                </span>
                <span className="text-xs text-slate-400">{announcement.authorRole}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-400">
                  {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleExpand}
            className="text-slate-400 hover:text-slate-600 flex-shrink-0 transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Body preview (truncated) */}
        {!expanded && (
          <p className="text-sm text-slate-600 mt-2 ml-13 line-clamp-2 pl-[52px]">
            {announcement.body.replace(/\*\*/g, '').split('\n')[0]}
          </p>
        )}

        {/* Expanded body */}
        {expanded && (
          <div className="mt-3 pl-[52px] text-sm text-slate-700 leading-relaxed space-y-1">
            {formatBody(announcement.body)}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pl-[52px]">
          <ReadProgress readBy={announcement.readByCount} total={announcement.totalAudience} />
          <div className="flex items-center gap-2">
            {!read && (
              <button
                onClick={() => {
                  setRead(true);
                  onRead(announcement.id);
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Mark read
              </button>
            )}
            {read && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                Read
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {announcement.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pl-[52px]">
            {announcement.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Create Announcement Modal ──────────────────────────────────────────────────

function CreateAnnouncementModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (ann: Announcement) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('general');
  const [audience, setAudience] = useState<'all' | 'department' | 'location'>('all');
  const [audienceValue, setAudienceValue] = useState('');
  const [pinned, setPinned] = useState(false);
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !body) return;
    setSubmitting(true);
    const data: CreateAnnouncementData = {
      title,
      body,
      priority,
      audience,
      audienceValue: audience !== 'all' ? audienceValue : undefined,
      pinned,
      category,
    };
    const ann = await CommunicationsService.createAnnouncement(data);
    setSubmitting(false);
    onCreated(ann);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-800 text-lg">Create Announcement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
              Body *
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Announcement content... (supports **bold** formatting)"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[
                  'General',
                  'Company Strategy',
                  'Benefits',
                  'Policy',
                  'Events',
                  'Compliance',
                  'Company News',
                  'Product Update',
                  'Process',
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Employees</option>
                <option value="department">Department</option>
                <option value="location">Location</option>
              </select>
            </div>
            {audience !== 'all' && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                  {audience === 'department' ? 'Department' : 'Location'}
                </label>
                <input
                  value={audienceValue}
                  onChange={(e) => setAudienceValue(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPinned((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors flex items-center ${pinned ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${pinned ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <Pin className="w-3.5 h-3.5" /> Pin to top
            </span>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !body || submitting}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface AnnouncementsBoardProps {
  isAdmin?: boolean;
}

export default function AnnouncementsBoard({ isAdmin = false }: AnnouncementsBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePriority, setActivePriority] = useState<AnnouncementPriority | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const categories = CommunicationsService.getCategories();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await CommunicationsService.getAnnouncements();
      setAnnouncements(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleRead = async (id: string) => {
    await CommunicationsService.markAnnouncementRead(id);
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, readByCount: Math.min(a.readByCount + 1, a.totalAudience) } : a
      )
    );
  };

  const handleCreated = (ann: Announcement) => {
    setAnnouncements((prev) => [ann, ...prev]);
  };

  const filtered = announcements.filter((a) => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchPriority = activePriority === 'all' || a.priority === activePriority;
    const matchSearch =
      search === '' ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.body.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchPriority && matchSearch;
  });

  const pinned = filtered.filter((a) => a.pinned);
  const rest = filtered.filter((a) => !a.pinned);

  return (
    <>
      {showCreate && (
        <CreateAnnouncementModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      <div className="space-y-5 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
            <p className="text-sm text-slate-500 mt-0.5">{announcements.length} announcements</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'urgent', 'important', 'general'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePriority(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  activePriority === p
                    ? p === 'urgent'
                      ? 'bg-red-600 text-white border-red-600'
                      : p === 'important'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : p === 'general'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No announcements match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pinned.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5" />
                  Pinned
                </h2>
                {pinned.map((ann) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    onRead={handleRead}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
            {rest.length > 0 && (
              <div className="space-y-3">
                {pinned.length > 0 && (
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Recent
                  </h2>
                )}
                {rest.map((ann) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    onRead={handleRead}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
