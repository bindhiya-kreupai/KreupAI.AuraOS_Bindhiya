"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  Clock,
  FolderOpen,
  ListTodo,
  Save,
} from "lucide-react";

interface TimerEntry {
  id: string;
  projectName: string;
  taskName: string;
  startTime: Date;
  endTime?: Date;
  totalSeconds: number;
  isPaused: boolean;
}

interface TimerWidgetProps {
  projectName?: string;
  taskName?: string;
  onSave?: (entry: TimerEntry) => void;
}

export function TimerWidget({
  projectName = "Website Redesign",
  taskName = "Frontend Development",
  onSave,
}: TimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [savedEntries, setSavedEntries] = useState<TimerEntry[]>([
    {
      id: "entry-001",
      projectName: "Mobile App v2",
      taskName: "Feature Development",
      startTime: new Date("2026-01-23T09:00:00"),
      endTime: new Date("2026-01-23T10:30:00"),
      totalSeconds: 5400,
      isPaused: false,
    },
    {
      id: "entry-002",
      projectName: "API Integration",
      taskName: "Endpoint Design",
      startTime: new Date("2026-01-23T10:45:00"),
      endTime: new Date("2026-01-23T12:00:00"),
      totalSeconds: 4500,
      isPaused: false,
    },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const formatEntryDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    if (elapsedSeconds > 0) {
      const entry: TimerEntry = {
        id: `entry-${Date.now()}`,
        projectName,
        taskName,
        startTime: startTime || new Date(),
        endTime: new Date(),
        totalSeconds: elapsedSeconds,
        isPaused: false,
      };
      setSavedEntries((prev) => [entry, ...prev]);
      onSave?.(entry);
    }
    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
  };

  const getTimerStatusLabel = (): string => {
    if (!isRunning) return "Ready to start";
    if (isPaused) return "Paused";
    return "Recording time";
  };

  const getTimerStatusColor = (): string => {
    if (!isRunning) return "bg-gray-300 dark:bg-nebula-purple/50";
    if (isPaused) return "bg-sunset-amber";
    return "bg-aurora-green";
  };

  const totalToday =
    savedEntries.reduce((sum, e) => sum + e.totalSeconds, 0) +
    (isRunning ? elapsedSeconds : 0);

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Clock className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Timer
            </h2>
            <p className="text-sm text-silver-mist">
              Track your working time
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-silver-mist">Today</p>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            {formatEntryDuration(totalToday)}
          </p>
        </div>
      </div>

      {/* Timer Display */}
      <div className="p-5 rounded-xl border-2 border-celestial-indigo/20 bg-slate-50 dark:bg-deep-cosmos mb-5">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={`w-2 h-2 rounded-full ${getTimerStatusColor()} ${
              isRunning && !isPaused ? "animate-pulse" : ""
            }`}
          />
          <span className="text-xs text-silver-mist">
            {getTimerStatusLabel()}
          </span>
        </div>

        {/* Time Display */}
        <div className="text-center mb-4">
          <p className="text-4xl font-mono font-bold text-ink-black dark:text-pearl tracking-wider">
            {formatTime(elapsedSeconds)}
          </p>
        </div>

        {/* Current Project/Task Info */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-silver-mist">
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="text-ink-black dark:text-pearl font-medium">
              {projectName}
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-silver-mist" />
          <div className="flex items-center gap-1.5 text-xs text-silver-mist">
            <ListTodo className="w-3.5 h-3.5" />
            <span className="text-ink-black dark:text-pearl font-medium">
              {taskName}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-aurora-green hover:bg-aurora-green/90 text-white font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-celestial-indigo hover:bg-celestial-indigo/90 text-white font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sunset-amber hover:bg-sunset-amber/90 text-white font-medium transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              )}
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-coral-alert hover:bg-coral-alert/90 text-white font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop &amp; Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Entries */}
      {savedEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink-black dark:text-pearl mb-3 flex items-center gap-2">
            <Save className="w-3.5 h-3.5 text-silver-mist" />
            Recent Entries
          </h3>
          <div className="space-y-2">
            {savedEntries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg border border-cloud dark:border-nebula-purple/50"
              >
                <div>
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {entry.projectName}
                  </p>
                  <p className="text-xs text-silver-mist">{entry.taskName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl">
                    {formatEntryDuration(entry.totalSeconds)}
                  </p>
                  <p className="text-xs text-silver-mist">
                    {entry.startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {entry.endTime &&
                      ` - ${entry.endTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
