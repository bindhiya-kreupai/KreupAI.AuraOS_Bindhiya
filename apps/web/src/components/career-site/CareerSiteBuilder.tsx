"use client";

import React, { useState } from "react";
import { Globe, Eye, Save, Settings, CheckCircle2 } from "lucide-react";
import JobListingEditor from "./JobListingEditor";
import BrandingCustomizer from "./BrandingCustomizer";
import PreviewPane from "./PreviewPane";

type Tab = "listings" | "branding" | "preview" | "settings";

interface CareerSiteBuilderProps {
  onPublish?: (config: { branding: CareerSiteBranding; listings: JobListing[] }) => void;
}

export interface CareerSiteBranding {
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  logoUrl: string;
}

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  published: boolean;
}

const DEFAULT_BRANDING: CareerSiteBranding = {
  primaryColor: "#4F46E5",
  heroTitle: "Join Our Team",
  heroSubtitle: "Build the future with us. We're hiring passionate people.",
  logoUrl: "",
};

const DEFAULT_LISTINGS: JobListing[] = [
  { id: "1", title: "Senior Software Engineer", department: "Engineering", location: "Remote", type: "Full-time", published: true },
  { id: "2", title: "Product Manager", department: "Product", location: "New York, NY", type: "Full-time", published: true },
  { id: "3", title: "UX Designer", department: "Design", location: "San Francisco, CA", type: "Full-time", published: true },
  { id: "4", title: "HR Business Partner", department: "Human Resources", location: "London, UK", type: "Full-time", published: false },
  { id: "5", title: "Data Analyst", department: "Analytics", location: "Remote", type: "Contract", published: true },
];

export default function CareerSiteBuilder({ onPublish }: CareerSiteBuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [branding, setBranding] = useState<CareerSiteBranding>(DEFAULT_BRANDING);
  const [listings, setListings] = useState<JobListing[]>(DEFAULT_LISTINGS);
  const [saved, setSaved] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "listings", label: "Job Listings", icon: Settings },
    { id: "branding", label: "Branding", icon: Globe },
    { id: "preview", label: "Preview", icon: Eye },
  ];

  const handleSave = () => {
    setSaved(true);
    onPublish?.({ branding, listings });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
            <Globe className="w-5 h-5 text-celestial-indigo" />
            Career Site Builder
          </h2>
          <p className="text-silver-mist text-sm">Design and manage your public careers page.</p>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium flex items-center gap-2">
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Published!" : "Publish Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-deep-cosmos p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === tab.id ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm" : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "listings" && (
        <JobListingEditor listings={listings} onUpdate={setListings} />
      )}
      {activeTab === "branding" && (
        <BrandingCustomizer branding={branding} onChange={setBranding} />
      )}
      {activeTab === "preview" && (
        <PreviewPane branding={branding} listings={listings.filter((l) => l.published)} />
      )}
    </div>
  );
}
