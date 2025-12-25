'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Bank {
    id: string;
    name: string;
    swiftCode: string;
    branchName: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<Bank>[] = [
    { key: 'name', header: 'Bank Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'swiftCode', header: 'SWIFT / IFSC', width: '150px', render: (row) => <span className="font-mono text-xs">{row.swiftCode}</span> },
    { key: 'branchName', header: 'Branch', render: (row) => <span className="text-sm text-silver-mist">{row.branchName}</span> },
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

export default function BanksPage() {
    const [data, setData] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBanks = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/banks?q=${encodeURIComponent(query)}`
                : '/api/master-data/banks';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch banks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    const handleSave = async (record: Partial<Bank>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/banks`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/banks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchBanks(); // Refresh data
            } else {
                alert('Failed to save bank');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving bank:', error);
            alert('Error saving bank');
        }
    };

    const handleDelete = async (record: Bank) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/banks?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchBanks(); // Refresh data
                } else {
                    alert('Failed to delete bank');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting bank:', error);
                alert('Error deleting bank');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('banks');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search banks:');
        if (query !== null) {
            fetchBanks(query);
        }
    };

    return (
        <DataPage<Bank>
            title="Banks"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Banks' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Chase Bank"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">SWIFT / IFSC Code</label>
                        <input
                            type="text"
                            value={record.swiftCode || ''}
                            onChange={e => onChange('swiftCode', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. CHASUS33"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Branch Name</label>
                        <input
                            type="text"
                            value={record.branchName || ''}
                            onChange={e => onChange('branchName', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. New York Main"
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
