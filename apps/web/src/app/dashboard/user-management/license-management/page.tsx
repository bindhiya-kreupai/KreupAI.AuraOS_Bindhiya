'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface License {
    id: string;
    name: string;
    total: number;
    used: number;
    type: string;
    status: string;
}

export default function LicensePage() {
    const [data, setData] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/licenses');
            if (res.ok) setData(await res.json());
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch licenses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<License>[] = [
        { key: 'name', header: 'License Name', render: (row) => <span className="font-medium">{row.name}</span> },
        { key: 'type', header: 'Type' },
        {
            key: 'usage',
            header: 'Usage',
            width: '200px',
            render: (row) => (
                <div className="w-full">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{row.used} / {row.total}</span>
                        <span>{Math.round((row.used / row.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-cloud dark:bg-nebula-purple/20 rounded-full h-2">
                        <div
                            className="bg-celestial-indigo h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((row.used / row.total) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleSave = async (record: Partial<License>) => {
        try {
            const response = await fetch('/api/licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });

            if (response.ok) {
                fetchData();
            } else {
                const error = await response.json();
                alert(`Failed to save license: ${error.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving license:', error);
            alert('Error saving license');
        }
    };

    return (
        <DataPage<License>
            title="License Management"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Licenses' }]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={undefined} // No delete for licenses in this view
            defaultValues={{ status: 'Active', type: 'Per User', used: 0 }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">License Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Core HR"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Total Seats</label>
                        <input
                            type="number"
                            value={record.total || 0}
                            onChange={e => onChange('total', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
                        <select
                            value={record.type || 'Per User'}
                            onChange={e => onChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Per User">Per User</option>
                            <option value="Per Recruiter">Per Recruiter</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>
                </>
            )}
        />
    );
}
