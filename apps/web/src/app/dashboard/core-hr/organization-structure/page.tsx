"use client";

import React, { useState, useEffect } from 'react';
import {
    Network,
    ZoomIn,
    ZoomOut,
    ChevronDown,
    ChevronUp,
    User,
    RefreshCw
} from 'lucide-react';
import { OrganizationService } from '../services';

export default function OrgStructurePage() {
    const [zoom, setZoom] = useState(1);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ ceo: true });
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            const data = await OrganizationService.getAllUnits();
            setUnits(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setZoom(1);

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Network className="w-6 h-6 text-indigo-500" />
                        Organization Structure
                    </h1>
                    <p className="text-slate-500 text-sm">Interactive visual hierarchy and reporting lines.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleZoomOut} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold flex items-center">
                        {Math.round(zoom * 100)}%
                    </div>
                    <button onClick={handleZoomIn} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button onClick={resetZoom} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-500">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center overflow-auto cursor-grab active:cursor-grabbing">
                    <div
                        className="flex flex-col items-center transition-transform duration-200 ease-out origin-top"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        {/* CEO Node */}
                        <div className="flex flex-col items-center">
                            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 p-4 rounded-2xl shadow-xl w-64 text-center relative z-10 transition-shadow hover:shadow-2xl hover:border-indigo-600">
                                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-4 border-indigo-50">
                                    <img src="https://i.pravatar.cc/150?u=ceEO" alt="CEO" />
                                </div>
                                <div className="font-bold text-lg">Alexandra Ray</div>
                                <div className="text-sm text-indigo-600 font-bold mb-2">Chief Executive Officer</div>
                                <button
                                    onClick={() => toggleNode('ceo')}
                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg transition-colors z-20"
                                >
                                    {expandedNodes['ceo'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>

                            {expandedNodes['ceo'] && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col items-center">
                                    <div className="h-8 w-px bg-slate-400 dark:bg-slate-600"></div>
                                    <div className="h-px w-[600px] bg-slate-400 dark:bg-slate-600"></div>
                                    <div className="flex justify-between w-[600px] relative">
                                        <div className="h-8 w-px bg-slate-400 dark:bg-slate-600 absolute left-0 top-0"></div>
                                        <div className="h-8 w-px bg-slate-400 dark:bg-slate-600 absolute left-1/2 -translate-x-1/2 top-0"></div>
                                        <div className="h-8 w-px bg-slate-400 dark:bg-slate-600 absolute right-0 top-0"></div>
                                    </div>

                                    {/* VPs Level */}
                                    <div className="flex gap-16 mt-0">
                                        <OrgNode
                                            name="Marcus Chen"
                                            role="CTO"
                                            reports={45}
                                            img="https://i.pravatar.cc/150?u=cto"
                                        />
                                        <OrgNode
                                            name="Sarah Williams"
                                            role="Chief People Officer"
                                            reports={12}
                                            img="https://i.pravatar.cc/150?u=cpo"
                                        />
                                        <OrgNode
                                            name="David Miller"
                                            role="Chief Revenue Officer"
                                            reports={30}
                                            img="https://i.pravatar.cc/150?u=cro"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 pointer-events-none">
                    Use mouse wheel or buttons to zoom
                </div>
            </div>
        </div>
    );
}

function OrgNode({ name, role, reports, img }: { name: string, role: string, reports: number, img: string }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex flex-col items-center">
            <div
                onClick={() => setExpanded(!expanded)}
                className={`bg-white dark:bg-slate-900 border p-4 rounded-2xl shadow-lg w-48 text-center transition-all cursor-pointer relative z-10 hover:-translate-y-1
                ${expanded ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'}`}
            >
                <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 border-2 border-slate-100 dark:border-slate-800">
                    <img src={img} alt={name} />
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100">{name}</div>
                <div className="text-xs text-slate-500 font-bold">{role}</div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 rounded-full py-0.5 px-2 mx-auto w-fit font-bold text-slate-600 dark:text-slate-400">
                    <User className="w-3 h-3" /> {reports} Reports
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 cursor-pointer hover:bg-indigo-500 hover:text-white transition-colors shadow-sm">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>
            {expanded && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="text-xs text-slate-400 italic bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-sm border border-slate-100 dark:border-slate-800">
                        {reports} direct reports hidden
                    </div>
                </div>
            )}
        </div>
    );
}
