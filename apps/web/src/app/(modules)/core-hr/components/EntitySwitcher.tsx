'use client';

import React, { useState } from 'react';
import { ChevronDown, Globe, Building2, Check, LayoutGrid } from 'lucide-react';
import { cn } from '@aura/ui/utils';

const ENTITIES = [
    { id: 'global', name: 'Global Group View', icon: Globe, color: 'text-indigo-500' },
    { id: 'aura-dubai', name: 'Aura Dubai (UAE)', icon: Building2, color: 'text-emerald-500' },
    { id: 'aura-riyadh', name: 'Aura Riyadh (KSA)', icon: Building2, color: 'text-amber-500' },
    { id: 'aura-mumbai', name: 'Aura Mumbai (IN)', icon: Building2, color: 'text-blue-500' },
];

export function EntitySwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(ENTITIES[0]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700")}>
                    <selected.icon className={cn("w-5 h-5", selected.color)} />
                </div>
                <div className="text-left">
                    <p className="text-xs text-silver-mist font-medium uppercase tracking-wider">Legal Entity</p>
                    <p className="text-sm font-bold text-ink-black dark:text-pearl">{selected.name}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-silver-mist transition-transform duration-300 ml-2", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                        <div className="p-2">
                            {ENTITIES.map((entity) => (
                                <button
                                    key={entity.id}
                                    onClick={() => {
                                        setSelected(entity);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group",
                                        selected.id === entity.id
                                            ? "bg-indigo-50 dark:bg-indigo-900/20"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <entity.icon className={cn("w-4 h-4", entity.color)} />
                                        <span className={cn(
                                            "text-sm font-medium",
                                            selected.id === entity.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-300"
                                        )}>
                                            {entity.name}
                                        </span>
                                    </div>
                                    {selected.id === entity.id && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                                </button>
                            ))}
                        </div>
                        <div className="border-t border-cloud dark:border-nebula-purple/20 p-2 bg-slate-50/50 dark:bg-slate-900/50">
                            <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Manage Legal Entities
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
