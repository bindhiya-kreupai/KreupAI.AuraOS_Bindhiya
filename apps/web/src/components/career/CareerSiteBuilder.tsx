"use client";

import React, { useState } from 'react';
import { Globe, Palette, Eye, FileText, Plus } from 'lucide-react';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  published: boolean;
}

const mockListings: JobListing[] = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', published: true },
  { id: '2', title: 'Product Designer', department: 'Design', location: 'New York', type: 'Full-time', published: true },
  { id: '3', title: 'DevOps Engineer', department: 'Engineering', location: 'London', type: 'Full-time', published: false },
  { id: '4', title: 'Marketing Manager', department: 'Marketing', location: 'Chicago', type: 'Full-time', published: true },
];

export function CareerSiteBuilder() {
  const [activeTab, setActiveTab] = useState<'listings' | 'branding' | 'preview'>('listings');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-deep-cosmos rounded-lg p-1 w-fit">
        {[
          { id: 'listings' as const, label: 'Job Listings', icon: FileText },
          { id: 'branding' as const, label: 'Branding', icon: Palette },
          { id: 'preview' as const, label: 'Preview', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm' : 'text-silver-mist hover:text-ink-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'listings' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-silver-mist">{mockListings.filter((l) => l.published).length} published listings</p>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-celestial-indigo rounded-lg">
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </button>
          </div>
          {mockListings.map((listing) => (
            <div key={listing.id} className="bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">{listing.title}</p>
                <p className="text-xs text-silver-mist">{listing.department} &middot; {listing.location} &middot; {listing.type}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                listing.published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-silver-mist'
              }`}>
                {listing.published ? 'Published' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 space-y-4">
          <h4 className="text-sm font-bold text-ink-black dark:text-pearl">Career Site Branding</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Company Logo</label>
              <div className="w-full h-20 border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-lg flex items-center justify-center text-xs text-silver-mist cursor-pointer hover:border-celestial-indigo/50">
                Click to upload logo
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Hero Banner</label>
              <div className="w-full h-20 border-2 border-dashed border-cloud dark:border-nebula-purple/30 rounded-lg flex items-center justify-center text-xs text-silver-mist cursor-pointer hover:border-celestial-indigo/50">
                Click to upload banner
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Primary Color</label>
              <input type="color" defaultValue="#4B3BF5" className="w-full h-10 rounded-lg border border-cloud cursor-pointer" />
            </div>
            <div>
              <label className="text-xs font-medium text-silver-mist uppercase mb-1 block">Tagline</label>
              <input type="text" defaultValue="Join our team and make an impact" className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/50 rounded-lg text-ink-black dark:text-pearl outline-none" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-5 text-center">
          <Globe className="w-8 h-8 text-celestial-indigo mx-auto mb-3" />
          <h4 className="text-sm font-bold text-ink-black dark:text-pearl mb-1">Career Site Preview</h4>
          <p className="text-xs text-silver-mist mb-4">Preview how your career site will look to candidates</p>
          <button className="px-4 py-2 text-xs font-medium text-white bg-celestial-indigo rounded-lg">Open Preview</button>
        </div>
      )}
    </div>
  );
}
