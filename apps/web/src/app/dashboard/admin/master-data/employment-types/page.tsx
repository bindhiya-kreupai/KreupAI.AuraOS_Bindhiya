'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface EmploymentType {
    id: string;
    code: string;
    name: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<EmploymentType>[] = [
    { key: 'code', header: 'Code', width: '120px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
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

export default function EmploymentTypesPage() {
    const [data, setData] = useState<EmploymentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEmploymentTypes = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/employment-types?q=${encodeURIComponent(query)}`
                : '/api/master-data/employment-types';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch employment types:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmploymentTypes();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<EmploymentType>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/employment-types`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/employment-types`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchEmploymentTypes();
            } else {
                alert('Failed to save employment type');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving employment type:', error);
            alert('Error saving employment type');
        }
    };

    const handleDelete = async (record: EmploymentType) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/employment-types?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchEmploymentTypes();
                } else {
                    alert('Failed to delete employment type');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting employment type:', error);
                alert('Error deleting employment type');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('employment-types');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search employment types:');
        if (query !== null) {
            fetchEmploymentTypes(query);
        }
    };

    return (
        <DataPage<EmploymentType>
            title="Employment Types"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Employment Types' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. FULL_TIME"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Full Time"
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
