"use client";

import React, { useState } from 'react';
import {
    Car,
    MapPin,
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    X,
    Navigation,
    Bike,
    AlertCircle,
    QrCode,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const LEVELS = ['B1', 'B2', 'G (Visitor)'];

const PARKING_LOTS = {
    'B1': Array.from({ length: 40 }, (_, i) => ({
        id: `B1-${i + 1}`,
        number: `A-${i + 1}`,
        status: i === 5 ? 'My Spot' : i % 3 === 0 ? 'Occupied' : i % 7 === 0 ? 'Reserved' : 'Available',
        type: i > 30 ? 'Bike' : 'Car'
    })),
    'B2': Array.from({ length: 40 }, (_, i) => ({
        id: `B2-${i + 1}`,
        number: `B-${i + 1}`,
        status: i % 2 === 0 ? 'Occupied' : 'Available',
        type: 'Car'
    })),
    'G (Visitor)': Array.from({ length: 20 }, (_, i) => ({
        id: `G-${i + 1}`,
        number: `V-${i + 1}`,
        status: i < 15 ? 'Occupied' : 'Available',
        type: 'Car'
    })),
};

const MY_VEHICLES = [
    { id: 1, model: 'Tesla Model 3', plate: 'KA-01-EL-2024', type: 'Car', primary: true },
    { id: 2, model: 'Honda CB350', plate: 'KA-05-MC-8892', type: 'Bike', primary: false },
];

export default function ParkingPage() {
    const [selectedLevel, setSelectedLevel] = useState('B1');
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);

    const checkAvailability = (level: string) => {
        const slots = PARKING_LOTS[level as keyof typeof PARKING_LOTS];
        const free = slots.filter(s => s.status === 'Available').length;
        return { total: slots.length, free };
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Car className="w-6 h-6 text-indigo-500" />
                        Parking Management
                    </h1>
                    <p className="text-silver-mist text-sm">Real-time parking availability and slot reservation.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddVehicle(true)}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4" /> Add Vehicle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 overflow-hidden">
                {/* Left: Interactive Map */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-hidden space-y-4">
                    {/* Level Selector */}
                    <div className="flex gap-4 overflow-x-auto pb-2 shrink-0">
                        {LEVELS.map(lvl => {
                            const stats = checkAvailability(lvl);
                            return (
                                <button
                                    key={lvl}
                                    onClick={() => setSelectedLevel(lvl)}
                                    className={`relative p-4 rounded-2xl border transition-all min-w-[140px] text-left group
                                        ${selectedLevel === lvl
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                                            : 'bg-white dark:bg-stellar-blue text-slate-500 border-cloud dark:border-slate-800 hover:border-indigo-300'}
                                    `}
                                >
                                    <div className="text-2xl font-black mb-1">{lvl}</div>
                                    <div className={`text-xs font-bold ${selectedLevel === lvl ? 'text-indigo-200' : 'text-silver-mist'}`}>
                                        {stats.free} / {stats.total} Free
                                    </div>
                                    {selectedLevel === lvl && (
                                        <motion.div layoutId="active-pill" className="absolute -top-2 -right-2 bg-white text-indigo-600 rounded-full p-1 shadow-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Grid */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 flex-1 overflow-y-auto relative">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                            {PARKING_LOTS[selectedLevel as keyof typeof PARKING_LOTS].map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => slot.status === 'Available' && setSelectedSlot(slot)}
                                    disabled={slot.status === 'Occupied' || slot.status === 'Reserved'}
                                    className={`aspect-[4/5] rounded-lg relative flex flex-col items-center justify-center gap-1 transition-all border-2
                                        ${slot.status === 'My Spot' ? 'bg-indigo-100 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' :
                                            slot.status === 'Available' ? 'bg-slate-50 border-dashed border-slate-300 hover:bg-emerald-50 hover:border-emerald-400 cursor-pointer dark:bg-slate-900/40 dark:border-slate-700' :
                                                slot.status === 'Reserved' ? 'bg-amber-50 border-amber-200 opacity-60 cursor-not-allowed dark:bg-amber-500/10 dark:border-amber-900' :
                                                    'bg-slate-200 border-transparent opacity-40 cursor-not-allowed dark:bg-slate-800'}
                                    `}
                                >
                                    {slot.type === 'Bike' ? <Bike className="w-5 h-5 opacity-50" /> : <Car className="w-5 h-5 opacity-50" />}
                                    <span className="text-[10px] font-bold">{slot.number}</span>

                                    {/* Status Indicator */}
                                    {slot.status === 'My Spot' && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur rounded-xl p-3 flex justify-between text-[10px] font-bold text-slate-500 border border-cloud dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded"></span> Available
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-indigo-100 border-2 border-indigo-500 rounded"></span> My Spot
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-slate-200 rounded"></span> Occupied
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-amber-50 border-2 border-amber-200 rounded"></span> Reserved
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Info & Vehicles */}
                <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-hidden">
                    {/* My Slot Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <MapPin className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="text-sm font-bold opacity-80 uppercase tracking-wide mb-2">My Parked Location</div>
                            <div className="text-4xl font-black mb-1">B1 • A-06</div>
                            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                                <Clock className="w-3 h-3" /> Parked for 3h 24m
                            </div>

                            <button className="w-full mt-6 py-2 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                <Navigation className="w-4 h-4" /> Navigate to Car
                            </button>
                        </div>
                    </div>

                    {/* My Vehicles */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex-1 flex flex-col">
                        <h3 className="font-bold text-ink-black dark:text-pearl mb-4 flex items-center gap-2">
                            <Car className="w-5 h-5 text-indigo-500" /> My Vehicles
                        </h3>

                        <div className="space-y-4">
                            {MY_VEHICLES.map(vehicle => (
                                <div key={vehicle.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-cloud dark:border-slate-800 flex items-center gap-4 relative group">
                                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        {vehicle.type === 'Car' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-ink-black dark:text-pearl">{vehicle.model}</div>
                                        <div className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 w-fit mt-1">
                                            {vehicle.plate}
                                        </div>
                                    </div>
                                    {vehicle.primary && (
                                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Primary</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Pass */}
                    <div className="bg-white dark:bg-stellar-blue p-6 rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                            <QrCode className="w-16 h-16 text-slate-800" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-ink-black dark:text-pearl">Entry Pass</div>
                            <div className="text-xs text-silver-mist mt-1">Scan at the boom barrier for automated entry.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Slot Modal */}
            <AnimatePresence>
                {selectedSlot && (
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
                            className="bg-white dark:bg-stellar-blue w-full max-w-sm rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4 text-indigo-500">
                                <Car className="w-8 h-8" />
                            </div>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">Reserve Slot {selectedSlot.number}</h2>
                            <p className="text-sm text-silver-mist mb-6">Confirm booking for Level {selectedLevel}</p>

                            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl text-left mb-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-bold">Today</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Time</span>
                                    <span className="font-bold">09:00 AM - 06:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Vehicle</span>
                                    <span className="font-bold font-mono">KA-01-EL-2024</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedSlot(null)}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setSelectedSlot(null)}
                                    className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
