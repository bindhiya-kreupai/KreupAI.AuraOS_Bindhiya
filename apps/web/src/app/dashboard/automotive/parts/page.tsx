"use client";

import React from 'react';
import {
    Package,
    ShoppingCart,
    Clipboard,
    Archive,
    Search,
    AlertTriangle
} from 'lucide-react';

export default function PartsPage() {
    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-500" />
                        Parts Inventory Management
                    </h1>
                    <p className="text-slate-500 text-sm">Stock levels, reordering roster, and technician requisitions.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-800/30">
                    <ShoppingCart className="w-4 h-4" /> 12 Pending Orders
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0">
                {/* Inventory List */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pb-20">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-2 flex gap-3 items-center">
                        <Search className="w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search by Part # or Name..." className="bg-transparent outline-none flex-1 text-sm font-bold" />
                    </div>

                    {[
                        { part: 'Oil Filter (XG7317)', cat: 'Consumables', stock: '45', min: '20', location: 'Aisle 1-B', status: 'OK' },
                        { part: 'Brake Pads (Front)', cat: 'Brakes', stock: '12', min: '15', location: 'Aisle 2-C', status: 'Low' },
                        { part: 'Spark Plug (Iridium)', cat: 'Ignition', stock: '8', min: '40', location: 'Aisle 1-A', status: 'Critical' },
                        { part: 'Alternator (Reman)', cat: 'Electrical', stock: '2', min: '2', location: 'Shelf 4', status: 'OK' },
                        { part: 'Cabin Air Filter', cat: 'Consumables', stock: '22', min: '10', location: 'Aisle 1-B', status: 'OK' },
                    ].map((p, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                    <Archive className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{p.part}</h3>
                                    <div className="text-xs text-slate-500 font-bold mb-1">{p.cat} • {p.location}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{p.stock}</div>
                                    <div className="text-xs text-slate-400">In Stock</div>
                                </div>

                                <div className="flex flex-col items-end gap-2 w-24">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase w-full text-center
                                        ${p.status === 'OK' ? 'bg-emerald-100 text-emerald-600' :
                                            p.status === 'Low' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600 animate-pulse'}
                                    `}>
                                        {p.status}
                                    </span>
                                    {p.status !== 'OK' && (
                                        <button className="text-xs font-bold text-indigo-500 hover:underline">Order Now</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Staff Duties */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Clipboard className="w-5 h-5 text-indigo-500" /> Pending Requisitions
                        </h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">Mike Ross (Bay 1)</h4>
                                    <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold">Urgent</span>
                                </div>
                                <p className="text-xs text-slate-500">Full Synthetic 5W-30 (5qts) + Filter</p>
                                <button className="mt-2 w-full py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">Issue Parts</button>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm">Sarah Lance (Bay 2)</h4>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">Standard</span>
                                </div>
                                <p className="text-xs text-slate-500">Brake Pads (Ceramic) - Rear Set</p>
                                <button className="mt-2 w-full py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600">Issue Parts</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-6 flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Stock Discrepancy</h3>
                            <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                                Monthly count shows -4 Oil Filters. Audit required by EOD.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

