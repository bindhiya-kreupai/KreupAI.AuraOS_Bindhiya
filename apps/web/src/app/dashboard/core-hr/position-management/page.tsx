"use client";

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Users,
    Plus,
    X,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import { PositionService } from '../services';

export default function PositionManagementPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [positionsData, setPositionsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPositions();
    }, []);

    const fetchPositions = async () => {
        try {
            const data = await PositionService.getAllPositions();
            setPositionsData(data);
        } catch {
                    } finally {
            setLoading(false);
        }
    };

    const positions = [
        { id: 'POS-ENG-001', title: 'Senior Backend Engineer', dept: 'Engineering', manager: 'Marcus Chen', fte: 1.0, status: 'Filled' },
        { id: 'POS-MKT-042', title: 'Content Specialist', dept: 'Marketing', manager: 'Charlie Puth', fte: 1.0, status: 'Open' },
        { id: 'POS-DES-012', title: 'Product Designer', dept: 'Design', manager: 'Alice Cooper', fte: 1.0, status: 'Open' },
        { id: 'POS-HR-005', title: 'Recruiter', dept: 'People Ops', manager: 'Sarah Williams', fte: 0.5, status: 'Filled' },
        { id: 'POS-SAL-008', title: 'Sales Executive', dept: 'Sales', manager: 'David Miller', fte: 1.0, status: 'Frozen' },
    ];

    const filteredPositions = positions.filter(p => filterStatus === 'All' || p.status === filterStatus);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-500" />
                        Position Management
                    </h1>
                    <p className="text-slate-500 text-sm">Design, track, and manage job positions and vacancies.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Create Position
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Stats */}
                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Positions</div>
                        <div className="text-2xl font-bold">142</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Filled</div>
                        <div className="text-2xl font-bold text-emerald-600">128</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Open Vacancies</div>
                        <div className="text-2xl font-bold text-indigo-600">14</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Frozen</div>
                        <div className="text-2xl font-bold text-slate-400">5</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="lg:col-span-4 flex gap-2 overflow-x-auto pb-1">
                    {['All', 'Open', 'Filled', 'Frozen'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === status
                                    ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Position ID</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Reports To</th>
                                    <th className="px-6 py-4">FTE</th>
                                    <th className="px-6 py-4 center">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredPositions.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.title}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.dept}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.manager}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{row.fte}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                ${row.status === 'Filled' ? 'bg-emerald-100 text-emerald-700'
                                                    : row.status === 'Open' ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }
                                            `}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredPositions.length === 0 && (
                        <div className="p-8 text-center text-slate-500 italic">
                            No positions found for this filter.
                        </div>
                    )}
                </div>
            </div>

            {/* Create Position Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Create New Position</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Position Title</label>
                                <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Data Scientist" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
                                    <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Engineering</option>
                                        <option>Product</option>
                                        <option>Design</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Reports To</label>
                                    <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Marcus Chen</option>
                                        <option>Sarah Williams</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Number of Openings</label>
                                <input type="number" defaultValue={1} className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Position Created!');
                                    setShowCreateModal(false);
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Create Position
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
