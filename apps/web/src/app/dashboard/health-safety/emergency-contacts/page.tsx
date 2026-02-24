"use client";

import React, { useState, useEffect } from 'react';
import {
    Phone,
    Plus,
    Ambulance,
    ShieldAlert,
    Flame,
    Loader2
} from 'lucide-react';
import { EmergencyService } from '../services';
import type { EmergencyContact } from '../services';

export default function EmergencyContactsPage() {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await EmergencyService.getContacts();
                setContacts(data);
            } catch {
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Separate emergency services from other contacts
    const emergencyServices = contacts.filter(c => c.type === 'emergency');
    const workplaceContacts = contacts.filter(c => c.type === 'workplace' || c.type === 'safety');
    const personalContacts = contacts.filter(c => c.type === 'personal' || c.type === 'medical');

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                {emergencyServices.length > 0 ? (
                    emergencyServices.slice(0, 3).map((item, i) => {
                        const colors = ['bg-rose-500', 'bg-orange-500', 'bg-blue-600'];
                        const icons = [Ambulance, Flame, ShieldAlert];
                        const Icon = icons[i % icons.length];
                        return (
                            <div key={item.id || i} className={`${colors[i % colors.length]} rounded-2xl p-6 text-white shadow-lg flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity`}>
                                <div>
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <p className="text-2xl font-black">{item.number}</p>
                                </div>
                                <Icon className="w-10 h-10 opacity-80" />
                            </div>
                        );
                    })
                ) : (
                    <>
                        <div className="bg-rose-500 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity">
                            <div>
                                <h3 className="font-bold text-lg">Ambulance</h3>
                                <p className="text-2xl font-black">911</p>
                            </div>
                            <Ambulance className="w-10 h-10 opacity-80" />
                        </div>
                        <div className="bg-orange-500 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity">
                            <div>
                                <h3 className="font-bold text-lg">Fire Department</h3>
                                <p className="text-2xl font-black">911</p>
                            </div>
                            <Flame className="w-10 h-10 opacity-80" />
                        </div>
                        <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity">
                            <div>
                                <h3 className="font-bold text-lg">Police</h3>
                                <p className="text-2xl font-black">911</p>
                            </div>
                            <ShieldAlert className="w-10 h-10 opacity-80" />
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Workplace Contacts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Workplace Safety Officers</h3>
                    <div className="space-y-4">
                        {workplaceContacts.length === 0 ? (
                            <div className="text-center py-4 text-slate-400 text-sm">No workplace contacts configured.</div>
                        ) : (
                            workplaceContacts.map((contact, i) => (
                                <div key={contact.id || i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-sm">{contact.name}</h4>
                                        <div className="text-xs text-slate-500">{contact.type}</div>
                                    </div>
                                    <a href={`tel:${contact.number}`} className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Personal Contacts */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">My Emergency Contacts</h3>
                    <div className="space-y-4">
                        {personalContacts.length === 0 ? (
                            <div className="text-center py-4 text-slate-400 text-sm">No personal emergency contacts set up.</div>
                        ) : (
                            personalContacts.map((contact, i) => (
                                <div key={contact.id || i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-sm">{contact.name}</h4>
                                        <div className="text-xs text-slate-500">{contact.type}</div>
                                    </div>
                                    <a href={`tel:${contact.number}`} className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center hover:bg-indigo-200 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

