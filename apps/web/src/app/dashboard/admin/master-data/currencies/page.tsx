'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<Currency>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'symbol', header: 'Symbol', width: '100px', render: (row) => <span className="font-mono text-lg">{row.symbol}</span> },
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

export default function CurrenciesPage() {
    const [data, setData] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCurrencies = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/currencies?q=${encodeURIComponent(query)}`
                : '/api/master-data/currencies';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch currencies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const handleSave = async (record: Partial<Currency>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/currencies`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/currencies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchCurrencies();
            } else {
                alert('Failed to save currency');
            }
        } catch {
            logger.error('Error saving currency:', error);
            alert('Error saving currency');
        }
    };

    const handleDelete = async (record: Currency) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/currencies?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchCurrencies();
                } else {
                    alert('Failed to delete currency');
                }
            } catch {
                logger.error('Error deleting currency:', error);
                alert('Error deleting currency');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('currencies');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search currencies:');
        if (query !== null) {
            fetchCurrencies(query);
        }
    };

    return (
        <DataPage<Currency>
            title="Currencies"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Currencies' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Currency Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. USD"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Currency Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. US Dollar"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Symbol</label>
                        <input
                            type="text"
                            value={record.symbol || ''}
                            onChange={e => onChange('symbol', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. $"
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
