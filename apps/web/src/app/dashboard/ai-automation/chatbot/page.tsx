"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type {
    Connection,
    Edge,
    Node} from 'reactflow';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    MessageSquare,
    PlayCircle,
    GitFork,
    Settings,
    Save,
    Plus,
    Box
} from 'lucide-react';
import { aiCoachingBot } from '@/lib/services/ai-automation-client';

// --- CUSTOM NODE TYPES & STYLES ---

const nodeStyles = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    minWidth: '150px',
    textAlign: 'center' as const
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Start: User Opens Chat' },
        position: { x: 250, y: 0 },
        style: { ...nodeStyles, background: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' }
    },
    {
        id: '2',
        data: { label: 'Bot: "How can I help you?"' },
        position: { x: 250, y: 100 },
        style: nodeStyles
    },
    {
        id: '3',
        data: { label: 'User: "Payroll Issue"' },
        position: { x: 100, y: 200 },
        style: { ...nodeStyles, background: '#f0fdf4', borderColor: '#22c55e', color: '#166534' }
    },
    {
        id: '4',
        data: { label: 'User: "Leave Request"' },
        position: { x: 400, y: 200 },
        style: { ...nodeStyles, background: '#f0fdf4', borderColor: '#22c55e', color: '#166534' }
    },
    {
        id: '5',
        data: { label: 'Action: Open Payslip' },
        position: { x: 100, y: 300 },
        style: { ...nodeStyles, background: '#fff7ed', borderColor: '#f97316', color: '#9a3412' }
    },
    {
        id: '6',
        data: { label: 'Bot: "Which dates?"' },
        position: { x: 400, y: 300 },
        style: nodeStyles
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed }, label: 'Intent: Payroll' },
    { id: 'e2-4', source: '2', target: '4', markerEnd: { type: MarkerType.ArrowClosed }, label: 'Intent: Leave' },
    { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e4-6', source: '4', target: '6', markerEnd: { type: MarkerType.ArrowClosed } },
];

export default function ChatbotBuilderPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const result = await aiCoachingBot.getSessions();
            if (result.success && result.data?.flow) {
                if (result.data.flow.nodes) setNodes(result.data.flow.nodes);
                if (result.data.flow.edges) setEdges(result.data.flow.edges);
            }
        } catch (error) {
            console.error('Error:', error);
                    }
    };

    const handleSaveFlow = async () => {
        setLoading(true);
        try {
            await aiCoachingBot.sendMessage(JSON.stringify({ nodes, edges }));
            await fetchSessions();
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">

            {/* Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-stellar-blue p-4 border-b border-cloud dark:border-nebula-purple/50">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2">
                        <GitFork className="w-6 h-6 text-indigo-500" />
                        Conversation Flow Builder
                    </h1>
                    <div className="h-6 w-px bg-cloud dark:bg-nebula-purple/50" />
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add Node
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button
                        onClick={handleSaveFlow}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Flow'}
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex bg-slate-50 dark:bg-slate-900/20 relative">

                {/* Sidebar Pallete */}
                <div className="w-64 bg-white dark:bg-stellar-blue border-r border-cloud dark:border-nebula-purple/50 p-4 flex flex-col gap-3 z-10">
                    <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-2">Components</h3>

                    <div className="p-3 bg-white border-2 border-slate-100 rounded-lg cursor-grab hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                            <PlayCircle className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Trigger</span>
                    </div>

                    <div className="p-3 bg-white border-2 border-slate-100 rounded-lg cursor-grab hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-50 text-slate-600 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Message</span>
                    </div>

                    <div className="p-3 bg-white border-2 border-slate-100 rounded-lg cursor-grab hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Box className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Question</span>
                    </div>

                    <div className="p-3 bg-white border-2 border-slate-100 rounded-lg cursor-grab hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Settings className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Logic / API</span>
                    </div>

                    <div className="mt-auto p-4 bg-indigo-50 text-indigo-900 rounded-xl text-xs leading-relaxed">
                        <strong>Tip:</strong> Drag components onto the canvas to create new conversation steps.
                    </div>
                </div>

                {/* ReactFlow Canvas */}
                <div className="flex-1 h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                    >
                        <Background color="#94a3b8" gap={16} size={1} style={{ opacity: 0.2 }} />
                        <Controls className='bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden' />
                        <MiniMap
                            nodeStrokeColor={(n) => {
                                if (n.style?.background) return n.style.background as string;
                                return '#e2e8f0';
                            }}
                            nodeColor={(n) => {
                                if (n.style?.background) return n.style.background as string;
                                return '#fff';
                            }}
                            maskColor="rgba(240, 245, 255, 0.6)"
                            className='bg-white border border-slate-200 shadow-sm rounded-lg'
                        />
                    </ReactFlow>
                </div>

            </div>
        </div>
    );
}

