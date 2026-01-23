"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Play,
  CircleStop,
  UserCheck,
  GitBranch,
  Mail,
  Timer,
  MousePointer2,
} from "lucide-react";

interface CanvasNode {
  id: string;
  type: "start" | "end" | "approval" | "condition" | "action" | "delay";
  label: string;
  x: number;
  y: number;
}

interface CanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

interface WorkflowCanvasProps {
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
  onNodeSelect?: (nodeId: string) => void;
}

const nodeTypeConfig: Record<
  CanvasNode["type"],
  { icon: React.ReactNode; color: string; bgClass: string }
> = {
  start: {
    icon: <Play className="w-4 h-4" />,
    color: "#10b981",
    bgClass: "bg-aurora-green",
  },
  end: {
    icon: <CircleStop className="w-4 h-4" />,
    color: "#ef4444",
    bgClass: "bg-coral-alert",
  },
  approval: {
    icon: <UserCheck className="w-4 h-4" />,
    color: "#6366f1",
    bgClass: "bg-celestial-indigo",
  },
  condition: {
    icon: <GitBranch className="w-4 h-4" />,
    color: "#f59e0b",
    bgClass: "bg-sunset-amber",
  },
  action: {
    icon: <Mail className="w-4 h-4" />,
    color: "#3b82f6",
    bgClass: "bg-sky-500",
  },
  delay: {
    icon: <Timer className="w-4 h-4" />,
    color: "#6b7280",
    bgClass: "bg-gray-500",
  },
};

const mockNodes: CanvasNode[] = [
  { id: "node-1", type: "start", label: "Start", x: 80, y: 180 },
  { id: "node-2", type: "approval", label: "Manager Review", x: 260, y: 180 },
  { id: "node-3", type: "condition", label: "Approved?", x: 460, y: 180 },
  { id: "node-4", type: "action", label: "Send Notification", x: 660, y: 100 },
  { id: "node-5", type: "delay", label: "Wait 24h", x: 660, y: 270 },
  { id: "node-6", type: "approval", label: "Director Review", x: 860, y: 100 },
  { id: "node-7", type: "end", label: "Complete", x: 1060, y: 180 },
];

const mockEdges: CanvasEdge[] = [
  { id: "edge-1", sourceId: "node-1", targetId: "node-2" },
  { id: "edge-2", sourceId: "node-2", targetId: "node-3" },
  { id: "edge-3", sourceId: "node-3", targetId: "node-4", label: "Yes" },
  { id: "edge-4", sourceId: "node-3", targetId: "node-5", label: "No" },
  { id: "edge-5", sourceId: "node-4", targetId: "node-6" },
  { id: "edge-6", sourceId: "node-5", targetId: "node-7" },
  { id: "edge-7", sourceId: "node-6", targetId: "node-7" },
];

export function WorkflowCanvas({
  nodes = mockNodes,
  edges = mockEdges,
  onNodeSelect,
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "pan">("select");

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleFitView = () => {
    setZoom(100);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    onNodeSelect?.(nodeId);
  };

  const getNodeCenter = (node: CanvasNode) => ({
    x: node.x + 70,
    y: node.y + 20,
  });

  const renderEdge = (edge: CanvasEdge) => {
    const sourceNode = nodes.find((n) => n.id === edge.sourceId);
    const targetNode = nodes.find((n) => n.id === edge.targetId);
    if (!sourceNode || !targetNode) return null;

    const source = getNodeCenter(sourceNode);
    const target = getNodeCenter(targetNode);
    const midX = (source.x + target.x) / 2;

    const pathD = `M ${source.x} ${source.y} C ${midX} ${source.y} ${midX} ${target.y} ${target.x} ${target.y}`;

    return (
      <g key={edge.id}>
        <path
          d={pathD}
          stroke="#6366f1"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
          markerEnd="url(#arrowhead)"
        />
        {edge.label && (
          <text
            x={midX}
            y={(source.y + target.y) / 2 - 10}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            {edge.label}
          </text>
        )}
      </g>
    );
  };

  const renderNode = (node: CanvasNode) => {
    const config = nodeTypeConfig[node.type];
    const isSelected = selectedNodeId === node.id;

    return (
      <div
        key={node.id}
        className={`absolute flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-white dark:bg-stellar-blue shadow-sm cursor-pointer transition-all ${
          isSelected
            ? "border-celestial-indigo shadow-md scale-105"
            : "border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 hover:shadow-md"
        }`}
        style={{
          left: node.x,
          top: node.y,
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top left",
        }}
        onClick={() => handleNodeClick(node.id)}
      >
        <div className={`p-1.5 rounded text-white ${config.bgClass}`}>
          {config.icon}
        </div>
        <span className="text-xs font-medium text-ink-black dark:text-pearl whitespace-nowrap">
          {node.label}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <GitBranch className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Workflow Canvas
            </h2>
            <p className="text-sm text-silver-mist">
              Visual workflow designer with connected nodes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-1">
          <button
            onClick={() => setActiveTool("select")}
            className={`p-2 rounded transition-colors ${
              activeTool === "select"
                ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm"
                : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
            title="Select"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTool("pan")}
            className={`p-2 rounded transition-colors ${
              activeTool === "pan"
                ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm"
                : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
            }`}
            title="Pan"
          >
            <Move className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative h-[420px] border border-cloud dark:border-nebula-purple/50 rounded-lg bg-slate-50 dark:bg-deep-cosmos overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* SVG Layer for Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6366f1"
                opacity="0.5"
              />
            </marker>
          </defs>
          {edges.map(renderEdge)}
        </svg>

        {/* Nodes Layer */}
        {nodes.map(renderNode)}

        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg p-1 shadow-sm">
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-silver-mist px-2 min-w-[3rem] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-cloud dark:bg-nebula-purple/50" />
          <button
            onClick={handleFitView}
            className="p-1.5 text-silver-mist hover:text-ink-black dark:hover:text-pearl rounded transition-colors"
            title="Fit to View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mini-map placeholder */}
        <div className="absolute bottom-3 left-3 w-24 h-16 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg p-1 shadow-sm opacity-75">
          <div className="w-full h-full bg-slate-50 dark:bg-deep-cosmos rounded overflow-hidden relative">
            {nodes.map((node) => (
              <div
                key={`mini-${node.id}`}
                className="absolute w-1.5 h-1 rounded-sm"
                style={{
                  left: `${(node.x / 1200) * 100}%`,
                  top: `${(node.y / 420) * 100}%`,
                  backgroundColor: nodeTypeConfig[node.type].color,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-silver-mist">
          {nodes.length} nodes, {edges.length} edges
        </p>
        {selectedNodeId && (
          <p className="text-xs text-celestial-indigo">
            Selected: {nodes.find((n) => n.id === selectedNodeId)?.label}
          </p>
        )}
      </div>
    </div>
  );
}
