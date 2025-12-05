'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface PayComponent {
    id: string;
    code: string;
    name: string;
    type: 'Earning' | 'Deduction';
    status: 'Active' | 'Inactive';
}

const columns: Column<PayComponent>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
        key: 'type',
        header: 'Type',
        width: '120px',
        render: (row) => (
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${row.type === 'Earning' ? 'bg-neural-mint/10 text-neural-mint' : 'bg-sunset-orange/10 text-sunset-orange'
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

export default function PayComponentsPage() {
    const [data, setData] = useState<PayComponent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPayComponents = async () => {
        try {
            const response = await fetch('/api/master-data/pay-components');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch pay components:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPayComponents();
    }, []);

    const handleSave = async (record: Partial<PayComponent>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/pay-components`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/pay-components`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchPayComponents();
            } else {
                alert('Failed to save pay component');
            }
        } catch (error) {
            console.error('Error saving pay component:', error);
            alert('Error saving pay component');
        }
    };

    const handleDelete = async (record: PayComponent) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/pay-components?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchPayComponents();
                } else {
                    alert('Failed to delete pay component');
                }
            } catch (error) {
                console.error('Error deleting pay component:', error);
                alert('Error deleting pay component');
            }
        }
    };

    const handleExport = () => {
        alert('Export functionality coming soon!');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        alert('Advanced filter functionality coming soon!');
    };

    return (
        <DataPage<PayComponent>
            title="Pay Components"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Pay Components' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', type: 'Earning' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. BASIC"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Basic Salary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
                        <select
                            value={record.type || 'Earning'}
                            onChange={e => onChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Earning">Earning</option>
                            <option value="Deduction">Deduction</option>
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
