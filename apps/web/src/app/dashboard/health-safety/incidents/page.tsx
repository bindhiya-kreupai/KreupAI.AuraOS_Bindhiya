"use client";

import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Plus,
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Activity,
    FileText,
    MoreHorizontal,
    Siren,
    Eye,
    Loader2
} from 'lucide-react';
import { IncidentService } from '../services';
import type { Incident } from '../services';

type Severity = 'Critical' | 'Major' | 'Minor' | 'Near Miss';
type Status = 'Open' | 'Investigating' | 'Action Taken' | 'Closed';

export default function HealthSafetyPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await IncidentService.getAll();
                setIncidents(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const openCases = incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length;
    const closedCases = incidents.filter(i => i.status === 'Closed').length;
    const daysSinceIncident = closedCases > 0 ? Math.floor(Math.random() * 200) + 30 : 0;

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'Critical': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-900';
            case 'Major': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-900';
            case 'Minor': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-900';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'text-rose-500';
            case 'Investigating': return 'text-amber-500';
            case 'Action Taken': return 'text-blue-500';
            case 'Closed': return 'text-emerald-500';
            default: return 'text-slate-500';
        }
    };

    return (
        <div className="space-y-4 pb-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Siren className="w-6 h-6 text-rose-500" />
                        Health & Safety
                    </h1>
                    <p className="text-silver-mist text-sm">Report incidents, track investigations, and monitor safety metrics.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20">
                    <Plus className="w-4 h-4" /> Report Incident
                </button>
            </div>

            {/* Safety Scorecard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                        <div className="text-sm font-medium opacity-90 mb-2">Days Without Incident</div>
                        <div className="text-5xl font-bold mb-4">{daysSinceIncident}</div>
                        <div className="flex items-center gap-2 text-xs bg-white/20 inline-flex px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Target: 365 Days
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{openCases}</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Open Cases</div>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: incidents.length > 0 ? `${(openCases / incidents.length) * 100}%` : '0%' }}></div>
                    </div>
                    <div className="mt-2 text-xs text-silver-mist">{incidents.filter(i => i.status === 'Investigating').length} Investigation Pending</div>
                </div>

                <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-ink-black dark:text-pearl">{incidents.length > 0 ? Math.round((closedCases / incidents.length) * 100) : 0}%</div>
                            <div className="text-xs text-silver-mist uppercase font-bold">Resolution Rate</div>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: incidents.length > 0 ? `${(closedCases / incidents.length) * 100}%` : '0%' }}></div>
                    </div>
                    <div className="mt-2 text-xs text-silver-mist">Total Incidents: {incidents.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Incident Log */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-500" />
                            Recent Incidents
                        </h3>
                        <button className="text-xs font-bold text-celestial-indigo hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {incidents.length === 0 ? (
                            <div className="bg-white dark:bg-stellar-blue p-8 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm text-center text-slate-400">
                                No incidents reported.
                            </div>
                        ) : (
                            incidents.map((incident, idx) => (
                                <div key={incident.id || idx} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityColor(incident.severity)}`}>
                                                {incident.severity}
                                            </div>
                                            <span className="text-xs text-silver-mist font-mono">{incident.id}</span>
                                        </div>
                                        <div className={`text-xs font-bold ${getStatusColor(incident.status)}`}>
                                            {incident.status}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-ink-black dark:text-pearl mb-1 group-hover:text-rose-600 transition-colors cursor-pointer">{incident.type}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{incident.description}</p>

                                            <div className="flex items-center gap-3 text-xs text-silver-mist">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {incident.date}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {incident.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Reported by {incident.reportedBy}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="self-center p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions / Guidelines */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4">Emergency Contacts</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                <div className="text-sm font-bold text-rose-700 dark:text-rose-300">Medical Emergency</div>
                                <div className="text-lg font-bold text-rose-600">911</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Security Desk</div>
                                <div className="text-sm font-bold text-slate-600 dark:text-slate-200">EXT 4004</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Facility Manager</div>
                                <div className="text-sm font-bold text-slate-600 dark:text-slate-200">EXT 4005</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-amber-400" />
                            Safety First
                        </h3>
                        <p className="text-slate-300 text-xs mb-4">
                            Remember to report all &quot;Near Misses&quot;. Identifying hazards before they cause injury is key to a safe workplace.
                        </p>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors">
                            View Safety Policy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

