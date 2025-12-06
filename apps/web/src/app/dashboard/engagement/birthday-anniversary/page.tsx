"use client";

import React from 'react';
import {
    Cake,
    Gift,
    Send,
    PartyPopper,
    Calendar
} from 'lucide-react';

export default function BirthdayAnniversaryPage() {
    const celebrations = [
        { name: 'Alex Morgan', type: 'Birthday', date: 'Today', img: 'https://i.pravatar.cc/150?u=alex', role: 'Product Designer' },
        { name: 'Sarah Connor', type: 'Workiversary', date: 'Tomorrow', years: 5, img: 'https://i.pravatar.cc/150?u=sarah', role: 'Head of Product' },
        { name: 'Kyle Reese', type: 'Birthday', date: 'Dec 10', img: 'https://i.pravatar.cc/150?u=kyle', role: 'Senior Developer' },
    ];

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <PartyPopper className="w-6 h-6 text-pink-500" />
                        Celebrations
                    </h1>
                    <p className="text-slate-500 text-sm">Wish your colleagues on their special days.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {celebrations.map((person, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center hover:shadow-xl transition-all relative overflow-hidden group">
                        {/* Confetti Background Effect */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-pink-50 to-transparent dark:from-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative mb-4">
                            <div className={`w-24 h-24 rounded-full p-1 ${person.type === 'Birthday' ? 'bg-gradient-to-tr from-pink-500 to-rose-500' : 'bg-gradient-to-tr from-amber-400 to-orange-500'}`}>
                                <img src={person.img} alt={person.name} className="w-full h-full rounded-full object-cover border-4 border-white dark:border-slate-900" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg">
                                {person.type === 'Birthday' ? <Cake className="w-5 h-5 text-pink-500" /> : <Gift className="w-5 h-5 text-amber-500" />}
                            </div>
                        </div>

                        <h3 className="font-bold text-lg">{person.name}</h3>
                        <p className="text-sm text-slate-500 mb-1">{person.role}</p>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full mb-6 ${person.type === 'Birthday' ? 'bg-pink-100 text-pink-700' : 'bg-amber-100 text-amber-700'}`}>
                            {person.type === 'Workiversary' ? `${person.years} Year Anniversary` : 'Happy Birthday!'}
                        </div>

                        <div className="w-full space-y-2">
                            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <input type="text" placeholder="Type a wish..." className="bg-transparent outline-none flex-1 text-sm pl-2" />
                                <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Upcoming List */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-indigo-900 rounded-2xl p-8 text-white flex md:items-center justify-between shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-2xl mb-2">Upcoming Celebrations</h3>
                        <p className="text-indigo-200 max-w-xl">Don't miss out! There are <span className="font-bold text-white">12 more birthdays</span> and <span className="font-bold text-white">5 work anniversaries</span> coming up this month.</p>
                        <button className="mt-6 px-6 py-2 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> View Full Calendar
                        </button>
                    </div>
                    <PartyPopper className="absolute right-0 bottom-0 w-64 h-64 text-indigo-800 opacity-20 transform rotate-12 translate-x-10 translate-y-10" />
                </div>
            </div>
        </div>
    );
}
