"use client";

import React, { useState } from 'react';
import {
    GitBranch,
    AlertTriangle,
    ShieldAlert,
    Users,
    ArrowRight,
    Play,
    CheckCircle2,
    TrendingUp,
    MoreVertical,
    Briefcase
} from 'lucide-react';

// --- MOCK DATA ---

interface Successor {
    id: string;
    name: string;
    currentRole: string;
    readiness: 'Ready Now' | '1-2 Years' | '3-5 Years';
    fitScore: number; // 0-100
    avatar: string;
}

interface Scenario {
    id: string;
    title: string;
    role: string;
    incumbent: string;
    riskLevel: 'High' | 'Medium' | 'Low';
    impact: string;
    successors: Successor[];
}

const SCENARIOS: Scenario[] = [
    {
        id: 'SCN-001',
        title: 'CTO Unexpected Departure',
        role: 'Chief Technology Officer',
        incumbent: 'David Chen',
        riskLevel: 'High',
        impact: 'Technological roadmap delay, loss of key IP.',
        successors: [
            { id: 'S-1', name: 'Sarah Miller', currentRole: 'VP Engineering', readiness: 'Ready Now', fitScore: 92, avatar: 'SM' },
            { id: 'S-2', name: 'James Wilson', currentRole: 'Chief Architect', readiness: '1-2 Years', fitScore: 78, avatar: 'JW' }
        ]
    },
    {
        id: 'SCN-002',
        title: 'CFO Retirement (Planned)',
        role: 'Chief Financial Officer',
        incumbent: 'Robert Lang',
        riskLevel: 'Low',
        impact: 'Minor transition risks if handover is managed.',
        successors: [
            { id: 'S-3', name: 'Emily Davis', currentRole: 'VP Finance', readiness: 'Ready Now', fitScore: 95, avatar: 'ED' }
        ]
    },
    {
        id: 'SCN-003',
        title: 'Head of Sales Poached',
        role: 'VP Global Sales',
        incumbent: 'Michael Scott',
        riskLevel: 'High',
        impact: 'Revenue target risk, key client churn.',
        successors: [] // No ready successors
    }
];

export default function SuccessionScenariosPage() {
    const [activeScenarioId, setActiveScenarioId] = useState<string>(SCENARIOS[0].id);

    const activeScenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-celestial-indigo" />
                        Succession Scenarios
                    </h1>
                    <p className="text-silver-mist text-sm">Model "What-If" scenarios to identify and mitigate leadership risks.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors shadow-lg shadow-celestial-indigo/20">
                    <Play className="w-4 h-4" /> Run New Simulation
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full min-h-[600px]">
                {/* Left: Scenario List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-bold text-ink-black dark:text-pearl text-sm">Saved Scenarios</h3>
                    </div>
                    {SCENARIOS.map(scenario => (
                        <div
                            key={scenario.id}
                            onClick={() => setActiveScenarioId(scenario.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${activeScenarioId === scenario.id
                                    ? 'bg-white dark:bg-stellar-blue border-celestial-indigo shadow-md ring-1 ring-celestial-indigo/20'
                                    : 'bg-slate-50 dark:bg-deep-cosmos/30 border-cloud dark:border-nebula-purple/20 hover:bg-white dark:hover:bg-deep-cosmos/50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${scenario.riskLevel === 'High' ? 'bg-rose-100 text-rose-600' :
                                        scenario.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                            'bg-emerald-100 text-emerald-600'
                                    }`}>
                                    {scenario.riskLevel === 'High' && <ShieldAlert className="w-3 h-3" />}
                                    {scenario.riskLevel} Risk
                                </div>
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                            </div>
                            <h4 className={`font-bold text-sm mb-1 ${activeScenarioId === scenario.id ? 'text-celestial-indigo' : 'text-ink-black dark:text-pearl'}`}>
                                {scenario.title}
                            </h4>
                            <div className="text-xs text-silver-mist flex items-center gap-1.5">
                                <Users className="w-3 h-3" /> Incumbent: {scenario.incumbent}
                            </div>
                        </div>
                    ))}

                    {/* Overall Risk Widget */}
                    <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden mt-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <h4 className="font-bold text-sm mb-4 relative z-10 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> Readiness Score
                        </h4>
                        <div className="flex items-end gap-2 mb-2 relative z-10">
                            <span className="text-4xl font-bold">72%</span>
                            <span className="text-sm text-slate-400 mb-1">of critical roles covered</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden relative z-10">
                            <div className="w-[72%] bg-emerald-500 h-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Analysis */}
                <div className="lg:col-span-2 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6 relative overflow-hidden flex flex-col">
                    <div className="border-b border-cloud dark:border-nebula-purple/20 pb-6 mb-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                            Current Role
                        </div>
                        <h2 className="text-2xl font-bold text-ink-black dark:text-pearl mb-2">{activeScenario.role}</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                {activeScenario.incumbent.charAt(0)}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Held by <strong>{activeScenario.incumbent}</strong></span>
                        </div>

                        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Potential Impact
                            </h4>
                            <p className="text-xs text-rose-600 dark:text-rose-300">
                                {activeScenario.impact}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-celestial-indigo" />
                            Successor Pipeline
                        </h3>

                        {activeScenario.successors.length > 0 ? (
                            <div className="space-y-4">
                                {activeScenario.successors.map((successor, index) => (
                                    <div key={successor.id} className="group relative">
                                        {/* Connecting Line */}
                                        {index !== activeScenario.successors.length - 1 && (
                                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 -mb-4 z-0"></div>
                                        )}

                                        <div className="relative z-10 bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-4 hover:border-celestial-indigo/30 hover:shadow-sm transition-all">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-celestial-indigo flex items-center justify-center text-lg font-bold shadow-sm">
                                                {successor.avatar}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-ink-black dark:text-pearl">{successor.name}</h4>
                                                        <div className="text-xs text-silver-mist">{successor.currentRole}</div>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${successor.readiness === 'Ready Now' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {successor.readiness}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center gap-4">
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${successor.fitScore > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${successor.fitScore}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-500">{successor.fitScore}% Fit</div>
                                                </div>
                                            </div>
                                            <div className="text-slate-300">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl">
                                <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
                                <h4 className="font-bold text-rose-600 dark:text-rose-400">Critical Gap Detected</h4>
                                <p className="text-xs text-rose-500 dark:text-rose-300 mt-1 max-w-xs">
                                    No successors identified for this role. Immediate action required to identify high-potential candidates or plan external search.
                                </p>
                                <button className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600">
                                    Create Development Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
