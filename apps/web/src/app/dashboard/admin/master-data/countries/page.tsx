'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface Country {
    id: string;
    isoCode: string;
    name: string;
    currency: string;
}

const columns: Column<Country>[] = [
    { key: 'isoCode', header: 'ISO Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.isoCode}</span> },
    { key: 'name', header: 'Country Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'currency', header: 'Currency', width: '100px', render: (row) => <span className="font-mono text-xs text-silver-mist">{row.currency}</span> },
];

export default function CountriesPage() {
    const [data, setData] = useState<Country[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCountries = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/countries?q=${encodeURIComponent(query)}`
                : '/api/master-data/countries';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            logger.error('Failed to fetch countries:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Country>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/countries`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/countries`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchCountries();
            } else {
                alert('Failed to save country');
            }
        } catch (error) {
            logger.error('Error saving country:', error);
            alert('Error saving country');
        }
    };

    const handleDelete = async (record: Country) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/countries?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchCountries();
                } else {
                    alert('Failed to delete country');
                }
            } catch (error) {
                logger.error('Error deleting country:', error);
                alert('Error deleting country');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('countries');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search countries:');
        if (query !== null) {
            fetchCountries(query);
        }
    };

    return (
        <DataPage<Country>
            title="Countries"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Countries' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{}}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">ISO Code</label>
                        <input
                            type="text"
                            value={record.isoCode || ''}
                            onChange={e => onChange('isoCode', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. US"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Country Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. United States"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Currency</label>
                        <input
                            type="text"
                            value={record.currency || ''}
                            onChange={e => onChange('currency', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. USD"
                        />
                    </div>
                </>
            )}
        />
    );
}
