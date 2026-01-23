"use client";

import React, { useState } from 'react';
import { Globe, Eye } from 'lucide-react';
import CareerSiteBuilder from '@/components/career-site/CareerSiteBuilder';
import JobListingEditor from '@/components/career-site/JobListingEditor';
import BrandingCustomizer from '@/components/career-site/BrandingCustomizer';
import PreviewPane from '@/components/career-site/PreviewPane';

type Tab = 'builder' | 'listings' | 'branding' | 'preview';

export default function CareerSiteModulePage() {
  const [activeTab, setActiveTab] = useState<Tab>('builder');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'builder', label: 'Builder' },
    { key: 'listings', label: 'Job Listings' },
    { key: 'branding', label: 'Branding' },
    { key: 'preview', label: 'Preview' },
  ];

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
          <button className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors">
            Publish Changes
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Active Listings</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">12</p>
          <p className="text-[10px] text-slate-400">3 new this week</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Page Views</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">2,847</p>
          <p className="text-[10px] text-slate-400">Last 30 days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Applications</p>
          <p className="text-2xl font-bold text-green-600 mt-1">156</p>
          <p className="text-[10px] text-slate-400">+23% from last month</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-medium">Conversion Rate</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">5.5%</p>
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
        {activeTab === 'builder' && <CareerSiteBuilder />}
        {activeTab === 'listings' && <JobListingEditor />}
        {activeTab === 'branding' && <BrandingCustomizer />}
        {activeTab === 'preview' && <PreviewPane />}
      </div>
    </div>
  );
}
