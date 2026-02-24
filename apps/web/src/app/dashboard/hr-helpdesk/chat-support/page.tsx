"use client";

import React, { useState } from 'react';
import {
    MessageSquare,
    Send,
    User,
    Minimize2
} from 'lucide-react';

export default function ChatSupportPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                        Live Chat Support
                    </h1>
                    <p className="text-slate-500 text-sm">Connect instantly with an HR representative.</p>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-w-4xl mx-auto w-full shadow-2xl">
                {/* Chat Header */}
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="font-bold">Mike Smith</div>
                            <div className="text-xs text-indigo-100 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Online
                            </div>
                        </div>
                    </div>
                    <Minimize2 className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100" />
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950">
                    <div className="flex justify-center text-xs text-slate-400 my-4">Today, 10:23 AM</div>

                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">MS</div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm max-w-[80%]">
                            <p className="text-sm">Hi Alice! How can I help you today regarding your insurance query?</p>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">U</div>
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                            <p className="text-sm">Hi Mike, I'm trying to add my spouse to the plan but the button seems disabled.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">MS</div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm max-w-[80%]">
                            <p className="text-sm">I see. That usually happens if the enrollment window is closed, but let me check your eligibility status quickly.</p>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

