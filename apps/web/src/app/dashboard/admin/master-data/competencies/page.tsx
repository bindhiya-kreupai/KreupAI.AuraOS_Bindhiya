'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface Competency {
    id: string;
    code: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<Competency>[] = [
    { key: 'code', header: 'Code', width: '120px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', header: 'Description', render: (row) => <span className="text-sm text-silver-mist truncate max-w-xs">{row.description}</span> },
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

export default function CompetenciesPage() {
    const [data, setData] = useState<Competency[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCompetencies = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/competencies?q=${encodeURIComponent(query)}`
                : '/api/master-data/competencies';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch competencies:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompetencies();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Competency>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/competencies`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/competencies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchCompetencies();
            } else {
                alert('Failed to save competency');
            }
        } catch {
            logger.error('Error saving competency:', error);
            alert('Error saving competency');
        }
    };

    const handleDelete = async (record: Competency) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/competencies?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchCompetencies();
                } else {
                    alert('Failed to delete competency');
                }
            } catch {
                logger.error('Error deleting competency:', error);
                alert('Error deleting competency');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('competencies');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search competencies:');
        if (query !== null) {
            fetchCompetencies(query);
        }
    };

    return (
        <DataPage<Competency>
            title="Competencies"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Competencies' }
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
                            placeholder="e.g. COMP_PROB"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Problem Solving"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Ability to solve complex problems"
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
