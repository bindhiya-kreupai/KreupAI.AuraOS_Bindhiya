'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface ExitReason {
    id: string;
    reason: string;
    type: 'Voluntary' | 'Involuntary';
    status: 'Active' | 'Inactive';
}

const columns: Column<ExitReason>[] = [
    { key: 'reason', header: 'Reason', render: (row) => <span className="font-medium">{row.reason}</span> },
    {
        key: 'type',
        header: 'Type',
        width: '150px',
        render: (row) => (
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${row.type === 'Voluntary' ? 'bg-neural-mint/10 text-neural-mint' : 'bg-sunset-orange/10 text-sunset-orange'
                }`}>
                {row.type}
            </span>
        )
    },
    {
        key: 'status',
        header: 'Status',
        width: '100px',
        render: (row) => (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'Active' ? 'bg-neural-mint/10 text-neural-mint' : 'bg-silver-mist/10 text-silver-mist'
                }`}>
                {row.status}
            </span>
        )
    },
];

export default function ExitReasonsPage() {
    const [data, setData] = useState<ExitReason[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchExitReasons = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/exit-reasons?q=${encodeURIComponent(query)}`
                : '/api/master-data/exit-reasons';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch exit reasons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExitReasons();
    }, []);

    const handleSave = async (record: Partial<ExitReason>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/exit-reasons`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/exit-reasons`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchExitReasons();
            } else {
                alert('Failed to save exit reason');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving exit reason:', error);
            alert('Error saving exit reason');
        }
    };

    const handleDelete = async (record: ExitReason) => {
        if (confirm(`Are you sure you want to delete ${record.reason}?`)) {
            try {
                const response = await fetch(`/api/master-data/exit-reasons?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchExitReasons();
                } else {
                    alert('Failed to delete exit reason');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting exit reason:', error);
                alert('Error deleting exit reason');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('exit-reasons');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search exit reasons:');
        if (query !== null) {
            fetchExitReasons(query);
        }
    };

    return (
        <DataPage<ExitReason>
            title="Exit Reasons"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Exit Reasons' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', type: 'Voluntary' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Reason</label>
                        <input
                            type="text"
                            value={record.reason || ''}
                            onChange={e => onChange('reason', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Better Opportunity"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
                        <select
                            value={record.type || 'Voluntary'}
                            onChange={e => onChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Voluntary">Voluntary</option>
                            <option value="Involuntary">Involuntary</option>
                        </select>
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

