"use client";

import React, { useState } from 'react';
import {
    Package,
    AlertTriangle,
    Search,
    Truck
} from 'lucide-react';

export default function PartsInventoryPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-indigo-500" />
                        Parts Inventory
                    </h1>
                    <p className="text-slate-500 text-sm">Monitor stock levels and reorder alerts.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search part number..."
                        className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="font-bold text-lg mb-4">Stock Overview</h3>
                    <div className="space-y-4">
                        {[
                            { part: 'Oil Filter (XG-12)', sku: 'OF-9921', stock: 145, min: 50, status: 'Healthy' },
                            { part: 'Brake Pads (Ceramic)', sku: 'BP-8842', stock: 12, min: 20, status: 'Low Stock' },
                            { part: 'Spark Plug (Iridium)', sku: 'SP-1102', stock: 85, min: 40, status: 'Healthy' },
                            { part: 'Alternator (120A)', sku: 'AL-3321', stock: 2, min: 5, status: 'Critical' },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.part}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-1">SKU: {item.sku}</div>
                                </div>
                                <div className="flex items-center gap-6 mt-2 md:mt-0">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Stock</div>
                                        <div className="font-bold">{item.stock} / {item.min}</div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold w-24 text-center ${item.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' :
                                            item.status === 'Low Stock' ? 'bg-amber-100 text-amber-600' :
                                                'bg-rose-100 text-rose-600'
                                        }`}>{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-amber-800 dark:text-amber-200">Reorder Required</h3>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">4 items are below minimum stock levels. Immediate action recommended.</p>
                        <button className="w-full py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600">Create PO</button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Incoming Deliveries</h3>
                            <Truck className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="text-sm">
                                <div className="font-bold">PO #8821 - Bosch</div>
                                <div className="text-slate-500">Arriving Today • 14 Items</div>
                            </div>
                            <div className="text-sm">
                                <div className="font-bold">PO #8824 - OEM Parts</div>
                                <div className="text-slate-500">Arriving Tomorrow • 5 Items</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
