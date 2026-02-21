"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Heart,
    Calendar,
    MessageCircle,
    Plus,
    Loader2
} from 'lucide-react';
import { ERGService } from '../services';

export default function ErgManagementPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await ERGService.getAllERGs();
                setGroups(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const ergs = [
        {
            name: 'Women @ Aura',
            members: 142,
            category: 'Gender Identity',
            description: 'Empowering women to lead, thrive, and innovate.',
            nextEvent: 'Leadership Panel - Dec 15',
            color: 'bg-pink-500'
        },
        {
            name: 'Pride Network',
            members: 85,
            category: 'LGBTQ+',
            description: 'Fostering an inclusive environment for LGBTQ+ employees.',
            nextEvent: 'Monthly Mixer - Dec 20',
            color: 'bg-rainbow-gradient' // Will use a safe fallback or custom class
        },
        {
            name: 'Black Employee Network',
            members: 90,
            category: 'Race & Ethnicity',
            description: 'Supporting Black employees through mentorship & advocacy.',
            nextEvent: 'Community Outreach - Jan 10',
            color: 'bg-purple-500'
        },
        {
            name: 'Veterans Alliance',
            members: 45,
            category: 'Affiliation',
            description: 'Connecting veterans and military families.',
            nextEvent: 'Networking Hour - Jan 05',
            color: 'bg-slate-600'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        ERG Management
                    </h1>
                    <p className="text-slate-500 text-sm">Employee Resource Groups aimed at fostering community.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Propose New ERG
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ergs.map((erg, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                        <div className={`h-24 ${erg.color === 'bg-rainbow-gradient' ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500' : erg.color} p-6 flex justify-between items-start text-white`}>
                            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                                <Heart className="w-6 h-6" />
                            </div>
                            <button className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold hover:bg-white/30 transition-colors">Join Group</button>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold mb-1">{erg.name}</h3>
                            <div className="text-xs font-bold text-slate-400 uppercase mb-3">{erg.category}</div>
                            <p className="text-slate-500 text-sm mb-6 flex-1">{erg.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1 font-bold"><Users className="w-4 h-4" /> {erg.members}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {erg.nextEvent}</span>
                                </div>
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-indigo-600 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
