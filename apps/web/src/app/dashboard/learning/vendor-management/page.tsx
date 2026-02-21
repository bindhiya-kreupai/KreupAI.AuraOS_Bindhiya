"use client";

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Star,
    Phone,
    Mail,
    Loader2
} from 'lucide-react';
import { CourseService } from '../services';

export default function VendorManagementPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await CourseService.getCourses();
                setData(result);
            } catch (error) {
                console.error('Error:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const instructors = Array.from(
        new Map(
            data
                .filter((c) => c.instructor)
                .map((c) => [c.instructor, { name: c.instructor, category: c.category, rating: c.rating }])
        ).values()
    );

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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : instructors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Briefcase className="w-12 h-12 mb-4 opacity-30" />
                    <p className="font-bold">No vendors found</p>
                    <p className="text-sm">Training vendor information will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {instructors.map((vendor: any, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-lg w-2/3">{vendor.name}</h3>
                                {vendor.rating && (
                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                        <Star className="w-3 h-3 fill-current" /> {vendor.rating}
                                    </div>
                                )}
                            </div>
                            <p className="text-sm font-bold text-indigo-600 mb-6">{vendor.category || 'Training Provider'}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Mail className="w-4 h-4" /> Contact via platform
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Phone className="w-4 h-4" /> Available on request
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold hover:bg-slate-200">History</button>
                                <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Contract</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
