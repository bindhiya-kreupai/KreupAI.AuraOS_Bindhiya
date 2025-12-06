"use client";

import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Monitor,
    Tv,
    Wifi,
    Search,
    Filter,
    Plus,
    CheckCircle2,
    X,
    ChevronLeft,
    ChevronRight,
    Presentation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- MOCK DATA ---

const MEETING_ROOMS = [
    {
        id: 1,
        name: 'The boardroom',
        capacity: 12,
        floor: 'Floor 12',
        amenities: ['Video Conf', 'Projector', 'Whiteboard'],
        status: 'Available',
        nextMeeting: '2:00 PM',
        image: 'bg-slate-800' // Placeholder for gradient/image
    },
    {
        id: 2,
        name: 'Huddle Pod A',
        capacity: 4,
        floor: 'Floor 12',
        amenities: ['Monitor', 'Whiteboard'],
        status: 'Occupied',
        freeAt: '11:30 AM',
        nextMeeting: null,
        image: 'bg-indigo-900'
    },
    {
        id: 3,
        name: 'Creative Lab',
        capacity: 8,
        floor: 'Floor 11',
        amenities: ['TV', 'Bean Bags', 'Whiteboard'],
        status: 'Available',
        nextMeeting: '1:00 PM',
        image: 'bg-emerald-900'
    }
];

const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const BOOKINGS = [
    { roomId: 1, start: '14:00', end: '15:00', title: 'Q4 Strategy Review', organizer: 'Sarah J.' },
    { roomId: 2, start: '09:00', end: '11:30', title: 'Design Sprint', organizer: 'Mike C.' },
    { roomId: 3, start: '13:00', end: '14:00', title: 'Marketing Sync', organizer: 'Alice T.' },
];

export default function MeetingRoomsPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<typeof MEETING_ROOMS[0] | null>(null);

    const getAmenityIcon = (name: string) => {
        switch (name) {
            case 'Video Conf': return <Monitor className="w-3 h-3" />;
            case 'Projector': return <Presentation className="w-3 h-3" />;
            case 'Whiteboard': return <Users className="w-3 h-3" />; // Using generic for now
            case 'TV': return <Tv className="w-3 h-3" />;
            default: return <Wifi className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-6 pb-10 h-[calc(100vh-6rem)] flex flex-col relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-500" />
                        Meeting Rooms
                    </h1>
                    <p className="text-silver-mist text-sm">Find and book available workspaces instantly.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-stellar-blue p-1.5 rounded-xl border border-cloud dark:border-nebula-purple/50">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-2 font-bold text-sm text-ink-black dark:text-pearl min-w-[140px] justify-center">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col h-full min-h-0 overflow-hidden space-y-6">
                {/* Rooms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                    {MEETING_ROOMS.map(room => (
                        <div
                            key={room.id}
                            onClick={() => { setSelectedRoom(room); setShowBookingModal(true); }}
                            className="bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className={`h-24 ${room.image} relative p-4 flex flex-col justify-end`}>
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm backdrop-blur-md
                                        ${room.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}
                                    `}>
                                        {room.status}
                                    </span>
                                </div>
                                <h3 className="text-white font-bold text-lg drop-shadow-md">{room.name}</h3>
                                <div className="text-white/80 text-xs flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {room.floor}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4 text-indigo-500" /> {room.capacity} Seats
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-indigo-500" />
                                        {room.status === 'Available' ? (room.nextMeeting ? `Next: ${room.nextMeeting}` : 'Free all day') : `Free at ${room.freeAt}`}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {room.amenities.map(am => (
                                        <span key={am} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 flex items-center gap-1 border border-cloud dark:border-slate-700">
                                            {getAmenityIcon(am)} {am}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Visual Timeline */}
                <div className="flex-1 bg-white dark:bg-stellar-blue rounded-2xl border border-cloud dark:border-nebula-purple/50 shadow-sm p-6 overflow-x-auto min-h-[300px]">
                    <h3 className="font-bold text-ink-black dark:text-pearl mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-500" /> Schedule View
                    </h3>

                    <div className="relative min-w-[800px]">
                        {/* Time Header */}
                        <div className="flex ml-40 border-b border-cloud dark:border-slate-800 mb-4 pb-2">
                            {TIME_SLOTS.map(time => (
                                <div key={time} className="flex-1 text-center text-xs font-bold text-silver-mist">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Room Rows */}
                        <div className="space-y-6">
                            {MEETING_ROOMS.map(room => (
                                <div key={room.id} className="flex items-center group">
                                    {/* Room Label */}
                                    <div className="w-40 shrink-0 pr-4">
                                        <div className="font-bold text-sm text-ink-black dark:text-pearl">{room.name}</div>
                                        <div className="text-xs text-silver-mist">{room.capacity} People</div>
                                    </div>

                                    {/* Track */}
                                    <div className="flex-1 h-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg relative overflow-hidden flex border border-cloud dark:border-slate-800">
                                        {/* Grid Lines */}
                                        {TIME_SLOTS.map((_, i) => (
                                            <div key={i} className="flex-1 border-r border-cloud dark:border-slate-800/50 h-full last:border-r-0"></div>
                                        ))}

                                        {/* Bookings */}
                                        {BOOKINGS.filter(b => b.roomId === room.id).map((booking, idx) => {
                                            // Mock positioning logic
                                            const startHour = parseInt(booking.start.split(':')[0]);
                                            const endHour = parseInt(booking.end.split(':')[0]);
                                            const duration = endHour - startHour + (booking.end.includes('30') ? 0.5 : 0);
                                            const offset = startHour - 9; // Grid starts at 9

                                            // 9-17 = 8 hours total duration
                                            const widthPercent = (duration / 8) * 100;
                                            const leftPercent = (offset / 8) * 100;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="absolute top-1 bottom-1 rounded bg-indigo-500/80 dark:bg-indigo-500/40 border border-indigo-600 dark:border-indigo-400 backdrop-blur-sm flex flex-col justify-center px-2 text-white overflow-hidden hover:z-10 hover:shadow-lg transition-all cursor-pointer"
                                                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                                                    title={`${booking.title} (${booking.organizer})`}
                                                >
                                                    <div className="text-[10px] font-bold truncate">{booking.title}</div>
                                                    <div className="text-[9px] opacity-80 truncate">{booking.organizer}</div>
                                                </div>
                                            );
                                        })}

                                        {/* Create Slot Hover Overlay */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent pointer-events-none flex">
                                            {TIME_SLOTS.map((_, i) => (
                                                <div key={i} className="flex-1 border-r border-transparent h-full hover:bg-emerald-500/10 cursor-pointer pointer-events-auto transition-colors group/slot relative border-l border-l-transparent hover:border-l-emerald-300">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/slot:opacity-100 text-emerald-600 text-[10px] font-bold">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Book Modal */}
            <AnimatePresence>
                {showBookingModal && selectedRoom && (
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
                            className="bg-white dark:bg-stellar-blue w-full max-w-md rounded-2xl border border-cloud dark:border-slate-800 shadow-2xl p-6 relative"
                        >
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-ink-black dark:text-pearl mb-1">Book Room</h2>
                            <p className="text-sm text-silver-mist mb-6">Reservation details for <span className="font-bold text-indigo-500">{selectedRoom.name}</span></p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Meeting Title</label>
                                    <input type="text" placeholder="e.g., Weekly Sync" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Start Time</label>
                                        <select className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Duration</label>
                                        <select className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none">
                                            <option>30 min</option>
                                            <option>1 hour</option>
                                            <option>1.5 hours</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Attendees (Max {selectedRoom.capacity})</label>
                                    <input type="number" placeholder="4" className="w-full p-2.5 rounded-xl border border-cloud dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                            </div>

                            <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl mt-6 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Confirm Booking
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
