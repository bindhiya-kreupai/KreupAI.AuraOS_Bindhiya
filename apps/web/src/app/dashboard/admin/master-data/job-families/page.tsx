'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface JobFamily {
    id: string;
    jobFunctionId: string;
    code: string;
    name: string;
}

interface JobFunction {
    id: string;
    name: string;
}

export default function JobFamiliesPage() {
    const [data, setData] = useState<JobFamily[]>([]);
    const [jobFunctions, setJobFunctions] = useState<JobFunction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/job-families?q=${encodeURIComponent(query)}`
                : '/api/master-data/job-families';

            const [familiesRes, functionsRes] = await Promise.all([
                fetch(url),
                fetch('/api/master-data/job-functions')
            ]);

            if (familiesRes.ok) setData(await familiesRes.json());
            if (functionsRes.ok) setJobFunctions(await functionsRes.json());
        } catch (error) {
            logger.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<JobFamily>[] = [
        { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
        {
            key: 'jobFunctionId',
            header: 'Job Function',
            width: '180px',
            render: (row) => {
                const func = jobFunctions.find(f => f.id === row.jobFunctionId);
                return <span className="text-sm">{func?.name || 'Unknown'}</span>;
            }
        },
    ];

    const handleSave = async (record: Partial<JobFamily>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/job-families`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/job-families`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData();
            } else {
                alert('Failed to save job family');
            }
        } catch (error) {
            logger.error('Error saving job family:', error);
            alert('Error saving job family');
        }
    };

    const handleDelete = async (record: JobFamily) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/job-families?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete job family');
                }
            } catch (error) {
                logger.error('Error deleting job family:', error);
                alert('Error deleting job family');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('job-families');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search job families:');
        if (query !== null) {
            fetchData(query);
        }
    };

    return (
        <DataPage<JobFamily>
            title="Job Families"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Job Families' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Job Function</label>
                        <select
                            value={record.jobFunctionId || ''}
                            onChange={e => onChange('jobFunctionId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select Job Function</option>
                            {jobFunctions.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. JF-BE"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Backend Engineering"
                        />
                    </div>

                </>
            )
            }
        />
    );
}
