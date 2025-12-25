"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type {
    Connection,
    Edge,
    Node} from 'reactflow';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    Controls,
    Background,
    Handle,
    Position,
    ReactFlowProvider,
    Panel,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    Zap,
    Mail,
    MessageSquare,
    Clock,
    UserPlus,
    CheckSquare,
    Slack,
    FileText,
    Settings,
    Play,
    Save,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import { WorkflowService } from '../services';

// --- CUSTOM NODE COMPONENTS ---

const TriggerNode = ({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-xl bg-white dark:bg-stellar-blue border-2 border-celestial-indigo hover:shadow-celestial-indigo/20 transition-shadow w-64">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-celestial-indigo/10 flex items-center justify-center text-celestial-indigo">
                    {data.icon || <Zap className="w-5 h-5" />}
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold text-celestial-indigo tracking-wider">Trigger</div>
                    <div className="font-bold text-sm text-ink-black dark:text-pearl">{data.label}</div>
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-celestial-indigo !border-2 !border-white dark:!border-slate-900" />
        </div>
    );
};

const ActionNode = ({ data }: { data: any }) => {
    return (
        <div className="px-4 py-3 shadow-md rounded-xl bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 w-64 group hover:border-emerald-500 transition-colors">
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-300 dark:!bg-slate-600 !border-2 !border-white dark:!border-slate-900" />

            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.bgColor || 'bg-slate-100'} ${data.iconColor || 'text-slate-500'}`}>
                    {data.icon || <Settings className="w-5 h-5" />}
                </div>
                <div>
                    <div className="text-[10px] uppercase font-bold text-silver-mist tracking-wider">Action</div>
                    <div className="font-bold text-sm text-ink-black dark:text-pearl">{data.label}</div>
                </div>
                <button className="ml-auto p-1 rounded hover:bg-slate-100 dark:hover:bg-deep-cosmos text-silver-mist opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-300 dark:!bg-slate-600 !border-2 !border-white dark:!border-slate-900" />
        </div>
    );
};

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
};

// --- MOCK DATA ---

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'New Employee Hired', icon: <UserPlus className="w-5 h-5" /> },
    },
    {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: { label: 'Create User Account', icon: <UserPlus className="w-5 h-5" />, bgColor: 'bg-indigo-100 dark:bg-indigo-900', iconColor: 'text-indigo-600' },
    },
    {
        id: '3',
        type: 'action',
        position: { x: 100, y: 350 },
        data: { label: 'Send Welcome Email', icon: <Mail className="w-5 h-5" />, bgColor: 'bg-sky-100 dark:bg-sky-900', iconColor: 'text-sky-600' },
    },
    {
        id: '4',
        type: 'action',
        position: { x: 400, y: 350 },
        data: { label: 'Assign Onboarding Task', icon: <CheckSquare className="w-5 h-5" />, bgColor: 'bg-emerald-100 dark:bg-emerald-900', iconColor: 'text-emerald-600' },
    }
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#cbd5e1', strokeWidth: 2 } },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { stroke: '#cbd5e1', strokeWidth: 2 } },
];

const TOOLS = [
    { type: 'trigger', label: 'New Employee', icon: UserPlus, color: 'text-celestial-indigo' },
    { type: 'trigger', label: 'Leave Request', icon: Clock, color: 'text-celestial-indigo' },
    { type: 'action', label: 'Send Email', icon: Mail, color: 'text-sky-500' },
    { type: 'action', label: 'Slack Message', icon: Slack, color: 'text-purple-500' },
    { type: 'action', label: 'Create Task', icon: CheckSquare, color: 'text-emerald-500' },
    { type: 'action', label: 'Update Profile', icon: FileText, color: 'text-amber-500' },
    { type: 'action', label: 'Wait / Delay', icon: Clock, color: 'text-slate-500' },
];

export default function WorkflowDesignerPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const data = await WorkflowService.getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error('Error:', error);
                    } finally {
            setLoading(false);
        }
    };

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)), [setEdges]);

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!reactFlowWrapper.current || !reactFlowInstance) return;

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const dataStr = event.dataTransfer.getData('application/reactflow');

            if (!dataStr) return;

            const { type, label } = JSON.parse(dataStr);

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: { label, icon: <Settings className="w-5 h-5" /> }, // Simplified icon for drop
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    return (
        <ReactFlowProvider>
            <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-4 flex flex-col shadow-sm flex-shrink-0">
                    <h2 className="font-bold text-ink-black dark:text-pearl mb-4">Workflow Tools</h2>

                    <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                        <div>
                            <div className="text-xs font-bold text-silver-mist uppercase mb-3 px-1">Triggers</div>
                            <div className="space-y-2">
                                {TOOLS.filter(t => t.type === 'trigger').map((tool, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-deep-cosmos/50 rounded-lg border border-cloud dark:border-nebula-purple/20 cursor-grab hover:bg-slate-100 hover:border-celestial-indigo transition-colors"
                                        draggable
                                        onDragStart={(e) => onDragStart(e, tool.type, tool.label)}
                                    >
                                        <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                        <span className="text-sm font-medium text-ink-black dark:text-pearl">{tool.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-silver-mist uppercase mb-3 px-1">Actions</div>
                            <div className="space-y-2">
                                {TOOLS.filter(t => t.type === 'action').map((tool, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-deep-cosmos/50 rounded-lg border border-cloud dark:border-nebula-purple/20 cursor-grab hover:bg-slate-100 hover:border-celestial-indigo transition-colors"
                                        draggable
                                        onDragStart={(e) => onDragStart(e, tool.type, tool.label)}
                                    >
                                        <tool.icon className={`w-4 h-4 ${tool.color}`} />
                                        <span className="text-sm font-medium text-ink-black dark:text-pearl">{tool.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-cloud dark:border-nebula-purple/20">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs">
                            💡 Drag blocks to the canvas to build your automation.
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-cloud dark:border-nebula-purple/50 overflow-hidden relative shadow-inner" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-slate-50 dark:bg-slate-900"
                        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
                    >
                        <Controls className="bg-white dark:bg-stellar-blue border-cloud dark:border-nebula-purple/50 shadow-sm" />
                        <Background color="#94a3b8" gap={20} size={1} className="opacity-20" />
                        <Panel position="top-right" className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 rounded-lg text-sm font-medium text-ink-black dark:text-pearl shadow-sm hover:bg-slate-50">
                                <Play className="w-4 h-4 text-emerald-500" /> Test Run
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-celestial-indigo text-white rounded-lg text-sm font-medium shadow-sm hover:bg-celestial-indigo/90">
                                <Save className="w-4 h-4" /> Publish
                            </button>
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </ReactFlowProvider>
    );
}
