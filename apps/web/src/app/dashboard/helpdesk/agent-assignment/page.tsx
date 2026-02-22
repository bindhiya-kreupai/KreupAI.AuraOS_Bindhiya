"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowRightLeft,
    Search,
    Loader2
} from 'lucide-react';
import { AgentManagementService, TicketManagementService } from '../services';
import type { Agent, Ticket } from '../types';

export default function AgentAssignmentPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [agentsData, ticketsData] = await Promise.all([
                    AgentManagementService.getAllAgents(),
                    TicketManagementService.getAllTickets(),
                ]);
                setAgents(agentsData);
                setTickets(ticketsData.filter(t => !t.assignedAgent));
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

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ArrowRightLeft className="w-6 h-6 text-indigo-500" />
                        Agent Assignment
                    </h1>
                    <p className="text-slate-500 text-sm">Route tickets to the appropriate HR specialists.</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search unassigned tickets..."
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                        Unassigned Queue ({tickets.length})
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 h-96">
                        {tickets.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No unassigned tickets.</div>
                        ) : (
                            tickets.map((t, i) => (
                                <div key={t.ticketId || i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md cursor-grab active:cursor-grabbing bg-white dark:bg-slate-900">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-mono font-bold text-slate-400">#{t.ticketNumber}</span>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{t.category}</span>
                                    </div>
                                    <h4 className="font-bold text-sm">{t.subject}</h4>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                        Available Agents
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto flex-1 h-96">
                        {agents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">No agents available.</div>
                        ) : (
                            agents.map((agent, i) => {
                                const loadPct = agent.maxCapacity > 0 ? Math.round((agent.currentWorkload / agent.maxCapacity) * 100) : 0;
                                return (
                                    <div key={agent.agentId || i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                                            {agent.employeeName?.[0] || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{agent.employeeName}</h4>
                                            <div className="text-xs text-slate-500">{agent.role}</div>
                                        </div>
                                        <div className="w-24">
                                            <div className="text-xs text-right mb-1 text-slate-500">{loadPct}% Load</div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${loadPct > 80 ? 'bg-rose-500' : loadPct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${loadPct}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

