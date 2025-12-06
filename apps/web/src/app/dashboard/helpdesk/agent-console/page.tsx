"use client";

import React from 'react';
import {
    Headphones,
    Users,
    Clock,
    BarChart2,
    CheckSquare,
    MessageSquare,
    AlertOctagon
} from 'lucide-react';

export default function AgentConsolePage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
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
                {/* Queue Stats */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-2xl font-bold text-indigo-600">12</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Open Tickets</div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <div className="text-2xl font-bold text-rose-500">2</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">SLA Breached</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="font-bold text-sm mb-4">My Queues</h3>
                        <div className="space-y-2">
                            {['L1 IT Support', 'Hardware Requests', 'VPN Access'].map((q, i) => (
                                <button key={i} className={`w-full text-left p-2 rounded-lg text-xs font-bold flex justify-between items-center ${i === 0 ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 border border-indigo-100 dark:border-indigo-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                                    {q}
                                    <span className="bg-white dark:bg-slate-700 px-1.5 rounded text-[10px] text-slate-500 shadow-sm">{3 - i}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ticket Workspace */}
                <div className="lg:col-span-3 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div>
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                #INC-1024 <span className="font-normal text-slate-400">|</span> Laptop Screen Flickering
                            </h2>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Raised by: John Doe</span>
                                <span className="flex items-center gap-1 text-rose-500"><Clock className="w-3 h-3" /> SLA: 2h remaining</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">Assign</button>
                            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Resolve</button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row min-h-0">
                        {/* Chat / Timeline */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6">
                            {/* Message */}
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">JD</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">John Doe</span>
                                        <span className="text-[10px] text-slate-400">10:30 AM</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-r-xl rounded-bl-xl text-sm text-slate-700 dark:text-slate-300">
                                        Hi, my screen keeps flickering when I open heavy apps like Photoshop. It started happening yesterday.
                                    </div>
                                </div>
                            </div>

                            {/* Agent Reply */}
                            <div className="flex gap-4 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">ME</div>
                                <div className="flex-1 text-right">
                                    <div className="flex items-center justify-end gap-2 mb-1">
                                        <span className="font-bold text-sm">Me</span>
                                        <span className="text-[10px] text-slate-400">10:45 AM</span>
                                    </div>
                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-l-xl rounded-br-xl text-sm text-slate-700 dark:text-slate-300 text-left inline-block">
                                        Thanks for reaching out, John. Can you confirm if you have tried restarting? Also, is it connected to an external monitor?
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">JD</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">John Doe</span>
                                        <span className="text-[10px] text-slate-400">10:50 AM</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-r-xl rounded-bl-xl text-sm text-slate-700 dark:text-slate-300">
                                        Yes, restarted twice. No external monitor connected.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side Panel Info */}
                        <div className="w-72 border-l border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-4 space-y-6 overflow-y-auto">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Properties</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Priority</span>
                                        <span className="font-bold text-amber-500">Medium</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Category</span>
                                        <span className="font-bold">Hardware</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Status</span>
                                        <span className="font-bold text-indigo-600">In Progress</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">SLA Timer</h4>
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="font-bold text-slate-500">Response</span>
                                        <span className="text-emerald-500 font-bold">Met</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-500">Resolution</span>
                                        <span className="text-rose-500 font-bold">01:55:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reply Box */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <textarea rows={2} placeholder="Type your reply..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-sm font-bold pr-12 resize-none"></textarea>
                            <button className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
