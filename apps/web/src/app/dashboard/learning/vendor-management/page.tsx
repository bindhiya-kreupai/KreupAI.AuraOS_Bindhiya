"use client";

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Star,
    Phone,
    Mail
} from 'lucide-react';
import { ExternalTrainingService } from '../services';

export default function VendorManagementPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await ExternalTrainingService.getExternalTraining();
                setData(result);
            } catch (error) {
                console.error('Error fetching vendor data:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Vendor Management
                    </h1>
                    <p className="text-slate-500 text-sm">Manage relationships with external training providers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { name: 'Global Training Solutions', specialty: 'Leadership & Soft Skills', rating: 4.8, contact: 'jane@gts.com' },
                    { name: 'TechEd Pro', specialty: 'Technical Workshops', rating: 4.2, contact: 'info@teched.com' },
                    { name: 'SafeWork Compliance', specialty: 'Health & Safety', rating: 4.9, contact: 'support@safework.com' },
                ].map((vendor, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg w-2/3">{vendor.name}</h3>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                <Star className="w-3 h-3 fill-current" /> {vendor.rating}
                            </div>
                        </div>
                        <p className="text-sm font-bold text-indigo-600 mb-6">{vendor.specialty}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="w-4 h-4" /> {vendor.contact}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Phone className="w-4 h-4" /> (555) 123-4567
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200">History</button>
                            <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Contract</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
