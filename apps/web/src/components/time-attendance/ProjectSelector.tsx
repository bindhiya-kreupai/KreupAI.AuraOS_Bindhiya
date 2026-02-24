"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Users,
  ListTodo,
  Check,
} from "lucide-react";

interface Task {
  id: string;
  name: string;
  estimatedHours?: number;
}

interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
  tasks: Task[];
}

interface ProjectSelectorProps {
  selectedProjectId?: string;
  selectedTaskId?: string;
  onSelect?: (projectId: string, taskId: string) => void;
}

const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "Website Redesign",
    client: "Acme Corporation",
    color: "#6366f1",
    tasks: [
      { id: "task-001", name: "UI/UX Design", estimatedHours: 40 },
      { id: "task-002", name: "Frontend Development", estimatedHours: 80 },
      { id: "task-003", name: "Backend Integration", estimatedHours: 60 },
      { id: "task-004", name: "QA Testing", estimatedHours: 20 },
    ],
  },
  {
    id: "proj-002",
    name: "Mobile App v2",
    client: "TechStart Inc.",
    color: "#10b981",
    tasks: [
      { id: "task-005", name: "Feature Development", estimatedHours: 100 },
      { id: "task-006", name: "Performance Optimization", estimatedHours: 30 },
      { id: "task-007", name: "App Store Deployment", estimatedHours: 10 },
    ],
  },
  {
    id: "proj-003",
    name: "API Integration Platform",
    client: "DataFlow Solutions",
    color: "#f59e0b",
    tasks: [
      { id: "task-008", name: "Endpoint Design", estimatedHours: 25 },
      { id: "task-009", name: "Authentication Setup", estimatedHours: 15 },
      { id: "task-010", name: "Documentation", estimatedHours: 20 },
    ],
  },
  {
    id: "proj-004",
    name: "Client Onboarding Portal",
    client: "Global Services Ltd.",
    color: "#ef4444",
    tasks: [
      { id: "task-011", name: "Workflow Automation", estimatedHours: 50 },
      { id: "task-012", name: "Email Templates", estimatedHours: 15 },
      { id: "task-013", name: "User Training Materials", estimatedHours: 25 },
    ],
  },
  {
    id: "proj-005",
    name: "Analytics Dashboard",
    client: "Acme Corporation",
    color: "#8b5cf6",
    tasks: [
      { id: "task-014", name: "Data Visualization", estimatedHours: 45 },
      { id: "task-015", name: "Report Generation", estimatedHours: 35 },
    ],
  },
];

export function ProjectSelector({
  selectedProjectId,
  selectedTaskId,
  onSelect,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(
    selectedProjectId || mockProjects[0].id
  );
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(
    selectedTaskId || mockProjects[0].tasks[0].id
  );

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return mockProjects;
    const query = searchQuery.toLowerCase();
    return mockProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.client.toLowerCase().includes(query) ||
        project.tasks.some((task) => task.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleTaskSelect = (projectId: string, taskId: string) => {
    setActiveProjectId(projectId);
    setActiveTaskId(taskId);
    setIsOpen(false);
    setSearchQuery("");
    onSelect?.(projectId, taskId);
  };

  const activeProject = mockProjects.find((p) => p.id === activeProjectId);
  const activeTask = activeProject?.tasks.find((t) => t.id === activeTaskId);

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue text-ink-black dark:text-pearl hover:border-celestial-indigo/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: activeProject?.color || "#6366f1" }}
          />
          <div className="text-left">
            <p className="text-sm font-medium text-ink-black dark:text-pearl">
              {activeProject?.name || "Select Project"}
            </p>
            <p className="text-xs text-silver-mist">
              {activeTask ? activeTask.name : "No task selected"}
              {activeProject && ` - ${activeProject.client}`}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-silver-mist transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-cloud dark:border-nebula-purple/50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-deep-cosmos">
              <Search className="w-4 h-4 text-silver-mist flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or tasks..."
                className="flex-1 text-sm bg-transparent outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist"
                autoFocus
              />
            </div>
          </div>

          {/* Project List */}
          <div className="max-h-72 overflow-y-auto p-2">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-6">
                <FolderOpen className="w-8 h-8 text-silver-mist mx-auto mb-2" />
                <p className="text-sm text-silver-mist">No projects found</p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const isExpanded = expandedProjects.includes(project.id);
                const isActive = activeProjectId === project.id;
                return (
                  <div key={project.id} className="mb-1">
                    {/* Project Header */}
                    <button
                      onClick={() => toggleProjectExpand(project.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isActive
                          ? "bg-celestial-indigo/5"
                          : "hover:bg-slate-50 dark:hover:bg-deep-cosmos"
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-silver-mist flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-silver-mist flex-shrink-0" />
                      )}
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-silver-mist flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.client}
                        </p>
                      </div>
                      <span className="text-xs text-silver-mist flex-shrink-0">
                        {project.tasks.length} tasks
                      </span>
                    </button>

                    {/* Task List */}
                    {isExpanded && (
                      <div className="ml-6 pl-3 border-l-2 border-cloud dark:border-nebula-purple/50 mt-1 mb-2">
                        {project.tasks.map((task) => {
                          const isTaskActive =
                            activeProjectId === project.id &&
                            activeTaskId === task.id;
                          return (
                            <button
                              key={task.id}
                              onClick={() =>
                                handleTaskSelect(project.id, task.id)
                              }
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                isTaskActive
                                  ? "bg-celestial-indigo/10 text-celestial-indigo"
                                  : "hover:bg-slate-50 dark:hover:bg-deep-cosmos"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ListTodo className="w-3.5 h-3.5 text-silver-mist" />
                                <span
                                  className={`text-sm ${
                                    isTaskActive
                                      ? "font-medium text-celestial-indigo"
                                      : "text-ink-black dark:text-pearl"
                                  }`}
                                >
                                  {task.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.estimatedHours && (
                                  <span className="text-xs text-silver-mist">
                                    {task.estimatedHours}h
                                  </span>
                                )}
                                {isTaskActive && (
                                  <Check className="w-3.5 h-3.5 text-celestial-indigo" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
