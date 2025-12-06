"use client";

import React, { useState } from 'react';
import {
    Hourglass,
    CheckCircle2,
    XCircle,
    Calendar,
    Clock
} from 'lucide-react';

export default function ProbationTrackingPage() {
    const [employees, setEmployees] = useState([
        { id: 1, name: 'John Smith', role: 'Junior Developer', dept: 'Engineering', start: 'Jun 15, 2023', end: 'Dec 15, 2023', daysLeft: 5, status: 'Reviews Pending' },
        { id: 2, name: 'Emily Davis', role: 'Sales Associate', dept: 'Sales', start: 'Jul 01, 2023', end: 'Jan 01, 2024', daysLeft: 22, status: 'On Track' },
    ]);

    const handleAction = (id: number, action: string) => {
        alert(`${action} initiated for employee.`);
        if (action === 'Confirm') {
            setEmployees(prev => prev.filter(e => e.id !== id));
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Hourglass className="w-6 h-6 text-amber-500" />
                        Probation Tracking
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor probation periods and initiate confirmation workflows.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((emp) => (
                    <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                                    <img src={`https://i.pravatar.cc/150?u=${emp.name}`} alt={emp.name} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{emp.name}</h3>
                                    <div className="text-xs text-slate-500">{emp.role}</div>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold
                                ${emp.daysLeft <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}
                            `}>
                                {emp.daysLeft} Days Left
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Start Date</span>
                                <span className="font-bold">{emp.start}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> End Date</span>
                                <span className="font-bold">{emp.end}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Status</span>
                                <span className="font-bold text-amber-600">{emp.status}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAction(emp.id, 'Confirm')}
                                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => handleAction(emp.id, 'Extend')}
                                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 active:scale-95 transition-all"
                            >
                                Extend
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add more logic if needed */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">All other probations are on track.</p>
                </div>
            </div>
        </div>
    );
}
