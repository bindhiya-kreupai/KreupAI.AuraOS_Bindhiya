"use client";

import React from "react";
import { MapPin, Briefcase, ArrowRight, ExternalLink } from "lucide-react";
import type { CareerSiteBranding, JobListing } from "./CareerSiteBuilder";

interface PreviewPaneProps {
  branding: CareerSiteBranding;
  listings: JobListing[];
}

export default function PreviewPane({ branding, listings }: PreviewPaneProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Live Preview</h3>
        <button className="px-3 py-1.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-xs font-medium flex items-center gap-1.5 text-ink-black dark:text-pearl">
          <ExternalLink className="w-3.5 h-3.5" />
          Open in New Tab
        </button>
      </div>

      {/* Preview Frame */}
      <div className="border border-cloud dark:border-nebula-purple/30 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <div className="px-8 py-12 text-center text-white" style={{ backgroundColor: branding.primaryColor }}>
          <h1 className="text-3xl font-bold mb-2">{branding.heroTitle || "Join Our Team"}</h1>
          <p className="text-white/80 text-sm max-w-lg mx-auto">{branding.heroSubtitle || "We're hiring passionate people."}</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <input type="text" placeholder="Search jobs..." className="px-4 py-2 rounded-lg bg-white/20 text-white placeholder:text-white/60 text-sm w-64 border border-white/30" readOnly />
            <button className="px-4 py-2 bg-white text-sm font-medium rounded-lg" style={{ color: branding.primaryColor }}>
              Search
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="p-6 space-y-3">
          <h2 className="text-lg font-bold text-ink-black dark:text-pearl mb-4">
            Open Positions ({listings.length})
          </h2>
          {listings.map((listing) => (
            <div key={listing.id} className="p-4 border border-cloud dark:border-nebula-purple/30 rounded-lg hover:border-celestial-indigo/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink-black dark:text-pearl group-hover:text-celestial-indigo transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-silver-mist">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {listing.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.location}
                    </span>
                    <span className="bg-gray-100 dark:bg-deep-cosmos px-2 py-0.5 rounded-full">
                      {listing.type}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-silver-mist group-hover:text-celestial-indigo transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
