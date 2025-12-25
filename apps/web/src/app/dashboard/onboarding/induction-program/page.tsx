"use client";

import React, { useState } from 'react';
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
    PlayCircle
} from 'lucide-react';

// --- MOCK DATA ---

type Task = {
    id: string;
    label: string;
    completed: boolean;
};

type Phase = {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    bg: string;
    tasks: Task[];
    status: 'completed' | 'current' | 'locked';
};

const INITIAL_JOURNEY: Phase[] = [
    {
        id: 'preboarding',
        title: 'Pre-boarding',
        subtitle: 'Before you join',
        icon: Briefcase,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        status: 'completed',
        tasks: [
            { id: 't1', label: 'Sign Offer Letter', completed: true },
            { id: 't2', label: 'Upload ID Proofs', completed: true },
            { id: 't3', label: 'Choose Laptop Preference', completed: true },
        ]
    },
    {
        id: 'day1',
        title: 'Day 1: Welcome Aboard',
        subtitle: 'Your first day at Aura',
        icon: Trophy,
        color: 'text-celestial-indigo',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        status: 'current',
        tasks: [
            { id: 't4', label: 'Collect ID Card & Welcome Kit', completed: true },
            { id: 't5', label: 'IT Setup & Access Configuration', completed: false },
            { id: 't6', label: 'Team Lunch', completed: false },
        ]
    },
    {
        id: 'week1',
        title: 'Week 1: Getting Settled',
        subtitle: 'Know your team & tools',
        icon: Users,
        color: 'text-amber-600',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        status: 'locked',
        tasks: [
            { id: 't7', label: 'Meet your Buddy', completed: false },
            { id: 't8', label: 'Product Training: Module 1', completed: false },
            { id: 't9', label: 'HR Induction Session', completed: false },
        ]
    },
    {
        id: 'month1',
        title: 'Month 1: Ramp Up',
        subtitle: 'First project & feedback',
        icon: GraduationCap,
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        status: 'locked',
        tasks: [
            { id: 't10', label: 'Complete First Assignment', completed: false },
            { id: 't11', label: '30-Day Check-in with Manager', completed: false },
        ]
    }
];

export default function InductionProgramPage() {
    const [journey, setJourney] = useState(INITIAL_JOURNEY);
    const [expandedPhase, setExpandedPhase] = useState<string | null>('day1');

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
    const progress = Math.round((completedTasks.length / allTasks.length) * 100);

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-ink-black dark:text-pearl mb-2">Welcome to Aura! 🚀</h1>
                <p className="text-silver-mist">We&apos;re thrilled to have you. Follow this journey to get started.</p>
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
                        Next: IT Setup
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
                                                phases[index].bg + ' ' + phases[index].color
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
                                        <div className="flex items-center gap-4">
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
                                            {phase.tasks.map(task => (
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
                                            ))}

                                            {/* Phase Completion Action */}
                                            {phase.tasks.every(t => t.completed) && !isCompleted && (
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

// Helper to keep icon mapping safe
const phases = INITIAL_JOURNEY;
