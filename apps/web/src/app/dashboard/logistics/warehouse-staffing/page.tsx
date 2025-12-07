"use client";

import React, { useState } from 'react';
import {
    Users,
    Package,
    Clock,
    BarChart3
} from 'lucide-react';

export default function WarehouseStaffingPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-500" />
                        Warehouse Staffing
                    </h1>
                    <p className="text-slate-500 text-sm">Manage shift planning and productivity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Shift Schedule (Today)</h3>
                    <div className="space-y-6">
                        {[
                            { shift: 'Morning Shift', time: '06:00 - 14:00', staff: 42, req: 40, status: 'Overstaffed' },
                            { shift: 'Afternoon Shift', time: '14:00 - 22:00', staff: 38, req: 40, status: 'Understaffed' },
                            { shift: 'Night Shift', time: '22:00 - 06:00', staff: 25, req: 25, status: 'Optimal' },
                        ].map((shift, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-bold flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {shift.shift}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${shift.status === 'Optimal' || shift.status === 'Overstaffed' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-rose-100 text-rose-600'
                                        }`}>{shift.status}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500 mb-1">
                                    <span>Time: {shift.time}</span>
                                    <span>Staff: {shift.staff} / {shift.req}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${shift.staff < shift.req ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((shift.staff / shift.req) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <BarChart3 className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase">Productivity</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">1,240</h3>
                        <p className="text-indigo-100 text-sm mb-4">Packages processed per hour (Avg)</p>
                        <div className="w-full bg-indigo-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white/80 h-full w-[85%]"></div>
                        </div>
                        <div className="text-xs text-indigo-200 mt-2 text-right">Target: 1,450 pph</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4">Open Shifts</h3>
                        <div className="space-y-3">
                            <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-sm">Forklift Operator</div>
                                    <div className="text-xs text-slate-500">Tomorrow • 14:00 - 22:00</div>
                                </div>
                                <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded">Fill</button>
                            </div>
                            <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-sm">Picker / Packer</div>
                                    <div className="text-xs text-slate-500">Fri • 06:00 - 14:00</div>
                                </div>
                                <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded">Fill</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
