"use client";

import React, { useState } from "react";
import {
  Play,
  StopCircle,
  UserCheck,
  GitBranch,
  Mail,
  Webhook,
  Timer,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Save,
  Undo2,
  Redo2,
  Settings,
} from "lucide-react";

interface WorkflowNode {
  id: string;
  type: "start" | "end" | "approval" | "condition" | "email" | "webhook" | "wait";
  label: string;
  x: number;
  y: number;
  config?: Record<string, unknown>;
}

interface WorkflowConnection {
  id: string;
  fromNode: string;
  toNode: string;
  label?: string;
}

interface NodeType {
  type: WorkflowNode["type"];
  label: string;
  icon: React.ReactNode;
  color: string;
}

const nodeTypes: NodeType[] = [
  { type: "start", label: "Start", icon: <Play className="w-4 h-4" />, color: "bg-aurora-green" },
  { type: "end", label: "End", icon: <StopCircle className="w-4 h-4" />, color: "bg-coral-alert" },
  { type: "approval", label: "Approval", icon: <UserCheck className="w-4 h-4" />, color: "bg-celestial-indigo" },
  { type: "condition", label: "Condition", icon: <GitBranch className="w-4 h-4" />, color: "bg-sunset-amber" },
  { type: "email", label: "Email", icon: <Mail className="w-4 h-4" />, color: "bg-sky-500" },
  { type: "webhook", label: "Webhook", icon: <Webhook className="w-4 h-4" />, color: "bg-purple-500" },
  { type: "wait", label: "Wait", icon: <Timer className="w-4 h-4" />, color: "bg-gray-500" },
];

const mockNodes: WorkflowNode[] = [
  { id: "n-001", type: "start", label: "Request Submitted", x: 100, y: 200 },
  { id: "n-002", type: "approval", label: "Manager Approval", x: 300, y: 200 },
  { id: "n-003", type: "condition", label: "Amount > $5000?", x: 500, y: 200 },
  { id: "n-004", type: "approval", label: "Director Approval", x: 700, y: 120 },
  { id: "n-005", type: "email", label: "Notify Requester", x: 700, y: 280 },
  { id: "n-006", type: "end", label: "Complete", x: 900, y: 200 },
];

const mockConnections: WorkflowConnection[] = [
  { id: "c-001", fromNode: "n-001", toNode: "n-002" },
  { id: "c-002", fromNode: "n-002", toNode: "n-003" },
  { id: "c-003", fromNode: "n-003", toNode: "n-004", label: "Yes" },
  { id: "c-004", fromNode: "n-003", toNode: "n-005", label: "No" },
  { id: "c-005", fromNode: "n-004", toNode: "n-006" },
  { id: "c-006", fromNode: "n-005", toNode: "n-006" },
];

export default function WorkflowDesigner() {
  const [nodes] = useState<WorkflowNode[]>(mockNodes);
  const [connections] = useState<WorkflowConnection[]>(mockConnections);
  const [selectedNode, setSelectedNode] = useState<string | null>("n-002");
  const [zoom] = useState(100);

  const getNodeConfig = (type: WorkflowNode["type"]) => {
    return nodeTypes.find((n) => n.type === type);
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <GitBranch className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Workflow Designer
            </h2>
            <p className="text-sm text-silver-mist">
              Visual workflow builder with drag-and-drop nodes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded-lg hover:bg-gray-100 dark:hover:bg-nebula-purple/10">
            <Undo2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded-lg hover:bg-gray-100 dark:hover:bg-nebula-purple/10">
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-cloud dark:bg-nebula-purple/50 mx-1" />
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[500px]">
        {/* Node Palette Sidebar */}
        <div className="w-48 flex-shrink-0 border border-cloud dark:border-nebula-purple/50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-3">
            Node Palette
          </h3>
          <div className="space-y-2">
            {nodeTypes.map((nodeType) => (
              <div
                key={nodeType.type}
                draggable
                className="flex items-center gap-2.5 p-2 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 cursor-grab active:cursor-grabbing transition-colors"
              >
                <div className={`p-1.5 rounded text-white ${nodeType.color}`}>
                  {nodeType.icon}
                </div>
                <span className="text-xs font-medium text-ink-black dark:text-pearl">
                  {nodeType.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative border border-cloud dark:border-nebula-purple/50 rounded-lg bg-gray-50 dark:bg-stellar-blue/30 overflow-hidden">
          {/* Canvas Grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn) => {
              const from = nodes.find((n) => n.id === conn.fromNode);
              const to = nodes.find((n) => n.id === conn.toNode);
              if (!from || !to) return null;
              const fromX = from.x + 60;
              const fromY = from.y + 20;
              const toX = to.x;
              const toY = to.y + 20;
              const midX = (fromX + toX) / 2;
              return (
                <g key={conn.id}>
                  <path
                    d={`M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`}
                    stroke="#6366f1"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.5"
                  />
                  {conn.label && (
                    <text
                      x={midX}
                      y={(fromY + toY) / 2 - 8}
                      textAnchor="middle"
                      className="text-[10px] fill-current text-silver-mist"
                      fill="#94a3b8"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const config = getNodeConfig(node.type);
            const isSelected = selectedNode === node.id;
            return (
              <div
                key={node.id}
                className={`absolute flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-white dark:bg-stellar-blue shadow-sm cursor-pointer transition-all ${
                  isSelected
                    ? "border-celestial-indigo shadow-md scale-105"
                    : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30"
                }`}
                style={{ left: node.x, top: node.y }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className={`p-1 rounded text-white ${config?.color}`}>
                  {config?.icon}
                </div>
                <span className="text-xs font-medium text-ink-black dark:text-pearl whitespace-nowrap">
                  {node.label}
                </span>
              </div>
            );
          })}

          {/* Canvas Controls */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg p-1">
            <button className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-silver-mist px-2">{zoom}%</span>
            <button className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded">
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-cloud dark:bg-nebula-purple/50" />
            <button className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded">
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded">
              <Move className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-56 flex-shrink-0 border border-cloud dark:border-nebula-purple/50 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Properties
          </h3>
          {selectedNodeData ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-silver-mist block mb-1">Type</label>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-cloud dark:border-nebula-purple/50 bg-gray-50 dark:bg-stellar-blue/50">
                  <div className={`p-1 rounded text-white ${getNodeConfig(selectedNodeData.type)?.color}`}>
                    {getNodeConfig(selectedNodeData.type)?.icon}
                  </div>
                  <span className="text-xs text-ink-black dark:text-pearl capitalize">
                    {selectedNodeData.type}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs text-silver-mist block mb-1">Label</label>
                <input
                  type="text"
                  defaultValue={selectedNodeData.label}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                />
              </div>
              {selectedNodeData.type === "approval" && (
                <div>
                  <label className="text-xs text-silver-mist block mb-1">Approvers</label>
                  <select className="w-full px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
                    <option>Direct Manager</option>
                    <option>Department Head</option>
                    <option>HR Director</option>
                  </select>
                </div>
              )}
              {selectedNodeData.type === "condition" && (
                <div>
                  <label className="text-xs text-silver-mist block mb-1">Condition</label>
                  <input
                    type="text"
                    defaultValue="amount > 5000"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-silver-mist block mb-1">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    defaultValue={selectedNodeData.x}
                    className="px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                    placeholder="X"
                  />
                  <input
                    type="number"
                    defaultValue={selectedNodeData.y}
                    className="px-2.5 py-1.5 text-xs rounded border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
                    placeholder="Y"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-silver-mist text-center py-8">
              Select a node to view properties
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
