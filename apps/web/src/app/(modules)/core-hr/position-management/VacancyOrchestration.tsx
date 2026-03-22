'use client';

import React from 'react';
import {
    PlusCircle,
    Clock,
    MapPin,
    Building2,
    CheckCircle2,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { cn } from '@aura/ui/utils';

const ACTIVE_VACANCIES = [
    { id: 'VC-882', title: 'VP of Engineering', dept: 'Technology', entity: 'Aura Dubai', status: 'In Approval (Finance)', urgency: 'High' },
    { id: 'VC-883', title: 'ML Ops Engineer', dept: 'Data Science', entity: 'Aura Riyadh', status: 'In Approval (HOD)', urgency: 'Medium' },
];

export function VacancyOrchestration() {
    return (
        <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-ink-black dark:text-pearl">Vacancy Orchestration</h3>
                    <p className="text-xs text-silver-mist text-center">Active Position Requests Workflow</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                    <PlusCircle className="w-4 h-4" /> New Vacancy Request
                </button>
            </div>

            <div className="space-y-4">
                {ACTIVE_VACANCIES.map((vacancy) => (
                    <div key={vacancy.id} className="p-4 rounded-xl border border-cloud dark:border-nebula-purple/20 group hover:border-indigo-400/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-ink-black dark:text-pearl group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{vacancy.title}</h4>
                            <span className={cn(
                                "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full",
                                vacancy.urgency === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                            )}>
                                {vacancy.urgency} Urgency
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 mb-4">
                            <div className="flex items-center gap-1.5 text-[10px] text-silver-mist font-bold uppercase tracking-wider">
                                <Building2 className="w-3 h-3" /> {vacancy.dept}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-silver-mist font-bold uppercase tracking-wider">
                                <MapPin className="w-3 h-3" /> {vacancy.entity}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-cloud dark:border-nebula-purple/10">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
                                <Clock className="w-3.5 h-3.5" /> {vacancy.status}
                            </div>
                            <button className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded text-indigo-400">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-cloud dark:border-nebula-purple/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-silver-mist uppercase">Pipeline Quality</p>
                        <p className="text-sm font-bold text-ink-black dark:text-pearl">8.2 / 10 Optimal</p>
                    </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
        </div>
    );
}
