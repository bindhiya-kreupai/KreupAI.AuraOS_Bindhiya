'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface TaxRegime {
    id: string;
    code: string;
    name: string;
    country: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<TaxRegime>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'country', header: 'Country', width: '150px', render: (row) => <span className="text-sm">{row.country}</span> },
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

export default function TaxRegimesPage() {
    const [data, setData] = useState<TaxRegime[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTaxRegimes = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/tax-regimes?q=${encodeURIComponent(query)}`
                : '/api/master-data/tax-regimes';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch tax regimes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxRegimes();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<TaxRegime>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/tax-regimes`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/tax-regimes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchTaxRegimes();
            } else {
                alert('Failed to save tax regime');
            }
        } catch {
            logger.error('Error saving tax regime:', error);
            alert('Error saving tax regime');
        }
    };

    const handleDelete = async (record: TaxRegime) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/tax-regimes?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchTaxRegimes();
                } else {
                    alert('Failed to delete tax regime');
                }
            } catch {
                logger.error('Error deleting tax regime:', error);
                alert('Error deleting tax regime');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('tax-regimes');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search tax regimes:');
        if (query !== null) {
            fetchTaxRegimes(query);
        }
    };

    return (
        <DataPage<TaxRegime>
            title="Tax Regimes"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Tax Regimes' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', country: 'India' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. IN_NEW"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. New Tax Regime"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Country</label>
                        <input
                            type="text"
                            value={record.country || ''}
                            onChange={e => onChange('country', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. India"
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
