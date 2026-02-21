"use client";

import React, { useState } from "react";
import {
  Settings,
  Play,
  StopCircle,
  UserCheck,
  GitBranch,
  Mail,
  Webhook,
  Timer,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";

type NodeType = "start" | "end" | "approval" | "condition" | "email" | "webhook" | "wait";

interface WorkflowNodeConfig {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  config: Record<string, unknown>;
}

interface NodeEditorProps {
  node?: WorkflowNodeConfig | null;
  onUpdate?: (node: WorkflowNodeConfig) => void;
}

const mockSelectedNode: WorkflowNodeConfig = {
  id: "n-002",
  type: "approval",
  label: "Manager Approval",
  description: "Requires direct manager sign-off",
  config: {
    approvers: ["Direct Manager"],
    escalationTime: 48,
    allowDelegation: true,
    reminderInterval: 24,
  },
};

const nodeTypeConfig: Record<NodeType, { icon: React.ReactNode; color: string; label: string }> = {
  start: { icon: <Play className="w-4 h-4" />, color: "text-aurora-green", label: "Start" },
  end: { icon: <StopCircle className="w-4 h-4" />, color: "text-coral-alert", label: "End" },
  approval: { icon: <UserCheck className="w-4 h-4" />, color: "text-celestial-indigo", label: "Approval" },
  condition: { icon: <GitBranch className="w-4 h-4" />, color: "text-sunset-amber", label: "Condition" },
  email: { icon: <Mail className="w-4 h-4" />, color: "text-sky-500", label: "Email" },
  webhook: { icon: <Webhook className="w-4 h-4" />, color: "text-purple-500", label: "Webhook" },
  wait: { icon: <Timer className="w-4 h-4" />, color: "text-silver-mist", label: "Wait" },
};

export default function NodeEditor({ node: propNode }: NodeEditorProps) {
  const [currentNode, setCurrentNode] = useState<WorkflowNodeConfig>(propNode || mockSelectedNode);
  const [approvers, setApprovers] = useState<string[]>(
    (currentNode.config.approvers as string[]) || []
  );

  const typeConfig = nodeTypeConfig[currentNode.type];

  const renderApprovalFields = () => (
    <>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Approvers
        </label>
        <div className="space-y-2">
          {approvers.map((approver, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={approver}
                onChange={(e) => {
                  const updated = [...approvers];
                  updated[idx] = e.target.value;
                  setApprovers(updated);
                }}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
              >
                <option value="Direct Manager">Direct Manager</option>
                <option value="Department Head">Department Head</option>
                <option value="HR Director">HR Director</option>
                <option value="CEO">CEO</option>
              </select>
              <button
                onClick={() => setApprovers(approvers.filter((_, i) => i !== idx))}
                className="p-1 text-coral-alert hover:bg-coral-alert/10 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setApprovers([...approvers, "Direct Manager"])}
            className="flex items-center gap-1.5 text-xs text-celestial-indigo hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add approver
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Escalation Time (hours)
        </label>
        <input
          type="number"
          defaultValue={currentNode.config.escalationTime as number}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Reminder Interval (hours)
        </label>
        <input
          type="number"
          defaultValue={currentNode.config.reminderInterval as number}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-ink-black dark:text-pearl">
          Allow Delegation
        </label>
        <button
          className={`w-9 h-5 rounded-full relative transition-colors ${
            currentNode.config.allowDelegation ? "bg-aurora-green" : "bg-gray-300 dark:bg-nebula-purple/50"
          }`}
          onClick={() =>
            setCurrentNode({
              ...currentNode,
              config: { ...currentNode.config, allowDelegation: !currentNode.config.allowDelegation },
            })
          }
        >
          <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              currentNode.config.allowDelegation ? "left-4" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </>
  );

  const renderConditionFields = () => (
    <>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Condition Expression
        </label>
        <textarea
          defaultValue="amount > 5000"
          rows={3}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl resize-none font-mono"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          True Branch Label
        </label>
        <input
          type="text"
          defaultValue="Yes"
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          False Branch Label
        </label>
        <input
          type="text"
          defaultValue="No"
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
        />
      </div>
    </>
  );

  const renderEmailFields = () => (
    <>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Recipients
        </label>
        <input
          type="text"
          defaultValue="{{requester.email}}"
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl font-mono"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Subject
        </label>
        <input
          type="text"
          defaultValue="Your request has been processed"
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Template
        </label>
        <select className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
          <option>Approval Notification</option>
          <option>Rejection Notification</option>
          <option>Custom Template</option>
        </select>
      </div>
    </>
  );

  const renderWebhookFields = () => (
    <>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          URL
        </label>
        <input
          type="url"
          defaultValue="https://api.example.com/webhook"
          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl font-mono"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Method
        </label>
        <select className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
          <option>POST</option>
          <option>GET</option>
          <option>PUT</option>
          <option>PATCH</option>
        </select>
      </div>
    </>
  );

  const renderWaitFields = () => (
    <>
      <div>
        <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
          Duration
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            defaultValue={24}
            className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
          />
          <select className="px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl">
            <option>Hours</option>
            <option>Minutes</option>
            <option>Days</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderConfigFields = () => {
    switch (currentNode.type) {
      case "approval":
        return renderApprovalFields();
      case "condition":
        return renderConditionFields();
      case "email":
        return renderEmailFields();
      case "webhook":
        return renderWebhookFields();
      case "wait":
        return renderWaitFields();
      default:
        return (
          <p className="text-xs text-silver-mist">
            No additional configuration required for this node type.
          </p>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-celestial-indigo" />
        <h3 className="text-sm font-semibold text-ink-black dark:text-pearl">
          Node Properties
        </h3>
      </div>

      {/* Node Type Header */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 mb-4">
        <div className={typeConfig.color}>{typeConfig.icon}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-black dark:text-pearl">
            {typeConfig.label} Node
          </p>
          <p className="text-xs text-silver-mist">ID: {currentNode.id}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-silver-mist" />
      </div>

      {/* Common Fields */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
            Label
          </label>
          <input
            type="text"
            value={currentNode.label}
            onChange={(e) =>
              setCurrentNode({ ...currentNode, label: e.target.value })
            }
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-black dark:text-pearl block mb-1.5">
            Description
          </label>
          <textarea
            value={currentNode.description || ""}
            onChange={(e) =>
              setCurrentNode({ ...currentNode, description: e.target.value })
            }
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl resize-none"
          />
        </div>
      </div>

      {/* Type-specific Configuration */}
      <div className="border-t border-cloud dark:border-nebula-purple/50 pt-3">
        <h4 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-3">
          Configuration
        </h4>
        <div className="space-y-3">{renderConfigFields()}</div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-cloud dark:border-nebula-purple/50 flex gap-2">
        <button className="flex-1 px-3 py-2 text-xs font-medium bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors">
          Apply Changes
        </button>
        <button className="px-3 py-2 text-xs font-medium text-coral-alert border border-coral-alert/30 rounded-lg hover:bg-coral-alert/5 transition-colors">
          Delete Node
        </button>
      </div>
    </div>
  );
}
