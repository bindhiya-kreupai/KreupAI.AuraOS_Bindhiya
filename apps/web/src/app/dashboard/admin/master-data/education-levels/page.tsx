'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface EducationLevel {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<EducationLevel>[] = [
    { key: 'name', header: 'Level Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', header: 'Description', render: (row) => <span className="text-sm text-silver-mist">{row.description}</span> },
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

export default function EducationLevelsPage() {
    const [data, setData] = useState<EducationLevel[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEducationLevels = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/education-levels?q=${encodeURIComponent(query)}`
                : '/api/master-data/education-levels';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch education levels:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEducationLevels();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<EducationLevel>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/education-levels`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/education-levels`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchEducationLevels();
            } else {
                alert('Failed to save education level');
            }
        } catch {
            logger.error('Error saving education level:', error);
            alert('Error saving education level');
        }
    };

    const handleDelete = async (record: EducationLevel) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/education-levels?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchEducationLevels();
                } else {
                    alert('Failed to delete education level');
                }
            } catch {
                logger.error('Error deleting education level:', error);
                alert('Error deleting education level');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('education-levels');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search education levels:');
        if (query !== null) {
            fetchEducationLevels(query);
        }
    };

    return (
        <DataPage<EducationLevel>
            title="Education Levels"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Education Levels' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Level Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Bachelors Degree"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Undergraduate academic degree"
                            rows={3}
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
