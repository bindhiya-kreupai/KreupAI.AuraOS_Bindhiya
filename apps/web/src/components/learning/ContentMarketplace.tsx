/**
 * @module ContentMarketplace
 * @description External Content Marketplace — multi-provider browsing, course import,
 *              license tracking, trending courses, provider status (Sec 21.4)
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Star,
  Clock,
  Users,
  Download,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Wifi,
  WifiOff,
  BarChart3,
  TrendingUp,
  Zap,
  Globe,
} from 'lucide-react';
import {
  ExternalContentService,
  type ExternalCourse,
  type ProviderConfig,
  type LicenseUsage,
  type ContentProvider,
  type CourseLevel,
} from '@/services/externalContentService';

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={
            i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Provider Color Map ────────────────────────────────────────────────────────

const PROVIDER_STYLES: Record<
  ContentProvider | 'internal',
  { border: string; bg: string; text: string }
> = {
  coursera: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800' },
  udemy: { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-800' },
  linkedin_learning: { border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-sky-800' },
  youtube: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800' },
  pluralsight: { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-800' },
  internal: { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-800' },
};

function ProviderBadge({ provider, name }: { provider: ContentProvider; name?: string }) {
  const style = PROVIDER_STYLES[provider];
  const labels: Record<ContentProvider, string> = {
    coursera: 'Coursera',
    udemy: 'Udemy',
    linkedin_learning: 'LinkedIn Learning',
    youtube: 'YouTube',
    pluralsight: 'Pluralsight',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${style.border} ${style.bg} ${style.text}`}
    >
      {name ?? labels[provider]}
    </span>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onImport,
}: {
  course: ExternalCourse;
  onImport: (course: ExternalCourse) => void;
}) {
  const levelLabels: Record<CourseLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    all_levels: 'All Levels',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
          {course.thumbnailEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {course.title}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">By {course.instructor}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <ProviderBadge provider={course.provider} />
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
          {levelLabels[course.level]}
        </span>
        {course.certificate && (
          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
            Certificate
          </span>
        )}
        {course.isFree && (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
            Free
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
        <StarRow rating={course.rating} />
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {course.durationHours}h
        </span>
        <span className="flex items-center gap-1">
          <Users size={10} />
          {(course.enrolledCount / 1000).toFixed(0)}K
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {course.skills.slice(0, 3).map((skill) => (
          <span key={skill} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
            {skill}
          </span>
        ))}
        {course.skills.length > 3 && (
          <span className="text-xs text-gray-400">+{course.skills.length - 3}</span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2">
        {course.isImported ? (
          <div className="flex-1 flex items-center gap-1.5 py-1.5 text-green-700 text-xs font-medium">
            <CheckCircle size={13} /> Added to catalog
          </div>
        ) : (
          <button
            onClick={() => onImport(course)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            <Download size={13} /> Import to Catalog
          </button>
        )}
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <ExternalLink size={13} className="text-gray-500" />
        </a>
      </div>
    </div>
  );
}

// ── License Usage Bar ─────────────────────────────────────────────────────────

function LicenseBar({ usage }: { usage: LicenseUsage }) {
  const pct = usage.utilizationRate;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="p-4 border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <ProviderBadge provider={usage.provider} name={usage.providerName} />
        <span className="text-xs text-gray-400">${usage.monthlyFee.toLocaleString()}/mo</span>
      </div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500">
          {usage.usedLicenses}/{usage.totalLicenses} seats
        </span>
        <span
          className={`font-bold ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'}`}
        >
          {pct.toFixed(0)}% utilized
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
        <span>${usage.costPerActiveUser.toFixed(2)}/active user</span>
        <span>Expires {usage.expiryDate}</span>
      </div>
    </div>
  );
}

// ── Provider Status Card ──────────────────────────────────────────────────────

function ProviderStatusCard({ provider }: { provider: ProviderConfig }) {
  return (
    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
      <div className="text-2xl">{provider.logo}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{provider.name}</span>
          {provider.isConnected ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Wifi size={10} /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <WifiOff size={10} /> Disconnected
            </span>
          )}
        </div>
        {provider.isConnected && (
          <p className="text-xs text-gray-400 mt-0.5">
            {provider.totalCourses.toLocaleString()} courses · Last synced{' '}
            {provider.lastSynced ? new Date(provider.lastSynced).toLocaleDateString() : 'Never'}
          </p>
        )}
      </div>
      {provider.isConnected && provider.licenseCount > 0 && (
        <div className="text-right text-xs">
          <p className="font-semibold text-gray-800">
            {provider.licenseUsed}/{provider.licenseCount}
          </p>
          <p className="text-gray-400">seats</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type TabType = 'browse' | 'licenses' | 'providers';

export default function ContentMarketplace() {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [licenseUsage, setLicenseUsage] = useState<LicenseUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState<ContentProvider | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all');
  const [search, setSearch] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [_importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [c, p, l] = await Promise.all([
        ExternalContentService.searchExternalContent({}),
        ExternalContentService.getContentProviders(),
        ExternalContentService.getLicenseUsage(),
      ]);
      setCourses(c);
      setProviders(p);
      setLicenseUsage(l);
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = async () => {
    const results = await ExternalContentService.searchExternalContent({
      query: search || undefined,
      provider: providerFilter === 'all' ? undefined : providerFilter,
      level: levelFilter === 'all' ? undefined : levelFilter,
      isFree: freeOnly || undefined,
    });
    setCourses(results);
  };

  useEffect(() => {
    if (!loading) handleSearch();
  }, [providerFilter, levelFilter, freeOnly]);

  const handleImport = async (course: ExternalCourse) => {
    setImportingId(course.id);
    try {
      const result = await ExternalContentService.importCourse(course.externalId, course.provider);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === course.id ? { ...c, isImported: true, importStatus: 'imported' } : c
          )
        );
      }
    } finally {
      setImportingId(null);
    }
  };

  const trendingCourses = [...courses]
    .sort((a, b) => b.enrolledCount - a.enrolledCount)
    .slice(0, 5);
  const filteredCourses = courses;

  const TABS = [
    { id: 'browse' as TabType, label: 'Browse Courses', icon: <Globe size={14} /> },
    { id: 'licenses' as TabType, label: 'License Usage', icon: <BarChart3 size={14} /> },
    { id: 'providers' as TabType, label: 'Providers', icon: <Zap size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const connectedProviders = providers.filter((p) => p.isConnected);
  const importedCount = courses.filter((c) => c.isImported).length;
  const totalCatalogCourses = providers
    .filter((p) => p.isConnected)
    .reduce((s, p) => s + p.totalCourses, 0);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse and import courses from Coursera, Udemy, LinkedIn Learning, and more
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Connected Providers',
            value: connectedProviders.length,
            icon: <Wifi size={18} className="text-blue-600" />,
            bg: 'bg-blue-50',
          },
          {
            label: 'Available Courses',
            value: `${(totalCatalogCourses / 1000).toFixed(0)}K+`,
            icon: <Globe size={18} className="text-green-600" />,
            bg: 'bg-green-50',
          },
          {
            label: 'Imported to Catalog',
            value: importedCount,
            icon: <Download size={18} className="text-purple-600" />,
            bg: 'bg-purple-50',
          },
          {
            label: 'Active Learners',
            value: licenseUsage.reduce((s, l) => s + l.usedLicenses, 0),
            icon: <Users size={18} className="text-amber-600" />,
            bg: 'bg-amber-50',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3"
          >
            <div className={`p-2.5 rounded-lg ${kpi.bg}`}>{kpi.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trending Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-orange-500" />
          Trending Courses
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {trendingCourses.map((c) => (
            <div
              key={c.id}
              className="flex-shrink-0 flex items-center gap-2 p-3 border border-gray-100 rounded-xl w-56 hover:border-blue-200 transition-all"
            >
              <div className="text-xl">{c.thumbnailEmoji}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{c.title}</p>
                <ProviderBadge provider={c.provider} />
                <StarRow rating={c.rating} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {/* Browse Courses */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-48 relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search courses, skills, topics..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value as ContentProvider | 'all')}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All Providers</option>
                  <option value="coursera">Coursera</option>
                  <option value="udemy">Udemy</option>
                  <option value="linkedin_learning">LinkedIn Learning</option>
                  <option value="youtube">YouTube</option>
                </select>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value as CourseLevel | 'all')}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <label className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={freeOnly}
                    onChange={(e) => setFreeOnly(e.target.checked)}
                    className="rounded"
                  />
                  Free only
                </label>
                <button
                  onClick={handleSearch}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{filteredCourses.length} courses found</p>
                <p className="text-xs text-gray-400">{importedCount} imported to catalog</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} onImport={handleImport} />
                ))}
              </div>
            </div>
          )}

          {/* License Usage */}
          {activeTab === 'licenses' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Monitor seat utilization and cost-per-learner across all paid content providers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {licenseUsage.map((usage) => (
                  <LicenseBar key={usage.provider} usage={usage} />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {licenseUsage.map((usage) => (
                  <div key={usage.provider} className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      {usage.providerName} — Top Courses
                    </h4>
                    <div className="space-y-1.5">
                      {usage.topCourses.map((c) => (
                        <div key={c.courseId} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 truncate flex-1">{c.title}</span>
                          <span className="text-blue-600 font-medium ml-2">{c.enrollments}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Providers */}
          {activeTab === 'providers' && (
            <div className="space-y-3">
              {providers.map((provider) => (
                <ProviderStatusCard key={provider.id} provider={provider} />
              ))}
              {providers.filter((p) => !p.isConnected).length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 font-medium">Connect More Providers</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Connect additional content providers to expand your learning catalog. Contact
                    your CSM or visit the Admin settings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
