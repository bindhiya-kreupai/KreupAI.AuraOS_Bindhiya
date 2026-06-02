"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Layout,
    Eye,
    EyeOff,
    Smartphone,
    GitMerge,
    Phone,
    Mail,
    MapPin,
    Loader2
} from 'lucide-react';
import { MobileProfileService } from '../services';

export default function TeamViewPage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await MobileProfileService.getProfile();
                setProfile(data as any);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 min-h-screen text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-500" />
                        Team View
                    </h1>
                    <p className="text-slate-500 text-sm">Configure how the "My Team" directory appears on mobile devices.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                    Update Team Layout
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Controls */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Visible Fields */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5 text-indigo-500" /> Visible Contact Details
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">Select which employee information is visible to team members.</p>

                        <div className="space-y-3">
                            {[
                                { name: 'Full Name', visible: true, locked: true },
                                { name: 'Job Title / Designation', visible: true, locked: true },
                                { name: 'Profile Picture', visible: true, locked: false },
                                { name: 'Work Phone Number', visible: true, locked: false },
                                { name: 'Work Email Address', visible: true, locked: false },
                                { name: 'Department', visible: true, locked: false },
                                { name: 'Reporting Manager', visible: true, locked: false },
                                { name: 'Work Location / Desk ID', visible: false, locked: false },
                                { name: 'Online Status', visible: true, locked: false },
                                { name: 'Local Timezone', visible: false, locked: false },
                            ].map((field, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{field.name}</span>
                                    <div className="flex items-center gap-3">
                                        {field.locked && <span className="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">MANDATORY</span>}
                                        <label className={`relative inline-flex items-center ${field.locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                            <input type="checkbox" className="sr-only peer" defaultChecked={field.visible} disabled={field.locked} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Org Chart Settings */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <GitMerge className="w-5 h-5 text-amber-500" /> Structure Visualization
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { name: 'List View', desc: 'Simple directory list', icon: Layout, active: false },
                                { name: 'Org Chart', desc: 'Hierarchy tree view', icon: GitMerge, active: true },
                                { name: 'Grid View', desc: 'Photo cards', icon: Users, active: false },
                            ].map((opt, i) => (
                                <div key={i} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-3 cursor-pointer transition-all ${opt.active ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700'}`}>
                                    <opt.icon className="w-6 h-6" />
                                    <div>
                                        <div className="font-bold text-sm">{opt.name}</div>
                                        <div className="text-xs opacity-70">{opt.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mobile Preview */}
                <div className="flex justify-center pt-8">
                    <div className="bg-slate-900 border-[8px] border-slate-950 w-[280px] h-[550px] rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-b-xl z-20"></div>

                        {/* Screen Content */}
                        <div className="bg-slate-50 w-full h-full pt-8 flex flex-col">
                            <div className="px-4 py-2 bg-white pb-4 border-b border-slate-200">
                                <h4 className="text-lg font-bold text-slate-800">My Team</h4>
                                <div className="text-xs text-slate-500">Engineering Dept • 12 Members</div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                                {[
                                    { name: 'Sarah Connor', role: 'Engineering Manager', img: 'SC' },
                                    { name: 'John Doe', role: 'Senior Developer', img: 'JD' },
                                    { name: 'Mike Ross', role: 'Frontend Dev', img: 'MR' },
                                    { name: 'Emma Stone', role: 'QA Engineer', img: 'ES' },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {p.img}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                            <div className="text-[10px] text-slate-500">{p.role}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                                                <Phone className="w-3 h-3 text-indigo-600" />
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
                                                <Mail className="w-3 h-3 text-indigo-600" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

