"use client";

import React, { useState, useEffect } from 'react';
import { CandidateApplicationService } from '../services';
import type {
    CandidateApplication,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent} from '@dnd-kit/core';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    MoreHorizontal,
    Plus,
    Search,
    Filter,
    Star,
    BrainCircuit,
    MapPin,
    Briefcase,
    Loader2
} from 'lucide-react';

type Candidate = {
    id: string;
    name: string;
    role: string;
    matchScore: number;
    rating: number;
    location: string;
    avatar: string;
};

type ColumnType = {
    id: string;
    title: string;
    color: string;
};

const COLUMNS: ColumnType[] = [
    { id: 'applied', title: 'Applied', color: 'bg-slate-500' },
    { id: 'screening', title: 'Screening', color: 'bg-celestial-indigo' },
    { id: 'interview', title: 'Interview', color: 'bg-neural-mint' },
    { id: 'offer', title: 'Offered', color: 'bg-quantum-rose' },
];

const EMPTY_BOARD: Record<string, Candidate[]> = {
    applied: [],
    screening: [],
    interview: [],
    offer: [],
};

function mapApplicationToCandidate(app: CandidateApplication): Candidate {
    return {
        id: app.id,
        name: `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Unknown',
        role: app.jobTitle || 'N/A',
        matchScore: app.rating ? Math.round(app.rating * 20) : 0,
        rating: app.rating || 0,
        location: app.location || 'Unknown',
        avatar: `https://i.pravatar.cc/150?u=${app.id}`,
    };
}

function normalizeStage(app: CandidateApplication): keyof typeof EMPTY_BOARD {
    const stage = String(app.currentStage || app.status || 'applied').toLowerCase();

    if (stage.includes('screen')) return 'screening';
    if (stage.includes('interview')) return 'interview';
    if (stage.includes('offer')) return 'offer';
    return 'applied';
}

export default function ApplicationTrackingPage() {
    const [items, setItems] = useState<Record<string, Candidate[]>>(EMPTY_BOARD);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await CandidateApplicationService.getApplications();
            // Group applications by status
            const grouped: Record<string, Candidate[]> = {
                applied: [],
                screening: [],
                interview: [],
                offer: []
            };

            data.forEach((app) => {
                const candidate = mapApplicationToCandidate(app as CandidateApplication);
                grouped[normalizeStage(app as CandidateApplication)].push(candidate);
            });

            setItems(grouped);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: string) => {
        if (id in items) return id;
        return Object.keys(items).find((key) => items[key].find((c) => c.id === id));
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string);

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        setItems((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.findIndex((i) => i.id === active.id);
            const overIndex = overItems.findIndex((i) => i.id === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    activeItems[activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over?.id as string);

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer
        ) {
            const activeIndex = items[activeContainer].findIndex((i) => i.id === active.id);
            const overIndex = items[overContainer].findIndex((i) => i.id === over?.id);

            if (activeIndex !== overIndex) {
                setItems((items) => ({
                    ...items,
                    [activeContainer]: arrayMove(items[activeContainer], activeIndex, overIndex),
                }));
            }
        }

        setActiveId(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    // Helper to find the active item object for the overlay
    const activeItem = activeId ? Object.values(items).flat().find(i => i.id === activeId) : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-silver-mist font-medium">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 flex-1">
                    <h1 className="text-xl font-bold text-ink-black dark:text-pearl whitespace-nowrap">Application Board</h1>
                    <div className="relative flex-1 max-w-sm ml-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-celestial-indigo/50 text-sm"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium hover:bg-cloud/50 transition-colors text-silver-mist">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium hover:bg-celestial-indigo/90 transition-colors">
                        <Plus className="w-4 h-4" /> Add Candidate
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-3 overflow-x-auto pb-4">
                    {COLUMNS.map((col) => (
                        <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-cloud dark:border-nebula-purple/20">
                            {/* Column Header */}
                            <div className="p-3 flex items-center justify-between border-b border-cloud dark:border-nebula-purple/20 bg-white dark:bg-stellar-blue rounded-t-xl">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                    <span className="font-semibold text-sm text-ink-black dark:text-pearl">{col.title}</span>
                                    <span className="bg-cloud dark:bg-deep-cosmos px-2 py-0.5 rounded-full text-xs font-medium text-silver-mist">
                                        {items[col.id]?.length || 0}
                                    </span>
                                </div>
                                <button className="text-silver-mist hover:text-ink-black dark:hover:text-pearl">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-2 overflow-y-auto">
                                <SortableContext
                                    id={col.id}
                                    items={(items[col.id] || []).map((c) => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3 min-h-[100px]">
                                        {(items[col.id] || []).map((candidate) => (
                                            <SortableCandidateCard key={candidate.id} candidate={candidate} />
                                        ))}
                                        {(items[col.id] || []).length === 0 && (
                                            <div className="flex items-center justify-center h-24 text-xs text-slate-400">
                                                No candidates
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </div>
                        </div>
                    ))}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeItem ? <CandidateCard candidate={activeItem} isOverlay /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

// --- SUB COMPONENTS ---

function SortableCandidateCard({ candidate }: { candidate: Candidate }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: candidate.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CandidateCard candidate={candidate} />
        </div>
    );
}

function CandidateCard({ candidate, isOverlay }: { candidate: Candidate, isOverlay?: boolean }) {
    return (
        <div className={`bg-white dark:bg-stellar-blue p-3 rounded-lg border border-cloud dark:border-nebula-purple/50 shadow-sm hover:shadow-md hover:border-celestial-indigo/50 transition-all cursor-grab active:cursor-grabbing group ${isOverlay ? 'shadow-xl scale-105 rotate-2 ring-2 ring-celestial-indigo' : ''}`}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <img src={candidate.avatar} alt={candidate.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                    <div>
                        <h4 className="text-sm font-bold text-ink-black dark:text-pearl leading-tight">{candidate.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-silver-mist">
                            <Briefcase className="w-3 h-3" />
                            {candidate.role}
                        </div>
                    </div>
                </div>
                {candidate.matchScore >= 90 && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 rounded text-[10px] font-bold text-emerald-600">
                        <BrainCircuit className="w-3 h-3" />
                        {candidate.matchScore}%
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-cloud dark:border-nebula-purple/20">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="w-3 h-3" /> {candidate.location}
                </div>
                <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < candidate.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                    ))}
                </div>
            </div>
        </div>
    );
}

