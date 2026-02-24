"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Bot,
    Send,
    User,
    Sparkles,
    BookOpen,
    PlayCircle,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    MessageSquare,
    ArrowRight
} from 'lucide-react';
import { aiCoachingBot } from '@/lib/services/ai-automation-client';

const SUGGESTED_TOPICS = [
    "How to handle underperformance?",
    "Preparing for a promotion review",
    "Conflict resolution strategies",
    "Giving constructive feedback"
];

const CONTEXT_RESOURCES = [
    { type: 'Article', title: 'The Art of Radical Candor', time: '5 min read', icon: BookOpen },
    { type: 'Video', title: 'Managing difficult personalities', time: '12 min', icon: PlayCircle },
    { type: 'Guide', title: 'Performance Review Checklist', time: 'PDF', icon: Sparkles },
];

export default function AICoachingBotPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize with welcome message
        setMessages([{
            id: 1,
            sender: 'ai',
            content: "Hi, I'm your Aura Leadership Coach. I can help you prepare for difficult conversations, draft feedback, or find relevant training resources. What's on your mind today?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim() || loading) return;

        const userMsg = {
            id: messages.length + 1,
            sender: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = inputValue;
        setInputValue('');
        setLoading(true);

        try {
            const result = await aiCoachingBot.sendMessage(currentInput, sessionId);
            if (result.success && result.data) {
                const aiMsg = {
                    id: messages.length + 2,
                    sender: 'ai',
                    content: result.data.message || result.data.response || "I'm here to help. Could you provide more details?",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMsg]);

                if (result.data.sessionId && !sessionId) {
                    setSessionId(result.data.sessionId);
                }
            }
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-3">

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden">

                {/* Chat Header */}
                <div className="p-4 border-b border-cloud dark:border-nebula-purple/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-ink-black dark:text-pearl">Aura Coach</h1>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-500 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user'
                                        ? 'bg-slate-200 dark:bg-slate-700'
                                        : 'bg-indigo-100 dark:bg-indigo-900/50'
                                    }`}>
                                    {msg.sender === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                                </div>
                                <div className={`p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-tl-none text-ink-black dark:text-pearl'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <div className={`text-[10px] mt-2 opacity-70 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-stellar-blue border-t border-cloud dark:border-nebula-purple/50">
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                            {SUGGESTED_TOPICS.map((topic, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInputValue(topic)}
                                    className="whitespace-nowrap px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800 transition-colors"
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type your message..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-14 max-h-32"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-silver-mist mt-2">
                        AI can make mistakes. Consider checking important information.
                    </p>
                </div>
            </div>

            {/* Sidebar Resources */}
            <div className="w-80 flex flex-col gap-3">
                <div className="bg-white dark:bg-stellar-blue p-5 rounded-xl border border-cloud dark:border-nebula-purple/50 shadow-sm">
                    <h3 className="text-sm font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Contextual Resources
                    </h3>
                    <div className="space-y-3">
                        {CONTEXT_RESOURCES.map((res, i) => (
                            <div key={i} className="group p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg border border-transparent hover:border-cloud cursor-pointer transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center">
                                        <res.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {res.title}
                                        </h4>
                                        <p className="text-xs text-silver-mist mt-1">{res.type} • {res.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-5 rounded-xl text-white shadow-lg">
                    <h3 className="text-sm font-bold mb-2">Practice Mode</h3>
                    <p className="text-xs text-indigo-200 mb-4">
                        Simulate a difficult conversation with an AI persona.
                    </p>
                    <button className="w-full py-2 bg-white text-indigo-900 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Start Simulation
                    </button>
                </div>
            </div>

        </div>
    );
}

