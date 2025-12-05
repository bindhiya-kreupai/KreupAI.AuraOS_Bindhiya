'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface ShiftType {
    id: string;
    code: string;
    name: string;
    startTime: string;
    endTime: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<ShiftType>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'startTime', header: 'Start Time', width: '100px', render: (row) => <span className="font-mono text-sm">{row.startTime}</span> },
    { key: 'endTime', header: 'End Time', width: '100px', render: (row) => <span className="font-mono text-sm">{row.endTime}</span> },
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

export default function ShiftTypesPage() {
    const [data, setData] = useState<ShiftType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchShiftTypes = async () => {
        try {
            const response = await fetch('/api/master-data/shift-types');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch shift types:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShiftTypes();
    }, []);

    const handleSave = async (record: Partial<ShiftType>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/shift-types`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/shift-types`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchShiftTypes();
            } else {
                alert('Failed to save shift type');
            }
        } catch (error) {
            console.error('Error saving shift type:', error);
            alert('Error saving shift type');
        }
    };

    const handleDelete = async (record: ShiftType) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/shift-types?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchShiftTypes();
                } else {
                    alert('Failed to delete shift type');
                }
            } catch (error) {
                console.error('Error deleting shift type:', error);
                alert('Error deleting shift type');
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
        <DataPage<ShiftType>
            title="Shift Types"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Shift Types' }
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
                            placeholder="e.g. GEN"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. General Shift"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">Start Time</label>
                            <input
                                type="time"
                                value={record.startTime || ''}
                                onChange={e => onChange('startTime', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">End Time</label>
                            <input
                                type="time"
                                value={record.endTime || ''}
                                onChange={e => onChange('endTime', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            />
                        </div>
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
