'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface Grade {
    id: string;
    code: string;
    name: string;
    level: number;
}

const columns: Column<Grade>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
        key: 'level',
        header: 'Level',
        width: '100px',
        render: (row) => (
            <div className="flex items-center gap-1">
                <div className="h-1.5 w-16 bg-cloud dark:bg-nebula-purple/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-celestial-indigo"
                        style={{ width: `${(row.level / 10) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-silver-mist">{row.level}</span>
            </div>
        )
    },
];

export default function GradesPage() {
    const [data, setData] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchGrades = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/grades?q=${encodeURIComponent(query)}`
                : '/api/master-data/grades';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch grades:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Grade>) => {
        try {
            // Ensure level is a number
            const payload = { ...record, level: Number(record.level) };

            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/grades`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`/api/master-data/grades`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (response.ok) {
                fetchGrades();
            } else {
                alert('Failed to save grade');
            }
        } catch {
            logger.error('Error saving grade:', error);
            alert('Error saving grade');
        }
    };

    const handleDelete = async (record: Grade) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/grades?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchGrades();
                } else {
                    alert('Failed to delete grade');
                }
            } catch {
                logger.error('Error deleting grade:', error);
                alert('Error deleting grade');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('grades');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search grades:');
        if (query !== null) {
            fetchGrades(query);
        }
    };

    return (
        <DataPage<Grade>
            title="Grades"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Grades' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ level: 1 }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. L1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Intern"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Level (1-10)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={record.level || 1}
                            onChange={e => onChange('level', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                </>
            )}
        />
    );
}
