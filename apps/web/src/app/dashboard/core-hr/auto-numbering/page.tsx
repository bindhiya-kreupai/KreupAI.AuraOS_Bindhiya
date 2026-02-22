"use client";

import React, { useState, useEffect } from 'react';
import {
    Hash,
    Save,
    RotateCcw,
    CheckCircle2
} from 'lucide-react';
import { AutoNumberService } from '../services';
import type { AutoNumberSequence } from '../types';

interface SettingsRow {
    entity: string;
    prefix: string;
    digits: number;
    next: string;
    example: string;
}

const defaultSettings: SettingsRow[] = [
    { entity: 'Employee ID', prefix: 'EMP-', digits: 4, next: '0042', example: 'EMP-0042' },
    { entity: 'Department ID', prefix: 'DEPT-', digits: 3, next: '012', example: 'DEPT-012' },
    { entity: 'Position ID', prefix: 'POS-', digits: 5, next: '00104', example: 'POS-00104' },
];

const formatEntityType = (entityType: string): string => {
    return entityType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' ID';
};

const sequenceToSettingsRow = (seq: AutoNumberSequence): SettingsRow => {
    const nextStr = String(seq.currentNumber).padStart(seq.numberLength, '0');
    return {
        entity: formatEntityType(seq.entityType),
        prefix: seq.prefix,
        digits: seq.numberLength,
        next: nextStr,
        example: `${seq.prefix}${nextStr}`,
    };
};

export default function AutoNumberingPage() {
    const [saved, setSaved] = useState(false);
    const [sequences, setSequences] = useState<AutoNumberSequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<SettingsRow[]>([]);

    useEffect(() => {
        fetchSequences();
    }, []);

    const fetchSequences = async () => {
        try {
            const data = await AutoNumberService.getAllSequences();
            setSequences(data);
            if (data.length > 0) {
                setSettings(data.map(sequenceToSettingsRow));
            } else {
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Error:', error);
            setSettings(defaultSettings);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newSettings = [...settings];
        // @ts-ignore
        newSettings[index][field] = field === 'digits' ? Number(value) : value;
        // Update example
        const item = newSettings[index];
        const nextPadded = String(item.next).padStart(item.digits, '0');
        item.example = `${item.prefix}${nextPadded}`;
        setSettings(newSettings);
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Hash className="w-6 h-6 text-indigo-500" />
                        Auto-Numbering Series
                    </h1>
                    <p className="text-slate-500 text-sm">Configure automatic ID generation for system entities.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            )}

            {!loading && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Prefix</th>
                                    <th className="px-6 py-4">Digit Count</th>
                                    <th className="px-6 py-4">Start/Next Sequence</th>
                                    <th className="px-6 py-4">Preview</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {settings.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-bold">{row.entity}</td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={row.prefix}
                                                onChange={(e) => handleChange(i, 'prefix', e.target.value)}
                                                className="w-24 p-2 border border-slate-200 dark:border-slate-700 rounded bg-transparent font-mono focus:ring-2 ring-indigo-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={row.digits}
                                                onChange={(e) => handleChange(i, 'digits', e.target.value)}
                                                className="w-16 p-2 border border-slate-200 dark:border-slate-700 rounded bg-transparent font-mono focus:ring-2 ring-indigo-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={row.next}
                                                onChange={(e) => handleChange(i, 'next', e.target.value)}
                                                className="w-24 p-2 border border-slate-200 dark:border-slate-700 rounded bg-transparent font-mono focus:ring-2 ring-indigo-500 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
                                                {row.example}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600">
                    <Hash className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-700 dark:text-indigo-300">Note on Resetting Sequences</h4>
                    <p className="text-sm text-indigo-600/80 dark:text-indigo-400">Changing the "Start/Next Sequence" to a lower value than currently existing records may cause duplication errors. Proceed with caution.</p>
                </div>
            </div>
        </div>
    );
}

