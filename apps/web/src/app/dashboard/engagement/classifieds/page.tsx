"use client";

import React, { useState } from 'react';
import {
    ShoppingBag,
    Search,
    Filter,
    Plus,
    MessageCircle,
    Heart,
    DollarSign,
    Tag,
    MapPin,
    Image as ImageIcon,
    X,
    CheckCircle2,
    Clock,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles', 'Fashion', 'Books', 'Other'];

const ITEMS = [
    {
        id: 1,
        title: 'iPhone 13 Pro - 128GB',
        price: 550,
        currency: '$',
        category: 'Electronics',
        condition: 'Like New',
        seller: 'Sarah J.',
        department: 'Finance',
        posted: '2 hours ago',
        image: '📱',
        color: 'bg-slate-100',
        description: 'Upgrading to the new model. Used for 1 year, battery health 92%. Comes with box and cable.'
    },
    {
        id: 2,
        title: 'IKEA Standing Desk',
        price: 120,
        currency: '$',
        category: 'Furniture',
        condition: 'Good',
        seller: 'Mike R.',
        department: 'Engineering',
        posted: 'Yesterday',
        image: '🪑',
        color: 'bg-amber-50',
        description: 'White stain oak effect, 160x80 cm. Fully functional electric height adjustment.'
    },
    {
        id: 3,
        title: 'Trek Mountain Bike',
        price: 350,
        currency: '$',
        category: 'Vehicles',
        condition: 'Used',
        seller: 'David K.',
        department: 'Marketing',
        posted: '3 days ago',
        image: '🚲',
        color: 'bg-emerald-50',
        description: 'Marlin 5, size M. Recently serviced brakes and gears. Great for weekend trails.'
    },
    {
        id: 4,
        title: 'Sony WH-1000XM4',
        price: 180,
        currency: '$',
        category: 'Electronics',
        condition: 'Like New',
        seller: 'Jessica W.',
        department: 'HR',
        posted: '4 hours ago',
        image: '🎧',
        color: 'bg-neutral-100',
        description: 'Noise cancelling headphones. Barely used, pristine condition.'
    },
    {
        id: 5,
        title: 'Espresso Machine',
        price: 80,
        currency: '$',
        category: 'Home',
        condition: 'Fair',
        seller: 'Tom H.',
        department: 'Sales',
        posted: '1 week ago',
        image: '☕',
        color: 'bg-orange-50',
        description: 'DeLonghi Dedica style. Works perfectly but needs a bit of descaling.'
    }
];

export default function ClassifiedsPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [likedItems, setLikedItems] = useState<number[]>([]);

    const toggleLike = (id: number) => {
        if (likedItems.includes(id)) {
            setLikedItems(likedItems.filter(i => i !== id));
        } else {
            setLikedItems([...likedItems, id]);
        }
    };

    const filteredItems = ITEMS.filter(item =>
        (selectedCategory === 'All' || item.category === selectedCategory) &&
        (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-indigo-500" />
                        Classifieds
                    </h1>
                    <p className="text-silver-mist text-sm">Buy, sell, and trade within the company network.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPostModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Post Ad
                    </button>
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-ink-black dark:text-pearl">My Listings (0)</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left side - Filters & Grid */}
                <div className="lg:col-span-4 flex flex-col h-full overflow-hidden space-y-6">
                    {/* Tabs & Search */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border
                                        ${selectedCategory === cat
                                            ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                    `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search listings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-stellar-blue border border-cloud dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors shadow-sm"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
                        {filteredItems.map(item => (
                            <div key={item.id} className="bg-white dark:bg-stellar-blue p-4 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
                                {/* Image Area */}
                                <div className={`w-full aspect-square ${item.color} rounded-xl mb-4 flex items-center justify-center text-7xl shadow-inner relative`}>
                                    {item.image}
                                    <button
                                        onClick={() => toggleLike(item.id)}
                                        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm hover:scale-110 transition-transform"
                                    >
                                        <Heart className={`w-4 h-4 ${likedItems.includes(item.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-ink-black dark:text-pearl text-lg leading-tight line-clamp-1" title={item.title}>{item.title}</h3>
                                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                            {item.currency}{item.price}
                                        </div>
                                    </div>

                                    <p className="text-xs text-silver-mist line-clamp-2 mb-4 flex-1">
                                        {item.description}
                                    </p>

                                    <div className="border-t border-cloud dark:border-slate-800 pt-3 mt-auto space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold">
                                                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                                                    {item.seller.charAt(0)}
                                                </div>
                                                {item.seller}
                                            </div>
                                            <span className="text-silver-mist">{item.posted}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                                                {item.condition}
                                            </span>
                                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full mt-4 py-2 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4" /> Contact Seller
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Post Ad Modal */}
            <AnimatePresence>
                {showPostModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-stellar-blue w-full max-w-lg rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowPostModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">Sell an Item</h2>
                            <p className="text-sm text-silver-mist mb-6">Create a listing to reach colleagues across the company.</p>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0">
                                        <ImageIcon className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold">Add Photo</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 mb-1 block">Title</label>
                                            <input type="text" placeholder="e.g., Mechanical Keyboard" className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Price ($)</label>
                                                <input type="number" placeholder="0.00" className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-slate-500 mb-1 block">Condition</label>
                                                <select className="w-full p-2.5 rounded-lg border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                                    <option>New</option>
                                                    <option>Like New</option>
                                                    <option>Good</option>
                                                    <option>Fair</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                                    <select className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                                    <textarea rows={3} placeholder="Describe the item condition, specs, etc." className="w-full p-3 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"></textarea>
                                </div>

                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                                    </div>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-300">
                                        Your listing will be visible to all employees. Please ensure items comply with workplace policy.
                                    </p>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Publish Listing
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
