"use client";

import React from 'react';
import {
    ShieldAlert,
    HardHat,
    ClipboardCheck,
    AlertTriangle,
    Eye,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { useManufacturing } from '../hooks/useManufacturing';

export default function SafetyPage() {
    const {
        safetyIncidents,
        ppeInventory,
        loading,
        error
    } = useManufacturing();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-6rem)] items-center justify-center text-rose-500 font-bold">
                Error: {error}
            </div>
        );
    }

    // Days without incident calculation
    const lastIncidentDate = safetyIncidents.length > 0
        ? Math.max(...safetyIncidents.map(i => new Date(i.incidentDate).getTime()))
        : new Date('2024-01-01').getTime();

    const daysSinceLastIncident = Math.floor((new Date().getTime() - lastIncidentDate) / (1000 * 60 * 60 * 24));

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Safety & Compliance
                    </h1>
                    <p className="text-slate-500 text-sm">Incident logs, PPE tracking, and safety audits.</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {daysSinceLastIncident} Days Without Incident
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                {/* Incident Log */}
                <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Incident Log
                        </h3>
                        <button className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded-lg shadow hover:bg-rose-600 transition-colors">
                            Report New
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {safetyIncidents.map((inc, i) => (
                            <div key={inc.incidentId || i} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{inc.incidentType.typeName}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                            ${inc.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                                                inc.severity === 'serious' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-blue-100 text-blue-600'}
                                        `}>
                                            {inc.severity}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500">{inc.location.area} • {new Date(inc.incidentDate).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${inc.status === 'closed' ? 'text-slate-500 bg-slate-50' : 'text-emerald-600 bg-emerald-50'
                                        }`}>
                                        {inc.status}
                                    </span>
                                    <button className="block mt-2 text-xs font-bold text-slate-400 hover:text-indigo-600 text-right w-full">View Report</button>
                                </div>
                            </div>
                        ))}
                        {safetyIncidents.length === 0 && (
                            <div className="text-center py-10 text-slate-400 italic">No incidents reported.</div>
                        )}
                    </div>
                </div>

                {/* PPE Inventory */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <HardHat className="w-5 h-5 text-indigo-500" /> PPE Inventory
                    </h3>
                    <div className="space-y-6">
                        {ppeInventory.map((item, i) => {
                            const ratio = item.quantity.available / (item.quantity.available + item.reorderPoint || 1);
                            const health = Math.min(Math.max(ratio * 100, 0), 100);

                            return (
                                <div key={item.inventoryId || i}>
                                    <div className="flex justify-between text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                                        <span>{item.itemName}</span>
                                        <span className="opacity-70">{item.quantity.available} units</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.status === 'active' ? 'bg-emerald-500' :
                                                    item.status === 'low_stock' ? 'bg-amber-500' :
                                                        'bg-rose-500'
                                                }`}
                                            style={{ width: `${health}%` }}
                                        ></div>
                                    </div>
                                    {item.status === 'low_stock' && (
                                        <div className="text-[10px] text-rose-500 font-bold mt-1">Low Stock - Reorder Soon</div>
                                    )}
                                </div>
                            );
                        })}
                        {ppeInventory.length === 0 && (
                            <div className="text-center py-10 text-slate-400 italic">No PPE items found.</div>
                        )}
                    </div>

                    <button className="w-full mt-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Manage Inventory
                    </button>
                </div>
            </div>
        </div>
    );
}
