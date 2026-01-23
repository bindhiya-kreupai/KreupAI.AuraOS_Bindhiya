"use client";

import React from "react";
import {
  Play,
  CircleStop,
  UserCheck,
  GitBranch,
  Mail,
  Webhook,
  Timer,
  GripVertical,
} from "lucide-react";

interface PaletteNode {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const paletteNodes: PaletteNode[] = [
  {
    type: "start",
    label: "Start",
    description: "Workflow entry point",
    icon: <Play className="w-4 h-4" />,
    color: "text-aurora-green",
    bgColor: "bg-aurora-green/10",
  },
  {
    type: "end",
    label: "End",
    description: "Workflow termination",
    icon: <CircleStop className="w-4 h-4" />,
    color: "text-coral-alert",
    bgColor: "bg-coral-alert/10",
  },
  {
    type: "approval",
    label: "Approval",
    description: "Requires user approval",
    icon: <UserCheck className="w-4 h-4" />,
    color: "text-celestial-indigo",
    bgColor: "bg-celestial-indigo/10",
  },
  {
    type: "condition",
    label: "Condition / Branch",
    description: "Conditional branching logic",
    icon: <GitBranch className="w-4 h-4" />,
    color: "text-sunset-amber",
    bgColor: "bg-sunset-amber/10",
  },
  {
    type: "email",
    label: "Email Notification",
    description: "Send email alerts",
    icon: <Mail className="w-4 h-4" />,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    type: "webhook",
    label: "Webhook",
    description: "Call external service",
    icon: <Webhook className="w-4 h-4" />,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    type: "wait",
    label: "Wait / Delay",
    description: "Pause workflow execution",
    icon: <Timer className="w-4 h-4" />,
    color: "text-silver-mist",
    bgColor: "bg-gray-100 dark:bg-nebula-purple/10",
  },
];

interface NodePaletteProps {
  onDragStart?: (type: string) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("nodeType", type);
    e.dataTransfer.effectAllowed = "copy";
    onDragStart?.(type);
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-1">
        Node Palette
      </h3>
      <p className="text-xs text-silver-mist mb-4">
        Drag nodes onto the canvas to build your workflow
      </p>

      <div className="space-y-2">
        {paletteNodes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => handleDragStart(e, node.type)}
            className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 cursor-grab active:cursor-grabbing active:shadow-md transition-all group"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-nebula-purple/40 group-hover:text-silver-mist transition-colors" />
            <div className={`p-2 rounded-lg ${node.bgColor}`}>
              <div className={node.color}>{node.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-black dark:text-pearl">
                {node.label}
              </p>
              <p className="text-xs text-silver-mist truncate">
                {node.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-celestial-indigo/5 border border-celestial-indigo/10">
        <p className="text-xs text-celestial-indigo font-medium mb-1">
          Tip
        </p>
        <p className="text-xs text-silver-mist">
          Drag a node from here and drop it on the canvas. Connect nodes by
          dragging from one output port to another input port.
        </p>
      </div>
    </div>
  );
}
