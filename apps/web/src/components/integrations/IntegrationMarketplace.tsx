"use client";

import React, { useState } from "react";
import { Search, Filter, Grid, List } from "lucide-react";
import IntegrationCard from "./IntegrationCard";

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: "connected" | "available" | "coming_soon";
  lastSync?: string;
}

const INTEGRATIONS: Integration[] = [
  { id: "slack", name: "Slack", description: "Send notifications and approvals to Slack channels", category: "Communication", icon: "slack", status: "connected", lastSync: "2 min ago" },
  { id: "teams", name: "Microsoft Teams", description: "Adaptive cards and notifications in Teams", category: "Communication", icon: "teams", status: "connected", lastSync: "5 min ago" },
  { id: "google-cal", name: "Google Calendar", description: "Sync leave and meetings to Google Calendar", category: "Calendar", icon: "calendar", status: "available" },
  { id: "outlook", name: "Outlook Calendar", description: "Sync events to Microsoft Outlook", category: "Calendar", icon: "calendar", status: "connected", lastSync: "10 min ago" },
  { id: "docusign", name: "DocuSign", description: "E-signatures for offer letters and contracts", category: "Documents", icon: "docusign", status: "available" },
  { id: "quickbooks", name: "QuickBooks", description: "Sync payroll data to QuickBooks", category: "Finance", icon: "finance", status: "available" },
  { id: "jira", name: "Jira", description: "Sync project time tracking with Jira issues", category: "Project Management", icon: "jira", status: "coming_soon" },
  { id: "bamboo", name: "BambooHR", description: "Import employee data from BambooHR", category: "HRIS", icon: "bamboo", status: "coming_soon" },
  { id: "okta", name: "Okta", description: "Single Sign-On and user provisioning", category: "Security", icon: "okta", status: "available" },
  { id: "xero", name: "Xero", description: "Sync payroll and expense data with Xero", category: "Finance", icon: "finance", status: "available" },
  { id: "linkedin", name: "LinkedIn", description: "Post jobs and import candidate profiles", category: "Recruitment", icon: "linkedin", status: "available" },
  { id: "zoom", name: "Zoom", description: "Schedule and join video interviews", category: "Communication", icon: "zoom", status: "connected", lastSync: "1 hour ago" },
];

const CATEGORIES = ["All", "Communication", "Calendar", "Documents", "Finance", "Security", "Recruitment", "Project Management", "HRIS"];

export default function IntegrationMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = INTEGRATIONS.filter((int) => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) || int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || int.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    connected: INTEGRATIONS.filter((i) => i.status === "connected").length,
    available: INTEGRATIONS.filter((i) => i.status === "available").length,
    total: INTEGRATIONS.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-black dark:text-pearl">Integration Marketplace</h2>
          <p className="text-silver-mist text-sm">{stats.connected} connected, {stats.available} available, {stats.total} total integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-celestial-indigo text-white" : "bg-gray-100 dark:bg-deep-cosmos text-silver-mist"}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-celestial-indigo text-white" : "bg-gray-100 dark:bg-deep-cosmos text-silver-mist"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
          <input type="text" placeholder="Search integrations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-lg text-sm text-ink-black dark:text-pearl" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-silver-mist shrink-0" />
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${selectedCategory === cat ? "bg-celestial-indigo text-white" : "bg-gray-100 dark:bg-deep-cosmos text-silver-mist"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        {filtered.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
}
