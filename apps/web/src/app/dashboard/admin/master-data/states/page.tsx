'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface State {
    id: string;
    countryId: string;
    code: string;
    name: string;
}

interface Country {
    id: string;
    name: string;
}

export default function StatesPage() {
    const [data, setData] = useState<State[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/states?q=${encodeURIComponent(query)}`
                : '/api/master-data/states';

            const response = await fetch(url);
            if (response.ok) {
                setData(await response.json());
            }
        } catch {
            logger.error('Failed to fetch states:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Separate function to fetch countries, as fetchData no longer handles it
    const fetchCountries = async () => {
        try {
            const countriesRes = await fetch('/api/master-data/countries');
            if (countriesRes.ok) setCountries(await countriesRes.json());
        } catch {
            logger.error('Failed to fetch countries:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<State>[] = [
        { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
        { key: 'name', header: 'State Name', render: (row) => <span className="font-medium">{row.name}</span> },
        {
            key: 'countryId',
            header: 'Country',
            width: '180px',
            render: (row) => {
                const country = countries.find(c => c.id === row.countryId);
                return <span className="text-sm">{country?.name || &apos;Unknown'}</span>;
            }
        },
    ];

    const handleSave = async (record: Partial<State>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/states`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/states`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData();
            } else {
                alert('Failed to save state');
            }
        } catch {
            logger.error('Error saving state:', error);
            alert('Error saving state');
        }
    };

    const handleDelete = async (record: State) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/states?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete state');
                }
            } catch {
                logger.error('Error deleting state:', error);
                alert('Error deleting state');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('states');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search states:');
        if (query !== null) {
            fetchData(query);
        }
    };

    return (
        <DataPage<State>
            title="States"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'States' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ countryId: '1' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Country</label>
                        <select
                            value={record.countryId || ''}
                            onChange={e => onChange('countryId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select Country</option>
                            {countries.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">State Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. NY"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">State Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. New York"
                        />
                    </div>
                </>
            )}
        />
    );
}
