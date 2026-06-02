'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Holiday {
    id: string;
    name: string;
    date: string;
    type: 'National' | 'Regional' | 'Optional';
    status: 'Active' | 'Inactive';
}

const columns: Column<Holiday>[] = [
    { key: 'name', header: 'Holiday Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'date', header: 'Date', width: '120px', render: (row) => <span className="font-mono text-sm">{row.date}</span> },
    {
        key: 'type',
        header: 'Type',
        width: '120px',
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

export default function HolidaysPage() {
    const [data, setData] = useState<Holiday[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHolidays = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/holidays?q=${encodeURIComponent(query)}`
                : '/api/master-data/holidays';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Failed to fetch holidays:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Holiday>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/holidays`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/holidays`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchHolidays();
            } else {
                alert('Failed to save holiday');
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Error saving holiday:', error);
            alert('Error saving holiday');
        }
    };

    const handleDelete = async (record: Holiday) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/holidays?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchHolidays();
                } else {
                    alert('Failed to delete holiday');
                }
            } catch (error: any) {
            console.error('Error:', error);
                console.error('Error deleting holiday:', error);
                alert('Error deleting holiday');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('holidays');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search holidays:');
        if (query !== null) {
            fetchHolidays(query);
        }
    };

    return (
        <DataPage<Holiday>
            title="Holidays"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Holidays' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', type: 'National' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Holiday Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. New Year"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Date</label>
                        <input
                            type="date"
                            value={record.date || ''}
                            onChange={e => onChange('date', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Type</label>
                        <select
                            value={record.type || 'National'}
                            onChange={e => onChange('type', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="National">National</option>
                            <option value="Regional">Regional</option>
                            <option value="Optional">Optional</option>
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

