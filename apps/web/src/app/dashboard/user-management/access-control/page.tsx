'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface AccessControl {
    id: string;
    name: string;
    type: string;
    value: string;
    status: string;
}

export default function AccessControlPage() {
    const [data, setData] = useState<AccessControl[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/access-control');
            if (res.ok) setData(await res.json());
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Failed to fetch access controls:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<AccessControl>[] = [
        { key: 'name', header: 'Rule Name', render: (row) => <span className="font-medium">{row.name}</span> },
        { key: 'type', header: 'Type', width: '150px' },
        { key: 'value', header: 'Value' },
        {
            key: 'status',
            header: 'Status',
            width: '120px',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleSave = async (record: Partial<AccessControl>) => {
        try {
            const method = record.id ? 'PUT' : 'POST';
            const response = await fetch('/api/access-control', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });

            if (response.ok) {
                fetchData();
            } else {
                const error = await response.json();
                alert(`Failed to save rule: ${error.error}`);
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Error saving rule:', error);
            alert('Error saving rule');
        }
    };

    const handleDelete = async (record: AccessControl) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/access-control?id=${record.id}`, { method: 'DELETE' });
                if (response.ok) fetchData();
                else alert('Failed to delete rule');
            } catch (error: any) {
            console.error('Error:', error);
                console.error('Error deleting rule:', error);
                alert('Error deleting rule');
            }
        }
    };

    return (
        <DataPage<AccessControl>
            title="Access Control"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Access Control' }]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            defaultValues={{ status: 'Active', type: 'IP_RANGE' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Rule Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Office IP Range"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
                        <select
                            value={record.type || 'IP_RANGE'}
                            onChange={e => onChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="IP_RANGE">IP Range</option>
                            <option value="TIME_WINDOW">Time Window</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Value</label>
                        <input
                            type="text"
                            value={record.value || ''}
                            onChange={e => onChange('value', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder={record.type === 'IP_RANGE' ? 'e.g. 192.168.1.0/24' : 'e.g. 09:00-18:00'}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Status</label>
                        <select
                            value={record.status || 'Active'}
                            onChange={e => onChange('status', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </>
            )}
        />
    );
}

