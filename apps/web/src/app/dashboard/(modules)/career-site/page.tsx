"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Eye, Briefcase, Loader2 } from 'lucide-react';

interface SiteConfig {
  companyName: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  socialLinks: { linkedin: string; twitter: string; glassdoor: string };
  benefits: string[];
  activeJobCount: number;
  isPublished: boolean;
  lastUpdatedAt: string;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  isActive: boolean;
  postedDate: string;
  metrics: { views: number; clicks: number; applies: number };
}

interface RecruitmentAnalytics {
  overview: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    newApplicationsThisPeriod: number;
  };
  pipelineMetrics: {
    applicationToInterviewRate: number;
    offerAcceptanceRate: number;
  };
}

type Tab = 'builder' | 'listings' | 'branding' | 'preview';

export default function CareerSiteModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('builder');
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [analytics, setAnalytics] = useState<RecruitmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/recruitment/career-site').then(res => res.json()),
      fetch('/api/recruitment/jobs').then(res => res.json()),
      fetch('/api/recruitment/analytics').then(res => res.json()),
    ])
      .then(([siteRes, jobsRes, analyticsRes]) => {
        if (siteRes.success && siteRes.data?.siteConfig) {
          setSiteConfig(siteRes.data.siteConfig);
        }
        if (jobsRes.data) {
          setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        }
        if (analyticsRes.overview) {
          setAnalytics(analyticsRes);
        }
      })
      .catch((err) => {
        console.error('Failed to load career site data:', err);
        setError('Failed to load career site data. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePublish = async () => {
    if (!siteConfig) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/v1/recruitment/career-site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...siteConfig, isPublished: true }),
      });
      const result = await res.json();
      if (result.success) {
        setSiteConfig(prev => prev ? { ...prev, isPublished: true, lastUpdatedAt: new Date().toISOString() } : prev);
      }
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'builder', label: 'Builder' },
    { key: 'listings', label: 'Job Listings' },
    { key: 'branding', label: 'Branding' },
    { key: 'preview', label: 'Preview' },
  ];

  // Derived stats
  const activeListings = jobs.filter(j => j.isActive).length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.metrics?.views || 0), 0);
  const totalApplications = analytics?.overview?.totalApplications ?? jobs.reduce((sum, j) => sum + (j.metrics?.applies || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : '0.0';
  const newThisWeek = jobs.filter(j => {
    const posted = new Date(j.postedDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return posted >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-2 p-6">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-slate-500">Loading career site data...</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-1" />
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            Career Site Builder
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Design and manage your public careers page
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('preview')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {publishing && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Changes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Active Listings</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{activeListings}</p>
          <p className="text-[10px] text-slate-400">{newThisWeek} new this week</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Page Views</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalViews.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Aggregated from all listings</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Applications</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalApplications.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Total applications received</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Conversion Rate</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{conversionRate}%</p>
          <p className="text-[10px] text-slate-400">Views to applications</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'builder' && siteConfig && (
          <CareerSiteBuilderPanel config={siteConfig} onUpdate={setSiteConfig} />
        )}
        {activeTab === 'listings' && (
          <JobListingEditorPanel jobs={jobs} />
        )}
        {activeTab === 'branding' && siteConfig && (
          <BrandingCustomizerPanel config={siteConfig} onUpdate={setSiteConfig} />
        )}
        {activeTab === 'preview' && siteConfig && (
          <PreviewPanePanel config={siteConfig} jobs={jobs.filter(j => j.isActive)} />
        )}
      </div>
    </div>
  );
}

/* ---- Inline sub-components (replacing the external imports) ---- */

function CareerSiteBuilderPanel({ config, onUpdate }: { config: SiteConfig; onUpdate: (c: SiteConfig) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Site Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Company Name</label>
          <input
            type="text"
            value={config.companyName}
            onChange={e => onUpdate({ ...config, companyName: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tagline</label>
          <input
            type="text"
            value={config.tagline}
            onChange={e => onUpdate({ ...config, tagline: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
        <textarea
          value={config.description}
          onChange={e => onUpdate({ ...config, description: e.target.value })}
          className="w-full h-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Benefits</label>
        <div className="flex flex-wrap gap-2">
          {config.benefits.map((b, i) => (
            <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium">
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Status: {config.isPublished ? 'Published' : 'Draft'}</span>
        <span>|</span>
        <span>Last updated: {new Date(config.lastUpdatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function JobListingEditorPanel({ jobs }: { jobs: JobPosting[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Title</th>
            <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Department</th>
            <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Location</th>
            <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Status</th>
            <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Views</th>
            <th className="text-left p-3 text-xs font-bold text-slate-500 uppercase">Applies</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-slate-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No job listings found. Create your first job posting.
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{job.title}</td>
                <td className="p-3 text-slate-500">{job.department}</td>
                <td className="p-3 text-slate-500">{job.location}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    job.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{job.metrics?.views ?? 0}</td>
                <td className="p-3 text-slate-500">{job.metrics?.applies ?? 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BrandingCustomizerPanel({ config, onUpdate }: { config: SiteConfig; onUpdate: (c: SiteConfig) => void }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Brand Customization</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={e => onUpdate({ ...config, primaryColor: e.target.value })}
              className="w-10 h-10 rounded border-0 cursor-pointer"
            />
            <span className="text-sm text-slate-500 font-mono">{config.primaryColor}</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Secondary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.secondaryColor}
              onChange={e => onUpdate({ ...config, secondaryColor: e.target.value })}
              className="w-10 h-10 rounded border-0 cursor-pointer"
            />
            <span className="text-sm text-slate-500 font-mono">{config.secondaryColor}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">LinkedIn</label>
          <input
            type="text"
            value={config.socialLinks.linkedin}
            onChange={e => onUpdate({ ...config, socialLinks: { ...config.socialLinks, linkedin: e.target.value } })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Twitter</label>
          <input
            type="text"
            value={config.socialLinks.twitter}
            onChange={e => onUpdate({ ...config, socialLinks: { ...config.socialLinks, twitter: e.target.value } })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Glassdoor</label>
          <input
            type="text"
            value={config.socialLinks.glassdoor}
            onChange={e => onUpdate({ ...config, socialLinks: { ...config.socialLinks, glassdoor: e.target.value } })}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );
}

function PreviewPanePanel({ config, jobs }: { config: SiteConfig; jobs: JobPosting[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Banner */}
      <div
        className="h-48 flex items-center justify-center relative"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="text-center text-white z-10">
          <h2 className="text-3xl font-bold">{config.companyName}</h2>
          <p className="text-lg opacity-90 mt-2">{config.tagline}</p>
        </div>
      </div>
      {/* Description */}
      <div className="p-6 text-center max-w-2xl mx-auto">
        <p className="text-slate-600 dark:text-slate-400">{config.description}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {config.benefits.map((b, i) => (
            <span key={i} className="px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: `${config.secondaryColor}20`, color: config.secondaryColor }}>
              {b}
            </span>
          ))}
        </div>
      </div>
      {/* Job Listings Preview */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Open Positions ({jobs.length})</h3>
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-300 transition-colors">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">{job.title}</h4>
                <p className="text-sm text-slate-500">{job.department} &middot; {job.location} &middot; {job.type}</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: config.primaryColor }}>
                Apply
              </button>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-center text-slate-400 py-8">No active positions to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}
