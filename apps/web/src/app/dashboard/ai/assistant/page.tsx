"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Bot,
    User,
    Sparkles,
    MoreHorizontal,
    Smile,
    Paperclip,
    ArrowRight,
    Plane,
    FileText,
    Calendar,
    HelpCircle
} from 'lucide-react';

// --- TYPE DEFINITIONS ---

type MessageType = 'text' | 'widget-leave' | 'widget-policy' | 'widget-actions';

interface Message {
    id: string;
    sender: 'user' | 'bot';
    type: MessageType;
    content?: string;
    data?: any;
    timestamp: Date;
}

// --- MOCK DATA & WIDGETS ---

const QUICK_PROMPTS = [
    { label: 'Check leave balance', icon: Plane },
    { label: 'Download last payslip', icon: FileText },
    { label: 'WFH Policy', icon: HelpCircle },
    { label: 'Book a meeting room', icon: Calendar },
];

// Widget: Leave Balance
const LeaveWidget = () => (
    <div className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm w-64 mt-2">
        <h4 className="font-bold text-sm text-ink-black dark:text-pearl mb-2">Leave Balance</h4>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-silver-mist">Annual Leave</span>
                <span className="font-bold text-emerald-500">12 Days</span>
            </div>
            <div className="w-full h-1.5 bg-cloud dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4" />
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-silver-mist">Sick Leave</span>
                <span className="font-bold text-amber-500">5 Days</span>
            </div>
            <div className="w-full h-1.5 bg-cloud dark:bg-deep-cosmos rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-1/2" />
            </div>
        </div>
        <button className="w-full mt-3 py-1.5 bg-celestial-indigo/10 text-celestial-indigo text-xs font-bold rounded hover:bg-celestial-indigo hover:text-white transition-colors">
            Apply Leave
        </button>
    </div>
);

// Widget: Policy Summary
const PolicyWidget = () => (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 w-72 mt-2">
        <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-stellar-blue rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-100">Work From Home Policy</h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                    Employees are allowed <strong>2 days</strong> of WFH per week. Approval from the manager is required at least 24 hours in advance.
                </p>
                <div className="flex gap-2 mt-2">
                    <button className="text-xs font-bold text-indigo-600 hover:underline">Read Full Doc</button>
                </div>
            </div>
        </div>
    </div>
);

export default function AssistantPage() {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'bot',
            type: 'text',
            content: 'Hi Sarah! 👋 I\'m Aura, your personal HR assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);

    // Auto-scroll to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;

        // User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            type: 'text',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate Bot Response
        setTimeout(() => {
            let botMsg: Message;
            const lowerText = text.toLowerCase();

            if (lowerText.includes('leave') || lowerText.includes('balance')) {
                botMsg = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    type: 'widget-leave',
                    timestamp: new Date()
                };
            } else if (lowerText.includes('policy') || lowerText.includes('wfh')) {
                botMsg = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    type: 'widget-policy',
                    timestamp: new Date()
                };
            } else {
                botMsg = {
                    id: (Date.now() + 1).toString(),
                    sender: 'bot',
                    type: 'text',
                    content: 'I can help with that! However, as a demo version, I\'m currently best at showing your leave balance or policy documents. Try asking about those!',
                    timestamp: new Date()
                };
            }

            setIsTyping(false);
            setMessages(prev => [...prev, botMsg]);
        }, 1500);
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden relative">

                {/* Header */}
                <div className="p-4 border-b border-cloud dark:border-nebula-purple/20 flex justify-between items-center bg-white dark:bg-stellar-blue z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-celestial-indigo to-quantum-rose flex items-center justify-center text-white shadow-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-ink-black dark:text-pearl">Aura Assistant</h2>
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-deep-cosmos rounded-full text-silver-mist">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-900/50">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'user'
                                    ? 'bg-slate-200 text-slate-600'
                                    : 'bg-gradient-to-tr from-celestial-indigo to-quantum-rose text-white'
                                }`}>
                                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                                {msg.type === 'text' && (
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-celestial-indigo text-white rounded-tr-sm'
                                            : 'bg-white dark:bg-stellar-blue text-slate-700 dark:text-slate-200 border border-cloud dark:border-nebula-purple/20 rounded-tl-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                )}

                                {msg.type === 'widget-leave' && <LeaveWidget />}
                                {msg.type === 'widget-policy' && <PolicyWidget />}

                                <span className="text-[10px] text-silver-mist mt-1 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-celestial-indigo to-quantum-rose flex items-center justify-center text-white shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/20 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-stellar-blue border-t border-cloud dark:border-nebula-purple/20">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-deep-cosmos border border-cloud dark:border-nebula-purple/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-sm"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button className="p-1.5 text-silver-mist hover:text-celestial-indigo hover:bg-white rounded-lg transition-colors">
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-silver-mist hover:text-celestial-indigo hover:bg-white rounded-lg transition-colors">
                                    <Smile className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <button
                            className={`p-3 rounded-xl transition-all ${input.trim()
                                    ? 'bg-celestial-indigo text-white hover:bg-celestial-indigo/90 shadow-lg shadow-celestial-indigo/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                }`}
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-silver-mist">Aura AI can make mistakes. Consider checking important info.</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="w-80 hidden lg:flex flex-col gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <Bot className="w-10 h-10 mb-4 text-white/90" />
                    <h3 className="font-bold text-lg">Pro Tip</h3>
                    <p className="text-sm text-indigo-100 mt-2 leading-relaxed">
                        You can drag and drop PDF policies directly into the chat to summarize them instantly!
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-xs font-bold text-silver-mist uppercase mb-3 px-1">Quick Prompts</h3>
                    <div className="space-y-2">
                        {QUICK_PROMPTS.map((prompt, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center gap-3 p-3 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 hover:border-celestial-indigo hover:shadow-md transition-all text-left group"
                                onClick={() => handleSend(prompt.label)}
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-deep-cosmos flex items-center justify-center text-slate-500 group-hover:bg-celestial-indigo/10 group-hover:text-celestial-indigo transition-colors">
                                    <prompt.icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">{prompt.label}</span>
                                <ArrowRight className="w-4 h-4 text-silver-mist group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
