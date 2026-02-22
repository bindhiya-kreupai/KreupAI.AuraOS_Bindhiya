"use client";

import React from 'react';
import {
    Wrench,
    Clock,
    CheckCircle2,
    AlertOctagon,
    Plus,
    User,
    Calendar,
    Filter
} from 'lucide-react';

const ORDERS = [
    { id: 'WO-9921', issue: 'AC Not Cooling in Meeting Room B', category: 'HVAC', priority: 'High', status: 'In Progress', assigned: 'Mike Technician', created: '2 hrs ago' },
    { id: 'WO-9922', issue: 'Flickering Light in Hallway', category: 'Electrical', priority: 'Low', status: 'Open', assigned: 'Unassigned', created: '5 hrs ago' },
    { id: 'WO-9918', issue: 'Broken Chair replacement', category: 'Furniture', priority: 'Medium', status: 'Completed', assigned: 'John Fixit', created: 'Yesterday' },
];

export default function WorkOrdersPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-indigo-500" />
                        Work Orders
                    </h1>
                    <p className="text-slate-500 text-sm">Manage maintenance requests, repairs, and technician assignments.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20">
                    <Plus className="w-4 h-4" /> Create Work Order
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Open Requests</div>
                        <AlertOctagon className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-3xl font-black">12</div>
                    <div className="text-xs text-rose-500 mt-1 font-bold">4 High Priority</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">In Progress</div>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-3xl font-black">5</div>
                    <div className="text-xs text-amber-500 mt-1 font-bold">Avg Time: 2h 30m</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs font-bold text-slate-500 uppercase">Completed (Today)</div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black">8</div>
                </div>
                <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                    <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Technicians Active</div>
                    <div className="text-3xl font-black">4/6</div>
                    <div className="text-xs text-indigo-200 mt-1">On-site now</div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Active Tickets</h3>
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                        <Filter className="w-3 h-3" /> Filter
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {ORDERS.map(wo => (
                        <div key={wo.id} className="group p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col md:flex-row gap-3 items-start md:items-center">
                            <div className={`
                                w-2 h-12 rounded-full shrink-0
                                ${wo.priority === 'High' ? 'bg-rose-500' :
                                    wo.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}
                            `}></div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono font-bold text-slate-400">{wo.id}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{wo.category}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{wo.issue}</h4>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wo.created}</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {wo.assigned}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase
                                    ${wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                                        wo.status === 'In Progress' ? 'bg-indigo-100 text-indigo-600' :
                                            'bg-slate-100 text-slate-600'}
                                `}>
                                    {wo.status}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
                                    Manage
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

