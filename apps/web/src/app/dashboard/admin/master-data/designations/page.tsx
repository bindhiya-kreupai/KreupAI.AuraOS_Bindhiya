'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface Designation {
    id: string;
    code: string;
    name: string;
    gradeId?: string;
    status: 'Active' | 'Inactive';
}

// Mock Grades - TODO: Fetch from API
const grades = [
    { id: '1', name: 'L1 - Intern' },
    { id: '2', name: 'L2 - Associate' },
    { id: '3', name: 'L3 - Senior' },
    { id: '4', name: 'L4 - Lead' },
    { id: '5', name: 'L5 - Manager' },
];

const columns: Column<Designation>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
        key: 'gradeId',
        header: 'Grade',
        width: '150px',
        render: (row) => {
            const grade = grades.find(g => g.id === row.gradeId);
            return <span className="text-sm text-silver-mist">{grade?.name || &apos;-'}</span>;
        }
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

export default function DesignationsPage() {
    const [data, setData] = useState<Designation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDesignations = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/designations?q=${encodeURIComponent(query)}`
                : '/api/master-data/designations';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch designations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Designation>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/designations`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/designations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchDesignations();
            } else {
                alert('Failed to save designation');
            }
        } catch {
            logger.error('Error saving designation:', error);
            alert('Error saving designation');
        }
    };

    const handleDelete = async (record: Designation) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/designations?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchDesignations();
                } else {
                    alert('Failed to delete designation');
                }
            } catch {
                logger.error('Error deleting designation:', error);
                alert('Error deleting designation');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('designations');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search designations:');
        if (query !== null) {
            fetchDesignations(query);
        }
    };

    return (
        <DataPage<Designation>
            title="Designations"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Designations' }
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
                            placeholder="e.g. DES_SWE"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Software Engineer"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Grade (Optional)</label>
                        <select
                            value={record.gradeId || ''}
                            onChange={e => onChange('gradeId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="">Select Grade</option>
                            {grades.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
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
