"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Sparkles,
    Play,
    GitCommit,
    Terminal,
    Wand2,
    Calendar,
    Mail,
    Bell,
    CheckCircle2
} from 'lucide-react';
import { workflowGenerator } from '@/lib/services/ai-automation-client';

// --- CUSTOM STYLES ---

const nodeStyles = {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: 'white',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    minWidth: '180px',
    textAlign: 'left' as const
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'input',
        data: { label: 'Trigger: New Hire Added' },
        position: { x: 250, y: 0 },
        style: { ...nodeStyles, background: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' }
    },
    {
        id: '2',
        data: { label: 'Action: Create IT Ticket' },
        position: { x: 250, y: 100 },
        style: nodeStyles
    },
    {
        id: '3',
        data: { label: 'Wait: 2 Days' },
        position: { x: 250, y: 200 },
        style: { ...nodeStyles, background: '#fef3c7', borderColor: '#d97706', color: '#92400e' }
    },
    {
        id: '4',
        data: { label: 'Email: Welcome Kit Info' },
        position: { x: 150, y: 300 },
        style: nodeStyles
    },
    {
        id: '5',
        data: { label: 'Task: Assign Buddy' },
        position: { x: 400, y: 300 },
        style: nodeStyles
    },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-4', source: '3', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
];

export default function WorkflowGeneratorPage() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const result = await workflowGenerator.getWorkflows();
            if (result.success && result.data?.workflows?.length > 0) {
                const workflow = result.data.workflows[0];
                if (workflow.nodes) setNodes(workflow.nodes);
                if (workflow.edges) setEdges(workflow.edges);
            }
        } catch (error) {
            console.error('Error fetching workflows:', error);
        }
    };

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await workflowGenerator.generateWorkflow(prompt);
            if (result.success && result.data) {
                if (result.data.nodes) setNodes(result.data.nodes);
                if (result.data.edges) setEdges(result.data.edges);
            }
        } catch (error) {
            console.error('Error generating workflow:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleActivate = async () => {
        setLoading(true);
        try {
            await workflowGenerator.saveWorkflow({ nodes, edges, prompt });
            await fetchWorkflows();
        } catch (error) {
            console.error('Error saving workflow:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">

            {/* Header / Prompt Input */}
            <div className="bg-white dark:bg-stellar-blue p-6 border-b border-cloud dark:border-nebula-purple/50">
                <div className="max-w-4xl mx-auto w-full">
                    <h1 className="text-xl font-bold text-ink-black dark:text-pearl flex items-center gap-2 mb-4">
                        <Wand2 className="w-6 h-6 text-indigo-500" />
                        AI Workflow Generator
                    </h1>
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe a workflow, e.g., 'When an employee resigns, notify manager, schedule exit interview, and disable access after 30 days.'"
                            className="w-full pl-5 pr-32 py-4 bg-slate-50 dark:bg-slate-900/50 border border-cloud dark:border-nebula-purple/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Sparkles className="w-4 h-4 animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" /> Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 flex bg-slate-50 dark:bg-slate-900/20 relative">

                {/* Visualizer */}
                <div className="flex-1 h-full">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                    >
                        <Background color="#94a3b8" gap={20} size={1} style={{ opacity: 0.2 }} />
                        <Controls className='bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden' />
                        <MiniMap
                            nodeStrokeColor="#e2e8f0"
                            nodeColor="#fff"
                            maskColor="rgba(240, 245, 255, 0.6)"
                            className='bg-white border border-slate-200 shadow-sm rounded-lg'
                        />
                    </ReactFlow>
                </div>

                {/* Sidebar Details (Simulated) */}
                <div className="w-80 bg-white dark:bg-stellar-blue border-l border-cloud dark:border-nebula-purple/50 p-6 flex flex-col gap-6 scale-95 origin-top-right">
                    <div>
                        <h3 className="text-xs font-bold text-silver-mist uppercase tracking-wider mb-4">Steps Detected</h3>
                        <div className="space-y-4 relative">
                            {/* Connector Line */}
                            <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />

                            {[
                                { icon: Play, label: 'Trigger: Hire Added', time: 'Instant' },
                                { icon: Terminal, label: 'Action: Create Ticket', time: '+1 min' },
                                { icon: Calendar, label: 'Wait: 2 Days', time: '+48 hrs' },
                                { icon: Mail, label: 'Send Welcome Email', time: 'Auto' },
                                { icon: CheckCircle2, label: 'Task: Assign Buddy', time: 'Manual' },
                            ].map((step, i) => (
                                <div key={i} className="relative flex items-center gap-3 bg-white dark:bg-stellar-blue p-2 rounded-lg z-10">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                        <step.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-ink-black dark:text-pearl">{step.label}</p>
                                        <p className="text-[10px] text-silver-mist font-medium">{step.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Efficiency Score</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">92%</p>
                            <p className="text-[10px] text-emerald-600/80 mt-1">
                                This automated workflow is estimated to save <strong>4.5 hours</strong> of manual work per hire.
                            </p>
                        </div>
                        <button
                            onClick={handleActivate}
                            disabled={loading}
                            className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Activating...' : 'Activate Workflow'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
