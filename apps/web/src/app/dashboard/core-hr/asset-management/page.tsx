"use client";

import React, { useState, useEffect } from 'react';
import {
    Monitor,
    Smartphone,
    Plus,
    Filter,
    MoreVertical,
    Check,
    X,
    Laptop,
    Mouse
} from 'lucide-react';
import { AssetService } from '../services';

export default function AssetManagementPage() {
    const [showModal, setShowModal] = useState(false);
    const [assetsData, setAssetsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const data = await AssetService.getAllAssets();
            setAssetsData(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    // Mock Data
    const assets = [
        { id: 'AST-001', name: 'MacBook Pro 16"', type: 'Laptop', user: 'Alice Cooper', status: 'Assigned', icon: Laptop },
        { id: 'AST-002', name: 'Dell UltraSharp 27"', type: 'Monitor', user: 'Bob Marley', status: 'Assigned', icon: Monitor },
        { id: 'AST-003', name: 'iPhone 14 Pro', type: 'Mobile', user: 'Charlie Puth', status: 'In Repair', icon: Smartphone },
        { id: 'AST-004', name: 'Logitech MX Master', type: 'Peripheral', user: 'Unassigned', status: 'Available', icon: Mouse },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Monitor className="w-6 h-6 text-indigo-500" />
                        Asset Management
                    </h1>
                    <p className="text-slate-500 text-sm">Track and manage company assets assigned to employees.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Add Asset
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {assets.map((asset) => (
                    <div key={asset.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col hover:shadow-xl transition-all duration-300 relative group hover:-translate-y-1">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4
                            ${asset.type === 'Laptop' ? 'bg-indigo-100 text-indigo-600' :
                                asset.type === 'Monitor' ? 'bg-blue-100 text-blue-600' :
                                    asset.type === 'Mobile' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}
                         `}>
                            <asset.icon className="w-6 h-6" />
                        </div>

                        <h3 className="font-bold text-lg truncate w-full" title={asset.name}>{asset.name}</h3>
                        <div className="text-xs text-slate-400 font-mono mb-4">{asset.id}</div>

                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned To</span>
                                <span className="text-sm font-bold">{asset.user}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold
                                ${asset.status === 'Assigned' ? 'bg-emerald-100 text-emerald-600' :
                                    asset.status === 'Available' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}
                             `}>
                                {asset.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Asset Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Asset</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Asset Name / Model</label>
                                <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. MacBook Pro M3" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Type</label>
                                    <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option>Laptop</option>
                                        <option>Monitor</option>
                                        <option>Mobile</option>
                                        <option>Accessory</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Serial Number</label>
                                    <input type="text" className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Assign To (Optional)</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option>Unassigned</option>
                                    <option>Alice Cooper</option>
                                    <option>Bob Marley</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={() => {
                                    alert('Asset Added!');
                                    setShowModal(false);
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Add Asset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
