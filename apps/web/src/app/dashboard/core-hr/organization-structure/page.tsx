"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    Controls,
    Background,
    Connection,
    Edge,
    Node,
    Handle,
    Position,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Mail, Briefcase, Minus, Plus } from 'lucide-react';

// --- CUSTOM NODE COMPONENT ---

const CustomNode = ({ data }: { data: any }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white dark:bg-stellar-blue border-2 border-cloud dark:border-nebula-purple/50 w-64 group hover:border-celestial-indigo transition-colors">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-celestial-indigo" />

            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-deep-cosmos object-cover overflow-hidden mr-3 border border-gray-200 dark:border-gray-700">
                    {data.image ? (
                        <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="text-gray-400 w-6 h-6" />
                    )}
                </div>
                <div>
                    <div className="text-sm font-bold text-ink-black dark:text-pearl">{data.name}</div>
                    <div className="text-xs text-silver-mist">{data.role}</div>
                </div>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center text-[10px] text-gray-500 gap-1">
                    <Briefcase className="w-3 h-3" /> {data.department}
                </div>
                {data.reports > 0 && (
                    <div className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                        {data.reports} Reports
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-celestial-indigo" />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

// --- MOCK DATA ---

const initialNodes: Node[] = [
    // Level 1: CEO
    {
        id: '1',
        type: 'custom',
        position: { x: 450, y: 0 },
        data: { name: 'Alexandra Hamilton', role: 'CEO & Founder', department: 'Executive', image: 'https://i.pravatar.cc/150?u=1', reports: 3 },
    },
    // Level 2: VP of Eng, VP of Sales, VP of HR
    {
        id: '2',
        type: 'custom',
        position: { x: 100, y: 200 },
        data: { name: 'Marcus Chen', role: 'VP of Engineering', department: 'Engineering', image: 'https://i.pravatar.cc/150?u=2', reports: 2 },
    },
    {
        id: '3',
        type: 'custom',
        position: { x: 450, y: 200 },
        data: { name: 'Sarah Miller', role: 'VP of Sales', department: 'Sales', image: 'https://i.pravatar.cc/150?u=3', reports: 2 },
    },
    {
        id: '4',
        type: 'custom',
        position: { x: 800, y: 200 },
        data: { name: 'James Wilson', role: 'VP of HR', department: 'Human Resources', image: 'https://i.pravatar.cc/150?u=4', reports: 1 },
    },
    // Level 3: Engineering Managers
    {
        id: '5',
        type: 'custom',
        position: { x: 0, y: 400 },
        data: { name: 'Emily Davis', role: 'Frontend Lead', department: 'Engineering', image: 'https://i.pravatar.cc/150?u=5', reports: 0 },
    },
    {
        id: '6',
        type: 'custom',
        position: { x: 250, y: 400 },
        data: { name: 'David Lee', role: 'Backend Lead', department: 'Engineering', image: 'https://i.pravatar.cc/150?u=6', reports: 0 },
    },
    // Level 3: Sales Managers
    {
        id: '7',
        type: 'custom',
        position: { x: 400, y: 400 },
        data: { name: 'Robert Fox', role: 'Regional Manager', department: 'Sales', image: 'https://i.pravatar.cc/150?u=7', reports: 0 },
    },
    {
        id: '8',
        type: 'custom',
        position: { x: 600, y: 400 },
        data: { name: 'Lisa Wang', role: 'Sales Operations', department: 'Sales', image: 'https://i.pravatar.cc/150?u=8', reports: 0 },
    },
    // Level 3: HR Managers
    {
        id: '9',
        type: 'custom',
        position: { x: 800, y: 400 },
        data: { name: 'Priya Patel', role: 'HR Manager', department: 'Human Resources', image: 'https://i.pravatar.cc/150?u=9', reports: 0 },
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: '#6366f1' } },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, style: { stroke: '#6366f1' } },
    { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', animated: true, style: { stroke: '#6366f1' } },

    { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', style: { stroke: '#cbd5e1' } },
    { id: 'e2-6', source: '2', target: '6', type: 'smoothstep', style: { stroke: '#cbd5e1' } },

    { id: 'e3-7', source: '3', target: '7', type: 'smoothstep', style: { stroke: '#cbd5e1' } },
    { id: 'e3-8', source: '3', target: '8', type: 'smoothstep', style: { stroke: '#cbd5e1' } },

    { id: 'e4-9', source: '4', target: '9', type: 'smoothstep', style: { stroke: '#cbd5e1' } },
];

export default function OrgStructurePage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="h-[calc(100vh-6rem)] w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white dark:bg-stellar-blue p-4 rounded-lg shadow-md border border-cloud dark:border-nebula-purple/50">
                <h1 className="text-lg font-bold text-ink-black dark:text-pearl">Organization Hierarchy</h1>
                <p className="text-xs text-silver-mist">Drag to explore • Scroll to zoom</p>
                <div className="mt-3 flex gap-2">
                    <div className="flex items-center text-xs text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-celestial-indigo mr-1"></div> Executive
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-slate-300 mr-1"></div> Management
                    </div>
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-slate-50 dark:bg-slate-900"
            >
                <Controls className="bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 shadow-sm" />
                <Background color="#94a3b8" gap={16} size={1} className="opacity-20" />
            </ReactFlow>
        </div>
    );
}
