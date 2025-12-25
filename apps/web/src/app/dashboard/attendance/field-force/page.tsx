"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Navigation,
    Clock,
    CheckCircle2,
    Calendar,
    User,
    Phone,
    Briefcase,
    Search,
    Filter,
    ArrowRight,
    Map
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FieldForceService } from '../services';

interface FieldAgent {
    id: number;
    name: string;
    role: string;
    status: 'Active' | 'Idle' | 'Offline';
    location: string;
    lastSeen: string;
    visits: number;
    distance: string;
    battery: string;
    avatar: string;
    lat: number;
    lng: number;
}

interface VisitLog {
    id: number;
    agent: string;
    client: string;
    type: string;
    time: string;
    status: string;
    notes: string;
    outcome: string;
}

export default function FieldForcePage() {
    const [agents, setAgents] = useState<FieldAgent[]>([]);
    const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState<FieldAgent | null>(null);

    useEffect(() => {
        fetchFieldData();
    }, []);

    const fetchFieldData = async () => {
        try {
            setLoading(true);
            const agentsResult = await FieldForceService.getFieldAgents();
            if (agentsResult && agentsResult.length > 0) {
                setAgents(agentsResult as any);
            }
            const visitsResult = await FieldForceService.getVisitLogs();
            if (visitsResult && visitsResult.length > 0) {
                setVisitLogs(visitsResult as any);
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Map className="w-6 h-6 text-emerald-500" />
                        Field Force Trek
                    </h1>
                    <p className="text-silver-mist text-sm">Real-time tracking of field agents, beats, and client visits.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20">
                        <Navigation className="w-4 h-4" /> Plan Beat
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-y-auto lg:overflow-visible">
                {/* Left: Agent List & Filters */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
                    {/* Search & Filter */}
                    <div className="relative shrink-0">
                        <input
                            type="text"
                            placeholder="Search agents..."
                            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Agents List */}
                    <div className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 overflow-y-auto space-y-3">
                        {agents.map(agent => (
                            <div
                                key={agent.id}
                                onClick={() => setSelectedAgent(agent)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md
                                    ${selectedAgent?.id === agent.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500/30' :
                                        'bg-white dark:bg-slate-900/40 border-cloud dark:border-slate-800 hover:border-indigo-300'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                                                {agent.avatar}
                                            </div>
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 
                                                ${agent.status === 'Active' ? 'bg-emerald-500' :
                                                    agent.status === 'Idle' ? 'bg-amber-500' : 'bg-slate-400'}
                                            `}></span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-ink-black dark:text-pearl text-sm">{agent.name}</div>
                                            <div className="text-xs text-silver-mist">{agent.role}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-indigo-500">{agent.distance}</div>
                                        <div className="text-[10px] text-silver-mist">Traveled</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500 pl-[3.25rem]">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span className="truncate max-w-[150px]">{agent.location}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{agent.lastSeen}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Map & Activity Feed */}
                <div className="lg:col-span-2 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Map Widget (Mock) */}
                    <div className="h-64 sm:h-96 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-cloud dark:border-nebula-purple/50 overflow-hidden relative group">
                        {/* Map Background Pattern */}
                        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-10 dark:opacity-20 pointer-events-none"></div>

                        {/* Mock Pins */}
                        {agents.map((agent, i) => agent.status !== 'Offline' && (
                            <div
                                key={agent.id}
                                className="absolute flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform"
                                style={{ top: `${30 + (i * 15)}%`, left: `${40 + (i * 20)}%` }}
                            >
                                <div className={`px-2 py-1 rounded bg-white dark:bg-slate-800 shadow-md text-[10px] font-bold whitespace-nowrap border ${selectedAgent?.id === agent.id ? 'border-indigo-500 text-indigo-600' : 'border-cloud text-slate-600'}`}>
                                    {agent.name}
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${agent.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                            </div>
                        ))}

                        <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg border border-cloud dark:border-slate-700">
                            <div className="text-[10px] font-bold uppercase text-silver-mist mb-1">Map View</div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> <span className="text-[10px]">Active</span>
                                <div className="w-2 h-2 rounded-full bg-amber-500 ml-2"></div> <span className="text-[10px]">Idle</span>
                            </div>
                        </div>
                    </div>

                    {/* Visit Logs */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-500" /> Today's Activity Log
                            </h3>
                            <button className="text-xs font-bold text-indigo-500 hover:underline">Download Report</button>
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-1">
                            {visitLogs.map(log => (
                                <div key={log.id} className="flex gap-4 p-4 border border-cloud dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-800">
                                            {log.time}
                                        </div>
                                        <div className="w-0.5 h-full bg-cloud dark:bg-slate-700"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-ink-black dark:text-pearl">{log.client}</h4>
                                                <div className="text-xs text-silver-mist">{log.type} • {log.agent}</div>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded 
                                                ${log.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                    'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'}
                                            `}>
                                                {log.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded border border-dashed border-cloud dark:border-slate-800 mt-2">
                                            "{log.notes}"
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Outcome: {log.outcome}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
