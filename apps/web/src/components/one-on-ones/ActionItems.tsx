"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  User,
  Calendar,
  Plus,
  Filter,
} from "lucide-react";

type ActionItemStatus = "pending" | "in-progress" | "done";

interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  status: ActionItemStatus;
  meetingDate: string;
  priority: "low" | "medium" | "high";
}

interface ApiOneOnOne {
  id: string;
  managerId: string;
  managerName: string;
  reportId: string;
  reportName: string;
  frequency: string;
  nextMeeting: string;
  duration: number;
  status: string;
  agendaItems: string[];
  lastMeetingNotes?: string;
}

interface ActionItemsProps {
  oneOnOnes?: ApiOneOnOne[];
}

function deriveActionItems(oneOnOnes: ApiOneOnOne[]): ActionItem[] {
  const items: ActionItem[] = [];
  oneOnOnes.forEach((oo) => {
    (oo.agendaItems || []).forEach((agenda, idx) => {
      items.push({
        id: `${oo.id}-${idx}`,
        title: agenda,
        assignee: oo.reportName,
        dueDate: new Date(
          new Date(oo.nextMeeting).getTime() + 7 * 24 * 60 * 60 * 1000
        ).toISOString().split("T")[0],
        status: "pending",
        meetingDate: oo.nextMeeting.split("T")[0],
        priority: idx === 0 ? "high" : idx === 1 ? "medium" : "low",
      });
    });
  });
  return items;
}

export default function ActionItems({ oneOnOnes }: ActionItemsProps) {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(!oneOnOnes);
  const [filterStatus, setFilterStatus] = useState<"all" | ActionItemStatus>("all");

  useEffect(() => {
    if (oneOnOnes) {
      setItems(deriveActionItems(oneOnOnes));
      setLoading(false);
      return;
    }

    // Fallback
    fetch("/api/v1/performance/one-on-ones")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data?.oneOnOnes) {
          setItems(deriveActionItems(result.data.oneOnOnes));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [oneOnOnes]);

  const statusCycle: ActionItemStatus[] = ["pending", "in-progress", "done"];

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const currentIndex = statusCycle.indexOf(item.status);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          return { ...item, status: statusCycle[nextIndex] };
        }
        return item;
      })
    );
  };

  const getStatusIcon = (status: ActionItemStatus) => {
    switch (status) {
      case "pending":
        return <Circle className="w-5 h-5 text-silver-mist" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-celestial-indigo" />;
      case "done":
        return <CheckCircle2 className="w-5 h-5 text-aurora-green" />;
    }
  };

  const getStatusLabel = (status: ActionItemStatus) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-silver-mist/20 text-silver-mist">
            Pending
          </span>
        );
      case "in-progress":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-celestial-indigo/10 text-celestial-indigo">
            In Progress
          </span>
        );
      case "done":
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-aurora-green/10 text-aurora-green">
            Done
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: ActionItem["priority"]) => {
    const colors = {
      low: "text-silver-mist",
      medium: "text-celestial-indigo",
      high: "text-coral-alert",
    };
    return (
      <span className={`text-xs font-medium ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const filteredItems =
    filterStatus === "all" ? items : items.filter((item) => item.status === filterStatus);

  const summary = {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    inProgress: items.filter((i) => i.status === "in-progress").length,
    done: items.filter((i) => i.status === "done").length,
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-celestial-indigo" />
          <h2 className="text-xl font-semibold text-ink-black dark:text-pearl">
            Action Items
          </h2>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-celestial-indigo rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
          <p className="text-lg font-semibold text-ink-black dark:text-pearl">{summary.total}</p>
          <p className="text-xs text-silver-mist">Total</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
          <p className="text-lg font-semibold text-silver-mist">{summary.pending}</p>
          <p className="text-xs text-silver-mist">Pending</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
          <p className="text-lg font-semibold text-celestial-indigo">{summary.inProgress}</p>
          <p className="text-xs text-silver-mist">In Progress</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-cloud/30 dark:bg-nebula-purple/10">
          <p className="text-lg font-semibold text-aurora-green">{summary.done}</p>
          <p className="text-xs text-silver-mist">Done</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-silver-mist" />
        <div className="flex gap-2">
          {(["all", "pending", "in-progress", "done"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === status
                  ? "bg-celestial-indigo text-white"
                  : "bg-cloud/50 dark:bg-nebula-purple/10 text-ink-black dark:text-pearl hover:bg-cloud dark:hover:bg-nebula-purple/20"
              }`}
            >
              {status === "all"
                ? "All"
                : status === "in-progress"
                ? "In Progress"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-4 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:bg-cloud/20 dark:hover:bg-nebula-purple/10 transition-colors ${
              item.status === "done" ? "opacity-70" : ""
            }`}
          >
            <button
              onClick={() => toggleStatus(item.id)}
              className="mt-0.5 flex-shrink-0 hover:scale-110 transition-transform"
              title={`Status: ${item.status}. Click to change.`}
            >
              {getStatusIcon(item.status)}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium text-ink-black dark:text-pearl ${
                  item.status === "done" ? "line-through" : ""
                }`}
              >
                {item.title}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-silver-mist" />
                  <span className="text-xs text-silver-mist">{item.assignee}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-silver-mist" />
                  <span className="text-xs text-silver-mist">
                    Due{" "}
                    {new Date(item.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {getPriorityBadge(item.priority)}
              </div>
            </div>
            <div className="flex-shrink-0">{getStatusLabel(item.status)}</div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-silver-mist">No action items found for this filter.</p>
        </div>
      )}
    </div>
  );
}
