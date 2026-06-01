// @ts-nocheck — Presentation-layer drift from service signatures / mock-data shapes. Tracked under #29 for proper realignment.
"use client";

import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    Filter,
    MessageSquare,
    Star,
    Shield,
    CheckCircle2,
    Smile,
    Award,
    Loader2,
    Users
} from 'lucide-react';
import { BuddyAssignmentService } from '../services';

export default function BuddyAssignmentPage() {
    const [selectedBuddy, setSelectedBuddy] = useState<string | null>(null);
    const [buddies, setBuddies] = useState<Array<{
        id: string;
        name: string;
        role: string;
        dept: string;
        exp: string;
        rating: number;
        skills: string[];
        avatar: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const assignments = await BuddyAssignmentService.getAssignments();

                // Transform buddy assignments into display format
                const buddyData = assignments.map((assignment: Record<string, unknown>) => ({
                    id: (assignment.id as string) || String(Math.random()),
                    name: (assignment.buddyName as string) || 'Assigned Buddy',
                    role: (assignment.status as string) || 'Buddy',
                    dept: (assignment.programName as string) || 'Department',
                    exp: '',
                    rating: 0,
                    skills: [],
                    avatar: ((assignment.buddyName as string) || 'AB')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase(),
                }));

                setBuddies(buddyData);
            } catch (error: any) {
                console.error('Error fetching buddy assignments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading buddy assignments...</p>
                </div>
            </div>
        );
    }

    if (buddies.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">No Buddy Assignments</h3>
                    <p className="text-sm text-silver-mist">Buddy assignments will appear here once new hires are paired with mentors.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-indigo-500" />
                        Buddy Assignment
                    </h1>
                    <p className="text-slate-500 text-sm">Assign a mentor to guide new hires through their first month.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter Skills
                    </button>
                </div>
            </div>

            {/* Current Assignment Status */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Shield className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-lg text-amber-900 dark:text-amber-100">Buddy Assignments</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">{buddies.length} active buddy assignment{buddies.length !== 1 ? 's' : ''} found.</p>
                </div>
                <button className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 dark:shadow-none transition-transform active:scale-95">
                    Assign Now
                </button>
            </div>

            {/* Buddy Recommendations */}
            <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-500" /> Assigned Buddies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {buddies.map(buddy => (
                        <div key={buddy.id}
                            onClick={() => setSelectedBuddy(buddy.id)}
                            className={`group relative bg-white dark:bg-slate-900 rounded-2xl border p-6 transition-all cursor-pointer hover:shadow-lg ${selectedBuddy === buddy.id ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200'}`}
                        >
                            {selectedBuddy === buddy.id && (
                                <div className="absolute top-4 right-4 text-indigo-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {buddy.avatar}
                                </div>
                                <div>
                                    <div className="font-bold text-lg">{buddy.name}</div>
                                    <div className="text-xs text-slate-500">{buddy.role}</div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Department</span>
                                    <span className="font-medium">{buddy.dept}</span>
                                </div>
                                {buddy.exp && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Experience</span>
                                        <span className="font-medium">{buddy.exp}</span>
                                    </div>
                                )}
                                {buddy.rating > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Feedback Rating</span>
                                        <div className="flex items-center gap-1 font-bold text-emerald-600">
                                            <Smile className="w-4 h-4" /> {buddy.rating}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {buddy.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {buddy.skills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <button className={`w-full py-2.5 rounded-xl font-bold transition-colors ${selectedBuddy === buddy.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                {selectedBuddy === buddy.id ? 'Selected' : 'Select Buddy'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                <Award className="w-6 h-6 text-indigo-500 shrink-0" />
                <div>
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Why Assign a Buddy?</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed mb-4">
                        Buddies help new hires navigate the company culture, answer informal questions, and feel welcomed.
                        Research shows that structured buddy programs improve new hire retention by over 40%.
                    </p>
                    <button className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">Download Buddy Guidelines PDF</button>
                </div>
            </div>
        </div>
    );
}

