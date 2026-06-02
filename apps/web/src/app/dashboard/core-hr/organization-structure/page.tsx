"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Network,
    ZoomIn,
    ZoomOut,
    ChevronDown,
    ChevronUp,
    User,
    RefreshCw
} from 'lucide-react';
import { OrganizationService } from '../services';

interface OrgUnit {
    id: string;
    name: string;
    code: string;
    companyName: string | null;
    parentId: string | null;
    parentName: string | null;
    headCount: number;
    children: { id: string; name: string; code: string }[];
}

interface TreeNode extends OrgUnit {
    childNodes: TreeNode[];
}

function buildTree(units: OrgUnit[]): TreeNode[] {
    const unitMap = new Map<string, TreeNode>();

    // Initialize each unit as a tree node
    units.forEach(unit => {
        unitMap.set(unit.id, { ...unit, childNodes: [] });
    });

    const roots: TreeNode[] = [];

    // Assign children to parents
    units.forEach(unit => {
        const node = unitMap.get(unit.id)!;
        if (unit.parentId && unitMap.has(unit.parentId)) {
            unitMap.get(unit.parentId)!.childNodes.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

export default function OrgStructurePage() {
    const [zoom, setZoom] = useState(1);
    const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
    const [units, setUnits] = useState<OrgUnit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const data = await OrganizationService.getAllUnits();
            setUnits(data as unknown as OrgUnit[]);
            // Auto-expand root nodes
            const rootIds: Record<string, boolean> = {};
            data.forEach((u: any) => {
                if (!u.parentId) rootIds[u.id] = true;
            });
            setExpandedNodes(rootIds);
        } catch (error: any) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const tree = useMemo(() => buildTree(units), [units]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setZoom(1);

    const toggleNode = (id: string) => {
        setExpandedNodes(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Network className="w-6 h-6 text-indigo-500" />
                        Organization Structure
                    </h1>
                    <p className="text-slate-500 text-sm">Interactive visual hierarchy and reporting lines.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleZoomOut} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <div className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold flex items-center">
                        {Math.round(zoom * 100)}%
                    </div>
                    <button onClick={handleZoomIn} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button onClick={resetZoom} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-500">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && units.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Network className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No organization units found</p>
                    <p className="text-sm">Data will appear here once records are added.</p>
                </div>
            )}

            {/* Canvas */}
            {!loading && units.length > 0 && (
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 overflow-hidden relative group">
                    <div className="absolute inset-0 flex items-start justify-center overflow-auto cursor-grab active:cursor-grabbing p-8">
                        <div
                            className="flex flex-col items-center transition-transform duration-200 ease-out origin-top"
                            style={{ transform: `scale(${zoom})` }}
                        >
                            {tree.map((rootNode, idx) => (
                                <OrgTreeNode
                                    key={rootNode.id}
                                    node={rootNode}
                                    isRoot={true}
                                    expandedNodes={expandedNodes}
                                    toggleNode={toggleNode}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 pointer-events-none">
                        Use mouse wheel or buttons to zoom
                    </div>
                </div>
            )}
        </div>
    );
}

function OrgTreeNode({
    node,
    isRoot,
    expandedNodes,
    toggleNode,
}: {
    node: TreeNode;
    isRoot: boolean;
    expandedNodes: Record<string, boolean>;
    toggleNode: (id: string) => void;
}) {
    const isExpanded = expandedNodes[node.id] ?? false;
    const hasChildren = node.childNodes.length > 0;

    return (
        <div className="flex flex-col items-center">
            <div
                className={`bg-white dark:bg-slate-900 ${isRoot ? 'border-2 border-indigo-500' : 'border border-slate-200 dark:border-slate-800 hover:border-indigo-300'} p-4 rounded-2xl ${isRoot ? 'shadow-xl w-64' : 'shadow-lg w-48'} text-center relative z-10 transition-all ${isExpanded && !isRoot ? 'ring-2 ring-indigo-500/20 border-indigo-400' : ''} ${hasChildren ? 'cursor-pointer hover:-translate-y-1' : ''}`}
                onClick={() => hasChildren && toggleNode(node.id)}
            >
                <div className={`${isRoot ? 'w-16 h-16' : 'w-12 h-12'} rounded-full overflow-hidden mx-auto mb-2 ${isRoot ? 'border-4 border-indigo-50' : 'border-2 border-slate-100 dark:border-slate-800'} bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center`}>
                    <span className={`${isRoot ? 'text-xl' : 'text-sm'} font-bold text-indigo-600 dark:text-indigo-400`}>
                        {node.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                </div>
                <div className={`font-bold ${isRoot ? 'text-lg' : 'text-sm'} text-slate-800 dark:text-slate-100`}>{node.name}</div>
                <div className={`text-xs ${isRoot ? 'text-indigo-600 font-bold mb-2' : 'text-slate-500 font-bold'}`}>{node.code}</div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 rounded-full py-0.5 px-2 mx-auto w-fit font-bold text-slate-600 dark:text-slate-400">
                    <User className="w-3 h-3" /> {node.headCount} {node.headCount === 1 ? 'Employee' : 'Employees'}
                </div>
                {hasChildren && (
                    <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 ${isRoot ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-indigo-500 hover:text-white'} rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm z-20`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                )}
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col items-center">
                    <div className="h-8 w-px bg-slate-400 dark:bg-slate-600"></div>
                    {node.childNodes.length > 1 && (
                        <>
                            <div className="h-px bg-slate-400 dark:bg-slate-600" style={{ width: `${Math.min(node.childNodes.length * 200, 800)}px` }}></div>
                            <div className="flex justify-between relative" style={{ width: `${Math.min(node.childNodes.length * 200, 800)}px` }}>
                                {node.childNodes.map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-8 w-px bg-slate-400 dark:bg-slate-600 absolute top-0"
                                        style={{ left: node.childNodes.length === 1 ? '50%' : `${(i / (node.childNodes.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
                                    ></div>
                                ))}
                            </div>
                        </>
                    )}
                    <div className="flex gap-8 mt-0">
                        {node.childNodes.map(child => (
                            <OrgTreeNode
                                key={child.id}
                                node={child}
                                isRoot={false}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Single child connector */}
            {hasChildren && isExpanded && node.childNodes.length === 1 && (
                <></>
            )}
        </div>
    );
}

