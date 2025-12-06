"use client";

import React, { useState } from 'react';
import {
    Phone,
    Plus,
    Ambulance,
    ShieldAlert,
    Flame
} from 'lucide-react';

export default function EmergencyContactsPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Phone className="w-6 h-6 text-rose-500" />
                        Emergency Contacts
                    </h1>
                    <p className="text-slate-500 text-sm">Vital numbers for immediate assistance.</p>
                </div>
                <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Add Personal Contact
                </button>
            </div>

            {/* Quick Dial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Ambulance', number: '911', icon: Ambulance, color: 'bg-rose-500' },
                    { label: 'Fire Department', number: '911', icon: Flame, color: 'bg-orange-500' },
                    { label: 'Police', number: '911', icon: ShieldAlert, color: 'bg-blue-600' },
                ].map((item, i) => (
                    <div key={i} className={`${item.color} rounded-2xl p-6 text-white shadow-lg flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity`}>
                        <div>
                            <h3 className="font-bold text-lg">{item.label}</h3>
                            <p className="text-2xl font-black">{item.number}</p>
                        </div>
                        <item.icon className="w-10 h-10 opacity-80" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workplace Contacts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Workplace Safety Officers</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'John Doe', role: 'Chief Safety Officer', phone: '+1 (555) 012-3456' },
                            { name: 'Jane Smith', role: 'Floor Warden (L3)', phone: '+1 (555) 012-7890' },
                        ].map((contact, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-sm">{contact.name}</h4>
                                    <div className="text-xs text-slate-500">{contact.role}</div>
                                </div>
                                <a href={`tel:${contact.phone}`} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personal Contacts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">My Emergency Contacts</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Sarah Connor', relation: 'Spouse', phone: '+1 (555) 999-8888' },
                            { name: 'Dr. Silberman', relation: 'Doctor', phone: '+1 (555) 111-2222' },
                        ].map((contact, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-sm">{contact.name}</h4>
                                    <div className="text-xs text-slate-500">{contact.relation}</div>
                                </div>
                                <a href={`tel:${contact.phone}`} className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors">
                                    <Phone className="w-4 h-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
