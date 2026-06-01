"use client";

import React, { useState, useEffect } from 'react';
import {
    Bot,
    Sparkles,
    Zap,
    Cpu,
    Shield,
    AlertCircle,
    Loader2,
    Save,
    CheckCircle2,
} from 'lucide-react';

interface AIModel {
    id: string;
    name: string;
    provider: string;
    status: string;
}

interface AICapability {
    id: string;
    name: string;
    desc: string;
    active: boolean;
}

interface AISafety {
    piiRedactionActive: boolean;
    redactedFields: string[];
}

interface AIConfig {
    primaryModel: string;
    availableModels: AIModel[];
    personalityTone: number;
    systemPrompt: string;
    capabilities: AICapability[];
    safety: AISafety;
    systemStatus: string;
    lastUpdatedAt: string;
}

export default function AICopilotPage() {
    const [config, setConfig] = useState<AIConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/v1/admin/ai-config')
            .then(res => res.json())
            .then(result => {
                if (result.success && result.data) {
                    setConfig(result.data);
                } else {
                    setError('Failed to load AI configuration.');
                }
            })
            .catch(err => {
                console.error('Failed to fetch AI config:', err);
                setError('Failed to load AI configuration.');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch('/api/v1/admin/ai-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const result = await res.json();
            if (result.success) {
                setConfig(result.data);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (err: any) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const toggleCapability = (id: string) => {
        if (!config) return;
        setConfig({
            ...config,
            capabilities: config.capabilities.map(cap =>
                cap.id === id ? { ...cap, active: !cap.active } : cap
            ),
        });
    };

    if (loading) {
        return (
            <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-2 p-6">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-slate-500">Loading AI configuration...</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-6" />
                            <div className="space-y-4">
                                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !config) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
                    {error || 'Unable to load configuration.'}
                    <button onClick={() => window.location.reload()} className="ml-4 underline text-sm">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bot className="w-6 h-6 text-indigo-500" />
                        AI Copilot Settings
                    </h1>
                    <p className="text-slate-500 text-sm">Configure the behavior, intelligence, and permissions of Aura AI.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        config.systemStatus === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                            config.systemStatus === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></div>
                        System {config.systemStatus === 'active' ? 'Active' : config.systemStatus}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full min-h-0">
                {/* Configuration Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-500" /> Model Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Primary Model</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {config.availableModels.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => setConfig({ ...config, primaryModel: m.id })}
                                        className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all
                                            ${config.primaryModel === m.id
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-slate-100 dark:border-slate-800 hover:border-indigo-300'}
                                        `}
                                    >
                                        <Bot className={`w-6 h-6 ${config.primaryModel === m.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={`text-xs font-bold ${config.primaryModel === m.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-500'}`}>{m.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Personality &amp; Tone</label>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                                <div className="flex justify-between text-xs text-slate-500 font-bold mb-2">
                                    <span>Concise</span>
                                    <span>Balanced</span>
                                    <span>Creative</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={config.personalityTone}
                                    onChange={e => setConfig({ ...config, personalityTone: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">System Prompt Override</label>
                            <textarea
                                className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
                                value={config.systemPrompt}
                                onChange={e => setConfig({ ...config, systemPrompt: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Capabilities & Privacy */}
                <div className="space-y-4">
                    {/* Capabilities */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" /> Enabled Capabilities
                        </h3>
                        <div className="space-y-3">
                            {config.capabilities.map((cap) => (
                                <div key={cap.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cap.active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{cap.name}</div>
                                            <div className="text-xs text-slate-400">{cap.desc}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleCapability(cap.id)}
                                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${cap.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${cap.active ? 'left-6' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Safety */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-500" /> Safety &amp; PII
                        </h3>
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 rounded-xl mb-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-rose-900 dark:text-rose-400 text-sm">
                                        PII Redaction {config.safety.piiRedactionActive ? 'Active' : 'Inactive'}
                                    </h4>
                                    <p className="text-xs text-rose-800 dark:text-rose-500 mt-1">
                                        {config.safety.redactedFields.join(', ')} are automatically masked before sending to the LLM.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                            View Redaction Rules
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

