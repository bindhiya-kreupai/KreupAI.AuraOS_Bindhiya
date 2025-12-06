"use client";

import React, { useState } from 'react';
import {
    PenTool,
    ShoppingBag,
    Search,
    Filter,
    Plus,
    Minus,
    Package,
    Clock,
    CheckCircle2,
    Briefcase,
    AlertCircle,
    ChevronRight,
    Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const CATEGORIES = ['All', 'Writing', 'Desk', 'IT Peripherals', 'Paper', 'Files'];

const CATALOG_ITEMS = [
    { id: 1, name: 'Ballpoint Pen (Blue)', category: 'Writing', price: 2.50, stock: 'High', image: '🖊️', pack: 'Box of 10' },
    { id: 2, name: 'A4 Printer Paper', category: 'Paper', price: 15.00, stock: 'Medium', image: '📄', pack: '500 Sheets' },
    { id: 3, name: 'Wireless Mouse', category: 'IT Peripherals', price: 25.00, stock: 'Low', image: '🖱️', pack: 'Unit' },
    { id: 4, name: 'Sticky Notes (Yellow)', category: 'Desk', price: 3.00, stock: 'High', image: '📝', pack: 'Pack of 5' },
    { id: 5, name: 'File Folder (Clear)', category: 'Files', price: 5.00, stock: 'High', image: '📁', pack: 'Pack of 10' },
    { id: 6, name: 'Laptop Stand', category: 'Desk', price: 45.00, stock: 'Out of Stock', image: '💻', pack: 'Unit' },
];

const RECENT_REQUESTS = [
    { id: 'REQ-101', items: ['Wireless Mouse', 'A4 Printer Paper'], date: 'Today', status: 'Approved', total: 40.00 },
    { id: 'REQ-099', items: ['Laptop Stand'], date: 'Yesterday', status: 'Pending Approval', total: 45.00 },
    { id: 'REQ-085', items: ['Sticky Notes'], date: 'Last Week', status: 'Delivered', total: 3.00 },
];

const DEPT_BUDGET = {
    total: 500,
    used: 120,
    remaining: 380
};

export default function StationeryPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<{ id: number, qty: number }[]>([]);
    const [showRequestModal, setShowRequestModal] = useState(false);

    const addToCart = (id: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === id);
            if (existing) {
                return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { id, qty: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === id);
            if (existing && existing.qty > 1) {
                return prev.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item);
            }
            return prev.filter(item => item.id !== id);
        });
    };

    const cartTotal = cart.reduce((acc, item) => {
        const product = CATALOG_ITEMS.find(p => p.id === item.id);
        return acc + (product ? product.price * item.qty : 0);
    }, 0);

    const filteredItems = selectedCategory === 'All'
        ? CATALOG_ITEMS
        : CATALOG_ITEMS.filter(item => item.category === selectedCategory);

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-indigo-500" />
                        Stationery Requests
                    </h1>
                    <p className="text-silver-mist text-sm">Order office supplies and track department usage.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-3 shadow-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-silver-mist">Budget Left</span>
                            <span className="text-lg font-bold text-emerald-500">${DEPT_BUDGET.remaining}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Catalog */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Search & Categories */}
                    <div className="flex flex-col gap-4 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search supplies..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border
                                        ${selectedCategory === cat
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-20">
                        {filteredItems.map(item => {
                            const inCart = cart.find(c => c.id === item.id);
                            return (
                                <div key={item.id} className="bg-white dark:bg-stellar-blue p-4 rounded-xl border border-cloud dark:border-nebula-purple/50 hover:shadow-md transition-all group relative">
                                    {item.stock === 'Out of Stock' && (
                                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                            <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold transform -rotate-12 shadow-lg">Out of Stock</span>
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner shrink-0">
                                            {item.image}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-ink-black dark:text-pearl truncate text-sm">{item.name}</h3>
                                                <span className="text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">${item.price}</span>
                                            </div>
                                            <div className="text-xs text-silver-mist mb-3 flex items-center gap-2">
                                                <span>{item.pack}</span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.stock === 'High' ? 'bg-emerald-500' : item.stock === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                                <span className="text-[10px]">{item.stock} Stock</span>
                                            </div>

                                            <div className="flex justify-end">
                                                {inCart ? (
                                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                                                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm hover:text-rose-500"><Minus className="w-3 h-3" /></button>
                                                        <span className="text-xs font-bold w-3 text-center">{inCart.qty}</span>
                                                        <button onClick={() => addToCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm hover:text-emerald-500"><Plus className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(item.id)}
                                                        disabled={item.stock === 'Out of Stock'}
                                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Cart & Requests */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* Cart Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col max-h-[50%]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-indigo-500" /> Request Cart
                            </h3>
                            <span className="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full">{cart.length}</span>
                        </div>

                        {cart.length > 0 ? (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                                    {cart.map(cartItem => {
                                        const item = CATALOG_ITEMS.find(i => i.id === cartItem.id);
                                        if (!item) return null;
                                        return (
                                            <div key={cartItem.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-cloud dark:border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-xs">{item.image}</div>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</div>
                                                        <div className="text-[10px] text-silver-mist">Qty: {cartItem.qty}</div>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">${(item.price * cartItem.qty).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="pt-4 border-t border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-center text-sm font-bold mb-4">
                                        <span>Total Request</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 text-sm transition-transform active:scale-95">
                                        Submit Request
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Package className="w-12 h-12 mb-2 opacity-20" />
                                <div className="text-xs">Add items to request</div>
                            </div>
                        )}
                    </div>

                    {/* Recent Requests */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Track Requests
                            </h3>
                        </div>

                        <div className="overflow-y-auto space-y-3 pr-1">
                            {RECENT_REQUESTS.map(req => (
                                <div key={req.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] text-silver-mist uppercase font-bold tracking-wide">{req.id} • {req.date}</div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase
                                            ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                                                req.status === 'Delivered' ? 'bg-indigo-100 text-indigo-600' :
                                                    'bg-amber-100 text-amber-600'}
                                        `}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 truncate">
                                        {req.items.join(', ')}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                        {req.status === 'Pending Approval' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                        <span>
                                            {req.status === 'Pending Approval' ? 'Awaiting Manager' :
                                                req.status === 'Delivered' ? 'Received at Desk' : 'Processing'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
