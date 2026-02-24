"use client";

import React, { useState } from 'react';
import {
    Utensils,
    ShoppingCart,
    Wallet,
    Clock,
    Plus,
    Minus,
    Search,
    Filter,
    Flame,
    Leaf,
    Coffee,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const MENU_CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages'];

const MENU_ITEMS = [
    { id: 1, name: 'Grilled Chicken Salad', category: 'Lunch', price: 8.50, calories: 350, image: '🥗', type: 'Non-Veg', available: true },
    { id: 2, name: 'Veg Thali Deluxe', category: 'Lunch', price: 6.00, calories: 600, image: '🍱', type: 'Veg', available: true },
    { id: 3, name: 'Avocado Toast', category: 'Breakfast', price: 5.50, calories: 280, image: '🥑', type: 'Vegan', available: true },
    { id: 4, name: 'Cappuccino', category: 'Beverages', price: 3.00, calories: 120, image: '☕', type: 'Veg', available: true },
    { id: 5, name: 'Spicy Paneer Wrap', category: 'Snacks', price: 4.50, calories: 400, image: '🌯', type: 'Veg', available: true },
    { id: 6, name: 'Fresh Juice Mix', category: 'Beverages', price: 3.50, calories: 150, image: '🥤', type: 'Vegan', available: true },
];

const ORDER_HISTORY = [
    { id: 101, items: ['Grilled Chicken Salad', 'Cappuccino'], total: 11.50, date: 'Today, 12:30 PM', status: 'Ready' },
    { id: 102, items: ['Avocado Toast'], total: 5.50, date: 'Today, 09:15 AM', status: 'Picked Up' },
    { id: 103, items: ['Veg Thali Deluxe'], total: 6.00, date: 'Yesterday', status: 'Picked Up' },
];

export default function CanteenPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<{ id: number, qty: number }[]>([]);
    const [walletBalance, setWalletBalance] = useState(45.50);

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

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const product = MENU_ITEMS.find(p => p.id === item.id);
            return total + (product ? product.price * item.qty : 0);
        }, 0);
    };

    const filteredItems = selectedCategory === 'All'
        ? MENU_ITEMS
        : MENU_ITEMS.filter(item => item.category === selectedCategory);

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-orange-500" />
                        Cafeteria
                    </h1>
                    <p className="text-silver-mist text-sm">Pre-order meals and manage your food wallet.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-3 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-ink-black dark:text-pearl">${walletBalance.toFixed(2)}</span>
                        </div>
                        <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600">
                            + Top-up
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Menu & Categories */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                        {MENU_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors
                                    ${selectedCategory === cat
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                        : 'bg-white dark:bg-stellar-blue text-slate-500 border border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-2 pb-20">
                        {filteredItems.map(item => {
                            const inCart = cart.find(c => c.id === item.id);
                            return (
                                <div key={item.id} className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg hover:border-orange-300 transition-all group">
                                    <div className="flex gap-3">
                                        <div className="w-20 h-20 rounded-xl bg-orange-50 dark:bg-slate-800 flex items-center justify-center text-4xl shadow-inner">
                                            {item.image}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-ink-black dark:text-pearl">{item.name}</h3>
                                                <div className={`w-3 h-3 rounded-full border-2 
                                                    ${item.type === 'Non-Veg' ? 'border-rose-500 bg-rose-500/20' :
                                                        item.type === 'Vegan' ? 'border-emerald-500 bg-emerald-500/20' :
                                                            'border-emerald-500 bg-emerald-500'}
                                                `} title={item.type}></div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-silver-mist mb-3">
                                                <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {item.calories} cal</span>
                                                <span>•</span>
                                                <span className="font-bold text-slate-500">${item.price.toFixed(2)}</span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                {inCart ? (
                                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                                        <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm hover:text-rose-500"><Minus className="w-3 h-3" /></button>
                                                        <span className="text-sm font-bold w-4 text-center">{inCart.qty}</span>
                                                        <button onClick={() => addToCart(item.id)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm hover:text-emerald-500"><Plus className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(item.id)}
                                                        className="px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors flex items-center gap-1"
                                                    >
                                                        Add to Tray
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

                {/* Right: Cart & History */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* Cart Widget */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex flex-col max-h-[50%]">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-orange-500" /> Your Tray
                        </h3>

                        {cart.length > 0 ? (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                                    {cart.map(cartItem => {
                                        const item = MENU_ITEMS.find(i => i.id === cartItem.id);
                                        if (!item) return null;
                                        return (
                                            <div key={cartItem.id} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-500">{cartItem.qty}x</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                                                </div>
                                                <span className="font-bold text-slate-700 dark:text-slate-300">${(item.price * cartItem.qty).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="pt-4 border-t border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-center text-lg font-bold mb-4">
                                        <span>Total</span>
                                        <span>${getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
                                        Checkout & Pay <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                                <div className="text-sm">Tray is empty</div>
                            </div>
                        )}
                    </div>

                    {/* Order History */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" /> Recent Orders
                            </h3>
                            <button className="text-xs font-bold text-indigo-500">View All</button>
                        </div>

                        <div className="overflow-y-auto space-y-4 pr-1">
                            {ORDER_HISTORY.map(order => (
                                <div key={order.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] text-silver-mist uppercase font-bold tracking-wide">#{order.id} • {order.date}</div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded 
                                            ${order.status === 'Ready' ? 'bg-emerald-100 text-emerald-600 animate-pulse' : 'bg-slate-200 text-slate-600'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 truncate">
                                        {order.items.join(', ')}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-bold">${order.total.toFixed(2)}</div>
                                        <button className="text-[10px] font-bold text-orange-500 hover:underline">Reorder</button>
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

