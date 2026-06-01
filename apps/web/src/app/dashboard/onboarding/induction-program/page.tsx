// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronUp,
    Briefcase,
    Laptop,
    Coffee,
    FileText,
    Users,
    GraduationCap,
    Trophy,
    ArrowRight,
    PlayCircle,
    Loader2,
    BookOpen
} from 'lucide-react';
import { OnboardingInstanceService } from '../services';

type Task = {
    id: string;
    label: string;
    completed: boolean;
};

type Phase = {
    id: string;
    title: string;
    subtitle: string;
    icon: typeof Briefcase;
    color: string;
    bg: string;
    tasks: Task[];
    status: 'completed' | 'current' | 'locked';
};

const DEFAULT_PHASES: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: typeof Briefcase;
    color: string;
    bg: string;
    phase: string;
}> = [
    {
        id: 'preboarding',
        title: 'Pre-boarding',
        subtitle: 'Before you join',
        icon: Briefcase,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        phase: 'pre_boarding',
    },
    {
        id: 'day1',
        title: 'Day 1: Welcome Aboard',
        subtitle: 'Your first day',
        icon: Trophy,
        color: 'text-celestial-indigo',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        phase: 'first_day',
    },
    {
        id: 'week1',
        title: 'Week 1: Getting Settled',
        subtitle: 'Know your team & tools',
        icon: Users,
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        phase: 'first_week',
    },
    {
        id: 'month1',
        title: 'Month 1: Ramp Up',
        subtitle: 'First project & feedback',
        icon: GraduationCap,
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        phase: 'first_month',
    },
];

export default function InductionProgramPage() {
    const [journey, setJourney] = useState<Phase[]>([]);
    const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const instances = await OnboardingInstanceService.getInstances();

                // Find the active onboarding instance
                const activeInstance = instances.find(
                    (i: Record<string, unknown>) => i.status === 'in_progress' || i.status === 'not_started'
                ) || instances[0];

                if (activeInstance) {
                    const instanceTasks = (activeInstance as { tasks?: Array<Record<string, unknown>> }).tasks || [];
                    const currentPhase = (activeInstance as { currentPhase?: string }).currentPhase || 'first_day';

                    // Build journey phases from actual tasks
                    const phases: Phase[] = DEFAULT_PHASES.map((phaseConfig) => {
                        const phaseTasks = instanceTasks.filter(
                            (t: Record<string, unknown>) => t.phase === phaseConfig.phase
                        );

                        const tasks: Task[] = phaseTasks.map((t: Record<string, unknown>) => ({
                            id: (t.id as string) || String(Math.random()),
                            label: (t.taskName as string) || (t.description as string) || 'Task',
                            completed: (t.status as string) === 'completed',
                        }));

                        const allCompleted = tasks.length > 0 && tasks.every((t) => t.completed);
                        const isCurrentPhase = phaseConfig.phase === currentPhase;

                        let status: 'completed' | 'current' | 'locked';
                        if (allCompleted) {
                            status = 'completed';
                        } else if (isCurrentPhase || tasks.some((t) => t.completed)) {
                            status = 'current';
                        } else {
                            status = 'locked';
                        }

                        return {
                            id: phaseConfig.id,
                            title: phaseConfig.title,
                            subtitle: phaseConfig.subtitle,
                            icon: phaseConfig.icon,
                            color: phaseConfig.color,
                            bg: phaseConfig.bg,
                            tasks,
                            status,
                        };
                    });

                    setJourney(phases);
                    // Expand the current phase
                    const currentIdx = phases.findIndex((p) => p.status === 'current');
                    if (currentIdx >= 0) {
                        setExpandedPhase(phases[currentIdx].id);
                    }
                }
            } catch (error: any) {
                console.error('Error fetching induction program data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading induction program...</p>
                </div>
            </div>
        );
    }

    if (journey.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Induction Program</h3>
                    <p className="text-sm text-silver-mist">Your induction program will appear here once onboarding begins.</p>
                </div>
            </div>
        );
    }

    const togglePhase = (id: string) => {
        if (expandedPhase === id) {
            setExpandedPhase(null);
        } else {
            setExpandedPhase(id);
        }
    };

    const toggleTask = (phaseId: string, taskId: string) => {
        setJourney(prev => prev.map(phase => {
            if (phase.id !== phaseId) return phase;
            return {
                ...phase,
                tasks: phase.tasks.map(task =>
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )
            };
        }));
    };

    // Calculate overall progress
    const allTasks = journey.flatMap(p => p.tasks);
    const completedTasks = allTasks.filter(t => t.completed);
    const progress = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

    return (
        <div className="max-w-4xl mx-auto pb-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-ink-black dark:text-pearl mb-2">Induction Program</h1>
                <p className="text-silver-mist">Follow this journey to get started with your onboarding.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-10 bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-sm font-semibold text-silver-mist uppercase tracking-wider">Overall Progress</span>
                        <div className="text-2xl font-bold text-celestial-indigo">{progress}% Completed</div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-silver-mist bg-slate-50 dark:bg-deep-cosmos px-3 py-1 rounded-full">
                        <PlayCircle className="w-4 h-4 text-emerald-500" />
                        {completedTasks.length}/{allTasks.length} Tasks Done
                    </div>
                </div>
                <div className="w-full h-3 bg-cloud dark:bg-deep-cosmos rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-celestial-indigo to-quantum-rose transition-all duration-1000 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-cloud dark:bg-nebula-purple/20" />

                <div className="space-y-8">
                    {journey.map((phase, index) => {
                        const Icon = phase.icon;
                        const isLocked = phase.status === 'locked';
                        const isCompleted = phase.status === 'completed';
                        const isExpanded = expandedPhase === phase.id;

                        return (
                            <div key={phase.id} className={`relative pl-24 transition-all duration-500 ${isLocked ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                                {/* Node Icon */}
                                <div
                                    className={`absolute left-0 top-0 w-16 h-16 rounded-2xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 z-10 transition-colors ${isCompleted ? 'bg-emerald-500 text-white' :
                                            isLocked ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' :
                                                phase.bg + ' ' + phase.color
                                        }`}
                                >
                                    {isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                                </div>

                                {/* Content Card */}
                                <div
                                    className={`bg-white dark:bg-stellar-blue rounded-2xl border transition-all overflow-hidden ${phase.status === 'current'
                                            ? 'border-celestial-indigo ring-4 ring-celestial-indigo/10 shadow-lg'
                                            : 'border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {/* Card Header */}
                                    <div
                                        className="p-5 flex items-center justify-between cursor-pointer"
                                        onClick={() => !isLocked && togglePhase(phase.id)}
                                    >
                                        <div>
                                            <h3 className="text-xl font-bold text-ink-black dark:text-pearl">{phase.title}</h3>
                                            <p className="text-silver-mist">{phase.subtitle}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-medium text-silver-mist">
                                                {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} Tasks
                                            </div>
                                            <button className={`p-2 rounded-full hover:bg-cloud dark:hover:bg-deep-cosmos transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown className="w-5 h-5 text-silver-mist" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable Tasks */}
                                    <div className={`transition-all duration-300 ease-in-out bg-slate-50 dark:bg-slate-900/50 ${isExpanded ? 'max-h-96 opacity-100 border-t border-cloud dark:border-nebula-purple/10' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                        <div className="p-5 space-y-3">
                                            {phase.tasks.length === 0 ? (
                                                <p className="text-sm text-silver-mist text-center py-4">No tasks assigned for this phase yet.</p>
                                            ) : (
                                                phase.tasks.map(task => (
                                                    <label key={task.id} className="flex items-center gap-3 p-3 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/20 hover:border-celestial-indigo/50 cursor-pointer transition-colors group">
                                                        <button
                                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed
                                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                    : 'border-slate-300 dark:border-slate-600 group-hover:border-celestial-indigo'
                                                                }`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleTask(phase.id, task.id);
                                                            }}
                                                        >
                                                            {task.completed && <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                        <span className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-ink-black dark:text-pearl'}`}>
                                                            {task.label}
                                                        </span>
                                                    </label>
                                                ))
                                            )}

                                            {/* Phase Completion Action */}
                                            {phase.tasks.length > 0 && phase.tasks.every(t => t.completed) && !isCompleted && (
                                                <div className="mt-4 flex justify-end">
                                                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors animate-in fade-in zoom-in">
                                                        Mark Phase Complete <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

