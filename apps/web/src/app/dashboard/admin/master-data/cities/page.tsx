'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface City {
    id: string;
    stateId: string;
    name: string;
}

interface State {
    id: string;
    name: string;
}

export default function CitiesPage() {
    const [data, setData] = useState<City[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/cities?q=${encodeURIComponent(query)}`
                : '/api/master-data/cities';

            const [citiesRes, statesRes] = await Promise.all([
                fetch(url),
                fetch('/api/master-data/states')
            ]);

            if (citiesRes.ok) setData(await citiesRes.json());
            if (statesRes.ok) setStates(await statesRes.json());
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<City>[] = [
        { key: 'name', header: 'City Name', render: (row) => <span className="font-medium">{row.name}</span> },
        {
            key: 'stateId',
            header: 'State',
            width: '180px',
            render: (row) => {
                const state = states.find(s => s.id === row.stateId);
                return <span className="text-sm">{state?.name || 'Unknown'}</span>;
            }
        },
    ];

    const handleSave = async (record: Partial<City>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/cities`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/cities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData();
            } else {
                alert('Failed to save city');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving city:', error);
            alert('Error saving city');
        }
    };

    const handleDelete = async (record: City) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/cities?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete city');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting city:', error);
                alert('Error deleting city');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('cities');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search cities:');
        if (query !== null) {
            fetchData(query);
        }
    };

    return (
        <DataPage<City>
            title="Cities"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Cities' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ stateId: '1' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">State</label>
                        <select
                            value={record.stateId || ''}
                            onChange={e => onChange('stateId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select State</option>
                            {states.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">City Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. New York City"
                        />
                    </div>
                </>
            )}
        />
    );
}
