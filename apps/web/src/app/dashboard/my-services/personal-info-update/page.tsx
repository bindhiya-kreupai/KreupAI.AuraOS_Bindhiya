"use client";

import React, { useState } from 'react';
import {
    User,
    Phone,
    MapPin,
    Mail,
    Save,
    Camera,
    Shield
} from 'lucide-react';

export default function PersonalInfoPage() {
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Changes saved successfully!");
        }, 1500);
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <User className="w-6 h-6 text-indigo-500" />
                        My Profile
                    </h1>
                    <p className="text-slate-500 text-sm">Update your personal details and contact information.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center shadow-sm h-fit">
                    <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 relative group cursor-pointer overflow-hidden">
                        <img src="https://i.pravatar.cc/300" alt="Profile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold">Alex Morgan</h2>
                    <p className="text-slate-500">Senior Product Designer</p>
                    <div className="mt-4 flex gap-2 w-full">
                        <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                            <div className="text-xs text-indigo-500 font-bold uppercase">Emp ID</div>
                            <div className="font-bold text-indigo-700 dark:text-indigo-300">EMP-042</div>
                        </div>
                        <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                            <div className="text-xs text-emerald-500 font-bold uppercase">Status</div>
                            <div className="font-bold text-emerald-700 dark:text-emerald-300">Active</div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Details */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-indigo-500" /> Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Personal Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input type="email" defaultValue="alex.morgan@gmail.com" className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input type="tel" defaultValue="+1 (555) 012-3456" className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Current Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <textarea defaultValue="123 Innovation Drive, Tech Valley, CA 94043" rows={2} className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all resize-none"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-rose-500" /> Emergency Contact
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Contact Name</label>
                                <input type="text" defaultValue="Sarah Morgan" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Relationship</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all">
                                    <option>Spouse</option>
                                    <option>Parent</option>
                                    <option>Sibling</option>
                                    <option>Friend</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                                <input type="tel" defaultValue="+1 (555) 987-6543" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
