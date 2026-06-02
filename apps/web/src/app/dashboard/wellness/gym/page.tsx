"use client";

import React, { useState, useEffect } from 'react';
import {
    Dumbbell,
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle2,
    Flame,
    Heart,
    Zap,
    Users,
    ChevronRight,
    Star,
    Loader2
} from 'lucide-react';
import { GymMembershipService } from '../services';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const CLASSES = [
    {
        id: 1,
        title: 'Morning Yoga Flow',
        trainer: 'Sara Jenkins',
        time: '07:00 AM - 08:00 AM',
        type: 'Mindfulness',
        intensity: 'Low',
        spotsTotal: 15,
        spotsBooked: 12,
        image: '🧘‍♀️',
        color: 'bg-emerald-500'
    },
    {
        id: 2,
        title: 'HIIT Blast',
        trainer: 'Mike "The Rock"',
        time: '06:00 PM - 07:00 PM',
        type: 'Cardio',
        intensity: 'High',
        spotsTotal: 20,
        spotsBooked: 18,
        image: '🏃‍♂️',
        color: 'bg-rose-500'
    },
    {
        id: 3,
        title: 'Power Lifting 101',
        trainer: 'Alex Strong',
        time: '05:30 PM - 06:30 PM',
        type: 'Strength',
        intensity: 'High',
        spotsTotal: 10,
        spotsBooked: 4,
        image: '🏋️‍♂️',
        color: 'bg-indigo-500'
    },
    {
        id: 4,
        title: 'Zumba Dance Party',
        trainer: 'Maria Rodriguez',
        time: '01:00 PM - 02:00 PM',
        type: 'Cardio',
        intensity: 'Medium',
        spotsTotal: 25,
        spotsBooked: 20,
        image: '💃',
        color: 'bg-amber-500'
    }
];

const MY_BOOKINGS = [
    { id: 101, title: 'HIIT Blast', time: 'Today, 06:00 PM', status: 'Confirmed' },
    { id: 102, title: 'Morning Yoga', time: 'Tomorrow, 07:00 AM', status: 'Confirmed' }
];

const TRAINERS = [
    { id: 1, name: 'Sara Jenkins', specialty: 'Yoga & Pilates', rating: 4.9, image: 'SJ' },
    { id: 2, name: 'Mike "The Rock"', specialty: 'HIIT & Cardio', rating: 4.8, image: 'MR' },
];

export default function GymPage() {
    const [selectedDay, setSelectedDay] = useState('Today');
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await GymMembershipService.getProviders();
                setProviders(data as any[]);
            } catch (error: any) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const [filter, setFilter] = useState('All');
    const [bookedClasses, setBookedClasses] = useState<number[]>([]);

    const handleBook = (id: number) => {
        if (!bookedClasses.includes(id)) {
            setBookedClasses([...bookedClasses, id]);
        }
    };

    const filteredClasses = filter === 'All'
        ? CLASSES
        : CLASSES.filter(c => c.type === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Dumbbell className="w-6 h-6 text-rose-500" />
                        Gym & Wellness
                    </h1>
                    <p className="text-silver-mist text-sm">Book fitness classes and track your wellness journey.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-stellar-blue px-4 py-2 rounded-xl border border-cloud dark:border-nebula-purple/50 flex items-center gap-2 shadow-sm">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-ink-black dark:text-pearl">3 Day Streak!</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-full min-h-0 overflow-hidden">
                {/* Left: Schedule & Classes */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Date Selector */}
                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
                        {['Today', 'Tomorrow', ...WEEK_DAYS].map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border
                                    ${selectedDay === day
                                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 transform scale-105'
                                        : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                `}
                            >
                                {day}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mb-2">
                        {['All', 'Cardio', 'Strength', 'Mindfulness'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors
                                    ${filter === f
                                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-800'
                                        : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Classes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-2 pb-20">
                        {filteredClasses.map(cls => {
                            const isBooked = bookedClasses.includes(cls.id);
                            const spotsLeft = cls.spotsTotal - cls.spotsBooked - (isBooked ? 1 : 0);

                            return (
                                <div key={cls.id} className="bg-white dark:bg-stellar-blue p-5 rounded-2xl border border-cloud dark:border-nebula-purple/50 hover:shadow-lg transition-all group flex flex-col relative overflow-hidden">
                                    {/* Background Accent */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${cls.color} opacity-5 rounded-bl-full -mr-4 -mt-4`}></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex gap-3">
                                            <div className={`w-12 h-12 rounded-xl ${cls.color} flex items-center justify-center text-2xl shadow-inner`}>
                                                {cls.image}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-ink-black dark:text-pearl text-lg">{cls.title}</h3>
                                                <div className="text-xs text-silver-mist flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {cls.trainer}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-1 rounded border
                                            ${cls.intensity === 'High' ? 'text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-500/10' :
                                                cls.intensity === 'Medium' ? 'text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-500/10' :
                                                    'text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10'}
                                        `}>
                                            {cls.intensity} Intensity
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6 relative z-10">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Clock className="w-4 h-4 text-indigo-500" />
                                            <span className="font-bold">{cls.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Users className="w-4 h-4" />
                                            <span>{spotsLeft} spots left</span>
                                            <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-2">
                                                <div
                                                    className={`h-full ${cls.color} opacity-80`}
                                                    style={{ width: `${((cls.spotsTotal - spotsLeft) / cls.spotsTotal) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleBook(cls.id)}
                                        disabled={isBooked || spotsLeft === 0}
                                        className={`w-full py-3 rounded-xl font-bold transition-all relative z-10 flex items-center justify-center gap-2
                                            ${isBooked
                                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 cursor-default'
                                                : spotsLeft === 0
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95'}
                                        `}
                                    >
                                        {isBooked ? (
                                            <><CheckCircle2 className="w-4 h-4" /> Booked</>
                                        ) : spotsLeft === 0 ? 'Full' : 'Book Slot'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: My Bookings & Trainers */}
                <div className="lg:col-span-1 space-y-4 flex flex-col h-full overflow-hidden">
                    {/* My Bookings */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm shrink-0">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-500" /> My Bookings
                        </h3>

                        <div className="space-y-4">
                            {MY_BOOKINGS.map(booking => (
                                <div key={booking.id} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-sm text-ink-black dark:text-pearl">{booking.title}</h4>
                                        <div className="text-xs text-silver-mist flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> {booking.time}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded">
                                        {booking.status}
                                    </span>
                                </div>
                            ))}
                            {bookedClasses.length > 0 && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-center text-xs text-indigo-600 dark:text-indigo-300 font-bold">
                                    + {bookedClasses.length} New Booking{bookedClasses.length > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trainers */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-rose-500" /> Top Trainers
                        </h3>

                        <div className="overflow-y-auto space-y-4 pr-1">
                            {TRAINERS.map(trainer => (
                                <div key={trainer.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                        {trainer.image}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-ink-black dark:text-pearl text-sm group-hover:text-indigo-500 transition-colors">{trainer.name}</div>
                                        <div className="text-xs text-silver-mist">{trainer.specialty}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                        <Star className="w-3 h-3 fill-current" /> {trainer.rating}
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

