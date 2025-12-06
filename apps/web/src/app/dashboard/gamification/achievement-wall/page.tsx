"use client";

import React, { useState } from 'react';
import {
    LayoutGrid,
    Search,
    Share2,
    Trophy
} from 'lucide-react';

export default function AchievementWallPage() {
    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <LayoutGrid className="w-6 h-6 text-indigo-500" />
                        Achievement Wall
                    </h1>
                    <p className="text-slate-500 text-sm">A public showcase of your proudest moments.</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
                {/* Large Featured Item */}
                <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-end">
                        <Trophy className="w-16 h-16 text-yellow-300 mb-4 drop-shadow-lg" />
                        <h3 className="text-3xl font-bold mb-2">Employee of the Year 2023</h3>
                        <p className="text-indigo-100">Awarded for outstanding contribution to the core platform architecture.</p>
                    </div>
                    <Share2 className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-110" />
                    {/* Background Noise/Image */}
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                </div>

                {/* Regular Items */}
                {[
                    { title: 'Project X Launch', date: 'Oct 2023', img: 'bg-emerald-500' },
                    { title: '5 Year Anniversary', date: 'Aug 2023', img: 'bg-amber-500' },
                    { title: 'Certified Scrum Master', date: 'Jun 2023', img: 'bg-rose-500' },
                    { title: 'Mentor of the Month', date: 'May 2023', img: 'bg-cyan-500' },
                ].map((item, i) => (
                    <div key={i} className={`rounded-3xl p-6 relative overflow-hidden group cursor-pointer ${item.img} text-white`}>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <h4 className="font-bold text-lg leading-tight mb-1">{item.title}</h4>
                            <span className="text-xs opacity-75">{item.date}</span>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <div className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors cursor-pointer">
                    <span className="text-4xl mb-2">+</span>
                    <span className="font-bold text-sm">Add Highlight</span>
                </div>
            </div>
        </div>
    );
}
