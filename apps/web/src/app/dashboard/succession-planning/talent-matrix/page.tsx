"use client";

import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
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
    User,
    TrendingUp,
    Star,
    AlertTriangle,
    Shield,
    HelpCircle,
    Info
} from 'lucide-react';

// --- TYPE DEFINITIONS ---

type Employee = {
    id: string;
    name: string;
    role: string;
    avatar: string;
};

type TalentBox = {
    id: string;
    title: string;
    description: string;
    color: string; // Tailwind class
    icon: any;
    items: Employee[];
};

// --- MOCK DATA ---

const INITIAL_BOXES: TalentBox[] = [
    // ROW 1 (High Potential)
    {
        id: 'box-1', title: 'Rough Diamond', description: 'High Potential, Low Performance', color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200', icon: HelpCircle, items: [
            { id: '1', name: 'Alice Chen', role: 'Jr. Dev', avatar: 'https://i.pravatar.cc/150?u=1' }
        ]
    },
    {
        id: 'box-2', title: 'Rising Star', description: 'High Potential, Mod Performance', color: 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200', icon: TrendingUp, items: [
            { id: '2', name: 'Bob Smith', role: 'Sales Exec', avatar: 'https://i.pravatar.cc/150?u=2' }
        ]
    },
    {
        id: 'box-3', title: 'Super Star', description: 'High Potential, High Performance', color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-200', icon: Star, items: [
            { id: '3', name: 'Carol Danvers', role: 'Product Lead', avatar: 'https://i.pravatar.cc/150?u=3' },
            { id: '4', name: 'Dave Wilson', role: 'CTO', avatar: 'https://i.pravatar.cc/150?u=4' }
        ]
    },

    // ROW 2 (Moderate Potential)
    { id: 'box-4', title: 'Inconsistent', description: 'Mod Potential, Low Performance', color: 'bg-red-100 dark:bg-red-900/20 border-red-200', icon: AlertTriangle, items: [] },
    {
        id: 'box-5', title: 'Core Player', description: 'Mod Potential, Mod Performance', color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200', icon: Shield, items: [
            { id: '5', name: 'Eve Polastri', role: 'Analyst', avatar: 'https://i.pravatar.cc/150?u=5' }
        ]
    },
    {
        id: 'box-6', title: 'High Performer', description: 'Mod Potential, High Performance', color: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100', icon: TrendingUp, items: [
            { id: '6', name: 'Frank Castle', role: 'Security', avatar: 'https://i.pravatar.cc/150?u=6' }
        ]
    },

    // ROW 3 (Low Potential)
    { id: 'box-7', title: 'Talent Risk', description: 'Low Potential, Low Performance', color: 'bg-gray-100 dark:bg-gray-800 border-gray-200', icon: AlertTriangle, items: [] },
    { id: 'box-8', title: 'Effective', description: 'Low Potential, Mod Performance', color: 'bg-gray-50 dark:bg-gray-900/50 border-gray-100', icon: Shield, items: [] },
    {
        id: 'box-9', title: 'Trusted Pro', description: 'Low Potential, High Performance', color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100', icon: Shield, items: [
            { id: '7', name: 'Grace Hopper', role: 'Senior Architect', avatar: 'https://i.pravatar.cc/150?u=7' }
        ]
    },
];

// --- COMPONENTS ---

// 1. Sortable Item (Employee Card)
function SortableEmployee({ employee }: { employee: Employee }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: employee.id, data: { type: 'employee', employee } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center gap-3 p-2 bg-white dark:bg-stellar-blue rounded-lg shadow-sm border border-cloud dark:border-nebula-purple/50 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-celestial-indigo/50 group"
        >
            <img src={employee.avatar} alt={employee.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
            <div className="min-w-0">
                <div className="text-xs font-bold text-ink-black dark:text-pearl truncate">{employee.name}</div>
                <div className="text-[10px] text-silver-mist truncate">{employee.role}</div>
            </div>
        </div>
    );
}

// 2. Droppable Container (The Box)
function MatrixBox({ box }: { box: TalentBox }) {
    const { setNodeRef } = useSortable({ id: box.id, data: { type: 'container', box } });

    return (
        <div ref={setNodeRef} className={`flex flex-col h-full rounded-xl border ${box.color} p-3 transition-colors`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="text-sm font-bold text-ink-black dark:text-pearl flex items-center gap-1.5">
                        {React.createElement(box.icon, { className: "w-3.5 h-3.5 opacity-70" })}
                        {box.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{box.description}</p>
                </div>
                <div className="text-xs font-bold bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {box.items.length}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 space-y-2 min-h-[50px]">
                <SortableContext items={box.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {box.items.map(employee => (
                        <SortableEmployee key={employee.id} employee={employee} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---

export default function TalentMatrixPage() {
    const [boxes, setBoxes] = useState<TalentBox[]>(INITIAL_BOXES);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeItem, setActiveItem] = useState<Employee | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findContainer = (id: string) => {
        if (boxes.find(b => b.id === id)) return id;
        return boxes.find(b => b.items.find(i => i.id === id))?.id;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const id = active.id as string;
        setActiveId(id);

        // Find the item data for overlay
        const containerId = findContainer(id);
        const container = boxes.find(b => b.id === containerId);
        const item = container?.items.find(i => i.id === id);
        if (item) setActiveItem(item);
    };



    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveItem(null);
            return;
        }

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over.id as string);

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            setBoxes(prev => {
                const sourceBox = prev.find(b => b.id === activeContainer);
                const destBox = prev.find(b => b.id === overContainer);
                if (!sourceBox || !destBox) return prev;

                const itemToMove = sourceBox.items.find(i => i.id === active.id);
                if (!itemToMove) return prev;

                return prev.map(b => {
                    if (b.id === activeContainer) return { ...b, items: b.items.filter(i => i.id !== active.id) };
                    if (b.id === overContainer) return { ...b, items: [...b.items, itemToMove] };
                    return b;
                });
            });
        }

        setActiveId(null);
        setActiveItem(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        // onDragOver={handleDragOver} // Skipped for simpler implementation
        >
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-ink-black dark:text-pearl">9-Box Talent Matrix</h1>
                        <p className="text-silver-mist text-sm">Assess leadership potential and performance.</p>
                    </div>
                    <div className="flex gap-4 text-xs text-silver-mist bg-white dark:bg-stellar-blue p-2 rounded-lg border border-cloud dark:border-nebula-purple/50">
                        <div className="flex items-center gap-1.5"><Star className="w-3 h-3 text-purple-500" /> Star</div>
                        <div className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-emerald-500" /> Rising</div>
                        <div className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-red-500" /> Risk</div>
                    </div>
                </div>

                <div className="relative">
                    {/* Axis Labels */}
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-silver-mist tracking-widest uppercase">Potential</div>
                    <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 text-xs font-bold text-silver-mist tracking-widest uppercase">Performance</div>

                    <div className="grid grid-cols-3 gap-4 h-[600px]">
                        {boxes.map(box => (
                            <MatrixBox key={box.id} box={box} />
                        ))}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeItem ? (
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-stellar-blue rounded-lg shadow-xl ring-2 ring-celestial-indigo border border-transparent w-48 opacity-90 cursor-grabbing">
                        <img src={activeItem.avatar} alt={activeItem.name} className="w-8 h-8 rounded-full bg-slate-200 object-cover" />
                        <div className="min-w-0">
                            <div className="text-xs font-bold text-ink-black dark:text-pearl truncate">{activeItem.name}</div>
                            <div className="text-[10px] text-silver-mist truncate">{activeItem.role}</div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
