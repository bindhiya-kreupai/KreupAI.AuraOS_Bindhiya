'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface BusinessUnit {
    id: string;
    code: string;
    name: string;
    head: string; // Changed from headOfBU to match schema
    status: 'Active' | 'Inactive';
}

const columns: Column<BusinessUnit>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'head', header: 'Head of BU', render: (row) => <span className="text-sm">{row.head}</span> },
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

export default function BusinessUnitsPage() {
    const [data, setData] = useState<BusinessUnit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBusinessUnits = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/business-units?q=${encodeURIComponent(query)}`
                : '/api/master-data/business-units';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch business units:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessUnits();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<BusinessUnit>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/business-units`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/business-units`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchBusinessUnits();
            } else {
                alert('Failed to save business unit');
            }
        } catch (error) {
            console.error('Error saving business unit:', error);
            alert('Error saving business unit');
        }
    };

    const handleDelete = async (record: BusinessUnit) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/business-units?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchBusinessUnits();
                } else {
                    alert('Failed to delete business unit');
                }
            } catch (error) {
                console.error('Error deleting business unit:', error);
                alert('Error deleting business unit');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('business-units');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search business units:');
        if (query !== null) {
            fetchBusinessUnits(query);
        }
    };

    return (
        <DataPage<BusinessUnit>
            title="Business Units"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Business Units' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">BU Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. BU_ENT"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">BU Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Enterprise Solutions"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Head of BU</label>
                        <input
                            type="text"
                            value={record.head || ''}
                            onChange={e => onChange('head', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. John Doe"
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
