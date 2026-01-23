"use client";

import React, { useState } from "react";
import WorkflowDesigner from "@/components/workflow/WorkflowDesigner";
import NodePalette from "@/components/workflow/NodePalette";
import NodeEditor from "@/components/workflow/NodeEditor";

export default function WorkflowDesignerPage() {
  const [activeView, setActiveView] = useState<"designer" | "palette" | "editor">("designer");

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* View Tabs */}
        <div className="flex gap-4 border-b border-cloud dark:border-nebula-purple/50">
          {[
            { key: "designer", label: "Workflow Designer" },
            { key: "palette", label: "Node Palette" },
            { key: "editor", label: "Node Editor" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as typeof activeView)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeView === tab.key
                  ? "border-celestial-indigo text-celestial-indigo"
                  : "border-transparent text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === "designer" && <WorkflowDesigner />}
        {activeView === "palette" && (
          <div className="max-w-sm">
            <NodePalette />
          </div>
        )}
        {activeView === "editor" && (
          <div className="max-w-md">
            <NodeEditor />
          </div>
        )}
      </div>
    </div>
  );
}
