"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Plug, Settings } from "lucide-react";
import type { Integration } from "./IntegrationMarketplace";
import ConnectionWizard from "./ConnectionWizard";

interface IntegrationCardProps {
  integration: Integration;
  viewMode?: "grid" | "list";
}

export default function IntegrationCard({ integration, viewMode = "grid" }: IntegrationCardProps) {
  const [showWizard, setShowWizard] = useState(false);

  const statusConfig = {
    connected: { label: "Connected", color: "text-aurora-green", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CheckCircle2 },
    available: { label: "Available", color: "text-celestial-indigo", bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: Plug },
    coming_soon: { label: "Coming Soon", color: "text-silver-mist", bg: "bg-gray-50 dark:bg-gray-800", icon: Clock },
  };

  const status = statusConfig[integration.status];
  const StatusIcon = status.icon;

  if (viewMode === "list") {
    return (
      <>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/30">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${status.bg} flex items-center justify-center`}>
              <Plug className={`w-5 h-5 ${status.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-black dark:text-pearl">{integration.name}</p>
              <p className="text-xs text-silver-mist">{integration.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium ${status.color} flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            {integration.status === "available" && (
              <button onClick={() => setShowWizard(true)} className="px-3 py-1.5 bg-celestial-indigo text-white rounded-lg text-xs font-medium">
                Connect
              </button>
            )}
            {integration.status === "connected" && (
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-deep-cosmos rounded-lg">
                <Settings className="w-4 h-4 text-silver-mist" />
              </button>
            )}
          </div>
        </div>
        {showWizard && <ConnectionWizard integration={integration} onClose={() => setShowWizard(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/30 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center`}>
            <Plug className={`w-6 h-6 ${status.color}`} />
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>
        <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-1">{integration.name}</h3>
        <p className="text-xs text-silver-mist mb-3 line-clamp-2">{integration.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-silver-mist bg-gray-100 dark:bg-deep-cosmos px-2 py-0.5 rounded-full">
            {integration.category}
          </span>
          {integration.status === "connected" && (
            <span className="text-[10px] text-silver-mist">Synced {integration.lastSync}</span>
          )}
          {integration.status === "available" && (
            <button onClick={() => setShowWizard(true)} className="px-3 py-1 bg-celestial-indigo text-white rounded-lg text-[10px] font-medium">
              Connect
            </button>
          )}
        </div>
      </div>
      {showWizard && <ConnectionWizard integration={integration} onClose={() => setShowWizard(false)} />}
    </>
  );
}
