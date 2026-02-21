"use client";

import React, { useState, useEffect } from 'react';
import {
    Headphones,
    Users,
    Clock,
    MessageSquare,
    Loader2
} from 'lucide-react';
import { TicketManagementService, AgentManagementService } from '../services';
import type { Ticket, Agent } from '../types';

export default function AgentConsolePage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ticketsData, agentsData] = await Promise.all([
                    TicketManagementService.getAllTickets(),
                    AgentManagementService.getAllAgents(),
                ]);
                setTickets(ticketsData);
                setAgents(agentsData);
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

    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'new').length;
    const breachedTickets = tickets.filter(t => t.slaInfo?.status === 'breached').length;
    const currentTicket = tickets[0];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Headphones className="w-6 h-6 text-purple-500" />
                        Agent Console
                    </h1>
                    <p className="text-slate-500 text-sm">Manage ticket queues, track SLAs, and resolve employee queries.</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Online
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
                <div className="lg:col-span-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-2xl font-bold text-indigo-600">{openTickets}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Open Tickets</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-2xl font-bold text-rose-500">{breachedTickets}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">SLA Breached</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4">My Queues</h3>
                        <div className="space-y-2">
                            {tickets.length === 0 ? (
                                <div className="text-xs text-slate-400 text-center py-4">No queues assigned.</div>
                            ) : (
                                tickets.slice(0, 3).map((t, i) => (
                                    <button key={t.ticketId || i} className={`w-full text-left p-2 rounded-lg text-xs font-bold flex justify-between items-center ${i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                                        {t.category || 'General'}
                                        <span className="bg-white dark:bg-slate-700 px-1.5 rounded text-[10px] text-slate-500 shadow-sm">1</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {currentTicket ? (
                        <>
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div>
                                    <h2 className="font-bold text-lg flex items-center gap-2">
                                        #{currentTicket.ticketNumber} <span className="font-normal text-slate-400">|</span> {currentTicket.subject}
                                    </h2>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Raised by: {currentTicket.requester?.employeeName || 'Unknown'}</span>
                                        <span className="flex items-center gap-1 text-rose-500"><Clock className="w-3 h-3" /> SLA: {currentTicket.slaInfo?.timeRemaining || 0}min remaining</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">Assign</button>
                                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Resolve</button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col md:flex-row min-h-0">
                                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                                    {currentTicket.comments?.length ? currentTicket.comments.map((comment, idx) => (
                                        <div key={comment.commentId || idx} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                                                {comment.author?.[0] || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm">{comment.author}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-r-xl rounded-bl-xl text-sm text-slate-700 dark:text-slate-300">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center text-slate-400 py-8">No messages yet. Start the conversation.</div>
                                    )}
                                </div>

                                <div className="w-72 border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-4 space-y-6 overflow-y-auto">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Properties</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Priority</span>
                                                <span className="font-bold text-amber-500">{currentTicket.priority}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Category</span>
                                                <span className="font-bold">{currentTicket.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Status</span>
                                                <span className="font-bold text-indigo-600">{currentTicket.status}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">SLA Timer</h4>
                                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="font-bold text-slate-500">Response</span>
                                                <span className={`font-bold ${currentTicket.slaInfo?.status === 'met' ? 'text-emerald-500' : 'text-rose-500'}`}>{currentTicket.slaInfo?.status === 'met' ? 'Met' : 'Pending'}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="font-bold text-slate-500">Resolution</span>
                                                <span className="text-rose-500 font-bold">{currentTicket.slaInfo?.timeRemaining || 0}min</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="relative">
                                    <textarea rows={2} placeholder="Type your reply..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold pr-12 resize-none"></textarea>
                                    <button className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            No tickets in queue. Select a queue to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
