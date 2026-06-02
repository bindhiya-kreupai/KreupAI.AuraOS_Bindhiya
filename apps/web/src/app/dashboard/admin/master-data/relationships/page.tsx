'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Relationship {
    id: string;
    name: string;
    type: 'Immediate' | 'Extended' | 'Other';
    status: 'Active' | 'Inactive';
}

const columns: Column<Relationship>[] = [
    { key: 'name', header: 'Relation Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
        key: 'type',
        header: 'Type',
        width: '150px',
        render: (row) => (
            <span className="px-2 py-0.5 rounded-md bg-pearl dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-xs font-medium">
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

export default function RelationshipsPage() {
    const [data, setData] = useState<Relationship[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRelationships = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/relationships?q=${encodeURIComponent(query)}`
                : '/api/master-data/relationships';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Failed to fetch relationships:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRelationships();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Relationship>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/relationships`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/relationships`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchRelationships();
            } else {
                alert('Failed to save relationship');
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Error saving relationship:', error);
            alert('Error saving relationship');
        }
    };

    const handleDelete = async (record: Relationship) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/relationships?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchRelationships();
                } else {
                    alert('Failed to delete relationship');
                }
            } catch (error: any) {
            console.error('Error:', error);
                console.error('Error deleting relationship:', error);
                alert('Error deleting relationship');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('relationships');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search relationships:');
        if (query !== null) {
            fetchRelationships(query);
        }
    };

    return (
        <DataPage<Relationship>
            title="Relationships"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Relationships' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', type: 'Immediate' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Relation Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Spouse"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
                        <select
                            value={record.type || 'Immediate'}
                            onChange={e => onChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Immediate">Immediate</option>
                            <option value="Extended">Extended</option>
                            <option value="Other">Other</option>
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

