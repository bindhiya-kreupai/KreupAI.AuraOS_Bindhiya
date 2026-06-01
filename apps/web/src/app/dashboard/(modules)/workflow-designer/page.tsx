"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import WorkflowDesigner from "@/components/workflow/WorkflowDesigner";
import NodePalette from "@/components/workflow/NodePalette";
import NodeEditor from "@/components/workflow/NodeEditor";

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  triggerEvent: string | null;
  nodes: unknown[];
  edges: unknown[];
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: { instances: number };
}

export default function WorkflowDesignerPage() {
  const [activeView, setActiveView] = useState<"designer" | "palette" | "editor">("designer");
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = useCallback(() => {}, []);

  // Fetch all workflows on mount
  useEffect(() => {
    fetch("/api/v1/admin/workflows")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setWorkflows(result.data || []);
          if (result.data && result.data.length > 0) {
            setSelectedWorkflowId(result.data[0].id);
            setSelectedWorkflow(result.data[0]);
          }
        } else {
          setError("Failed to load workflows");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch workflows:", err);
        setError("Failed to load workflows. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // When a different workflow is selected, update selectedWorkflow
  useEffect(() => {
    if (!selectedWorkflowId) return;
    const found = workflows.find((w) => w.id === selectedWorkflowId);
    if (found) setSelectedWorkflow(found);
  }, [selectedWorkflowId, workflows]);

  // Save workflow handler
  const handleSaveWorkflow = async (data: { nodes: unknown[]; edges: unknown[] }) => {
    if (!selectedWorkflow) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/workflows/${selectedWorkflow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: data.nodes,
          edges: data.edges,
        }),
      });
      const result = await res.json();
      if (result.success) {
        // Update the workflow in our local state
        setWorkflows((prev) =>
          prev.map((w) => (w.id === selectedWorkflow.id ? { ...w, ...result.data } : w))
        );
        setSelectedWorkflow(result.data);
      }
    } catch (err: any) {
      console.error("Failed to save workflow:", err);
    } finally {
      setSaving(false);
    }
  };

  // Create new workflow
  const handleCreateWorkflow = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/admin/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Workflow",
          description: "A new workflow definition",
          trigger: "MANUAL",
          nodes: [],
          edges: [],
        }),
      });
      const result = await res.json();
      if (result.success) {
        setWorkflows((prev) => [...prev, result.data]);
        setSelectedWorkflowId(result.data.id);
        setSelectedWorkflow(result.data);
      }
    } catch (err: any) {
      console.error("Failed to create workflow:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
          <div className="flex gap-3 border-b border-cloud dark:border-nebula-purple/50 pb-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-28" />
            ))}
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-64" />
          <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-lg font-bold text-ink-black dark:text-pearl">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-celestial-indigo text-white rounded-lg font-medium text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Workflow Selector */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-ink-black dark:text-pearl">Workflow:</label>
          <select
            value={selectedWorkflowId}
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            className="px-4 py-2 text-sm border border-cloud dark:border-nebula-purple/50 rounded-lg bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50"
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.name} ({wf.isActive ? "Active" : "Inactive"})
              </option>
            ))}
          </select>
          <button
            onClick={handleCreateWorkflow}
            disabled={saving}
            className="px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "+ New Workflow"}
          </button>
          <span className="text-xs text-silver-mist ml-auto">
            {workflows.length} workflows | {workflows.filter((w) => w.isActive).length} active
          </span>
        </div>

        {/* View Tabs */}
        <div className="flex gap-3 border-b border-cloud dark:border-nebula-purple/50">
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
        {activeView === "designer" && (
          <WorkflowDesigner
            workflowDefinition={selectedWorkflow}
            onSave={handleSaveWorkflow}
            saving={saving}
          />
        )}
        {activeView === "palette" && (
          <div className="max-w-sm">
            <NodePalette onDragStart={handleDragStart} />
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

