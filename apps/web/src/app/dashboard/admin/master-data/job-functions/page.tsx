'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface JobFunction {
    id: string;
    code: string;
    name: string;
    employeeCount: number;
}

const columns: Column<JobFunction>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'employeeCount', header: 'Employees', width: '120px', render: (row) => <span className="text-silver-mist">{row.employeeCount || 0}</span> },
];

export default function JobFunctionsPage() {
    const [data, setData] = useState<JobFunction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobFunctions = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/job-functions?q=${encodeURIComponent(query)}`
                : '/api/master-data/job-functions';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch job functions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobFunctions();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<JobFunction>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/job-functions`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/job-functions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchJobFunctions();
            } else {
                alert('Failed to save job function');
            }
        } catch {
            logger.error('Error saving job function:', error);
            alert('Error saving job function');
        }
    };

    const handleDelete = async (record: JobFunction) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/job-functions?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchJobFunctions();
                } else {
                    alert('Failed to delete job function');
                }
            } catch {
                logger.error('Error deleting job function:', error);
                alert('Error deleting job function');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('job-functions');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search job functions:');
        if (query !== null) {
            fetchJobFunctions(query);
        }
    };

    return (
        <DataPage<JobFunction>
            title="Job Functions"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Job Functions' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. ENG"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Engineering"
                        />
                    </div>
                </>
            )}
        />
    );
}
