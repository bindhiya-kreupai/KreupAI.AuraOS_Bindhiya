"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Square,
  Clock,
  FolderOpen,
  ListTodo,
  ChevronDown,
  Trash2,
  Edit2,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  name: string;
  projectId: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  color: string;
}

const mockProjects: Project[] = [
  { id: "proj-001", name: "Website Redesign", color: "#6366f1" },
  { id: "proj-002", name: "Mobile App v2", color: "#10b981" },
  { id: "proj-003", name: "API Integration", color: "#f59e0b" },
  { id: "proj-004", name: "Client Onboarding", color: "#ef4444" },
];

const mockTasks: Task[] = [
  { id: "task-001", name: "UI Design", projectId: "proj-001" },
  { id: "task-002", name: "Frontend Dev", projectId: "proj-001" },
  { id: "task-003", name: "Feature Development", projectId: "proj-002" },
  { id: "task-004", name: "Endpoint Setup", projectId: "proj-003" },
  { id: "task-005", name: "Documentation", projectId: "proj-004" },
];

const mockEntries: TimeEntry[] = [
  {
    id: "te-001",
    projectId: "proj-001",
    projectName: "Website Redesign",
    taskName: "UI Design",
    startTime: "2026-01-23T09:00:00Z",
    endTime: "2026-01-23T10:30:00Z",
    duration: 5400,
    color: "#6366f1",
  },
  {
    id: "te-002",
    projectId: "proj-002",
    projectName: "Mobile App v2",
    taskName: "Feature Development",
    startTime: "2026-01-23T10:45:00Z",
    endTime: "2026-01-23T12:15:00Z",
    duration: 5400,
    color: "#10b981",
  },
  {
    id: "te-003",
    projectId: "proj-003",
    projectName: "API Integration",
    taskName: "Endpoint Setup",
    startTime: "2026-01-23T13:00:00Z",
    endTime: "2026-01-23T14:20:00Z",
    duration: 4800,
    color: "#f59e0b",
  },
];

export default function ProjectTimeTracker() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState<string>(mockProjects[0].id);
  const [selectedTask, setSelectedTask] = useState<string>(mockTasks[0].id);
  const [entries] = useState<TimeEntry[]>(mockEntries);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEntryDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const totalToday = entries.reduce((sum, e) => sum + e.duration, 0) + (isRunning ? elapsedSeconds : 0);
  const filteredTasks = mockTasks.filter((t) => t.projectId === selectedProject);
  const currentProject = mockProjects.find((p) => p.id === selectedProject);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setElapsedSeconds(0);
    } else {
      setIsRunning(true);
    }
  };

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Clock className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Project Time Tracker
            </h2>
            <p className="text-sm text-silver-mist">
              Track time across projects and tasks
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-silver-mist">Today&#39;s Total</p>
          <p className="text-lg font-bold text-ink-black dark:text-pearl">
            {formatEntryDuration(totalToday)}
          </p>
        </div>
      </div>

      {/* Active Timer */}
      <div className="p-4 rounded-xl border-2 border-celestial-indigo/30 bg-celestial-indigo/5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-mono font-bold text-ink-black dark:text-pearl tracking-wider">
            {formatDuration(elapsedSeconds)}
          </div>
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-colors ${
              isRunning
                ? "bg-coral-alert hover:bg-coral-alert/90"
                : "bg-aurora-green hover:bg-aurora-green/90"
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </button>
        </div>

        {/* Project/Task Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-silver-mist" />
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentProject?.color }}
                />
                <span>{currentProject?.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-silver-mist" />
            </button>
            {showProjectDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg shadow-lg z-10">
                {mockProjects.map((proj) => (
                  <button
                    key={proj.id}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-black dark:text-pearl hover:bg-gray-50 dark:hover:bg-nebula-purple/10 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setSelectedProject(proj.id);
                      setShowProjectDropdown(false);
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                    {proj.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowTaskDropdown(!showTaskDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-sm text-ink-black dark:text-pearl"
            >
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-silver-mist" />
                <span>
                  {mockTasks.find((t) => t.id === selectedTask)?.name || "Select task"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-silver-mist" />
            </button>
            {showTaskDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg shadow-lg z-10">
                {filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    className="w-full text-left px-3 py-2 text-sm text-ink-black dark:text-pearl hover:bg-gray-50 dark:hover:bg-nebula-purple/10 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setSelectedTask(task.id);
                      setShowTaskDropdown(false);
                    }}
                  >
                    {task.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Entries */}
      <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3">
        Today&#39;s Entries
      </h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-10 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <div>
                <p className="text-sm font-medium text-ink-black dark:text-pearl">
                  {entry.projectName}
                </p>
                <p className="text-xs text-silver-mist">{entry.taskName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-ink-black dark:text-pearl">
                  {formatEntryDuration(entry.duration)}
                </p>
                <p className="text-xs text-silver-mist">
                  {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : "..."}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-silver-mist hover:text-celestial-indigo rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 text-silver-mist hover:text-coral-alert rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
