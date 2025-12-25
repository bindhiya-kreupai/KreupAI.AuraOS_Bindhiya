'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface JobProfile {
    id: string;
    jobFamilyId: string;
    code: string;
    name: string;
    description: string;
    minGradeId?: string;
    maxGradeId?: string;
}

interface JobFamily {
    id: string;
    name: string;
}

interface Grade {
    id: string;
    name: string;
    code: string;
}

export default function JobProfilesPage() {
    const [data, setData] = useState<JobProfile[]>([]);
    const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/job-profiles?q=${encodeURIComponent(query)}`
                : '/api/master-data/job-profiles';

            const [profilesRes, familiesRes, gradesRes] = await Promise.all([
                fetch(url),
                fetch('/api/master-data/job-families'),
                fetch('/api/master-data/grades')
            ]);

            if (profilesRes.ok) setData(await profilesRes.json());
            if (familiesRes.ok) setJobFamilies(await familiesRes.json());
            if (gradesRes.ok) setGrades(await gradesRes.json());
        } catch {
            logger.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<JobProfile>[] = [
        { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
        {
            key: 'jobFamilyId',
            header: 'Job Family',
            width: '180px',
            render: (row) => {
                const family = jobFamilies.find(f => f.id === row.jobFamilyId);
                return <span className="text-sm">{family?.name || &apos;Unknown'}</span>;
            }
        },
        {
            key: 'minGradeId',
            header: 'Grade Range',
            width: '150px',
            render: (row) => {
                const min = grades.find(g => g.id === row.minGradeId)?.code;
                const max = grades.find(g => g.id === row.maxGradeId)?.code;
                return <span className="text-xs font-mono text-silver-mist">{min || &apos;?'} - {max || '?'}</span>;
            }
        },
    ];

    const handleSave = async (record: Partial<JobProfile>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/job-profiles`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/job-profiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData();
            } else {
                alert('Failed to save job profile');
            }
        } catch {
            logger.error('Error saving job profile:', error);
            alert('Error saving job profile');
        }
    };

    const handleDelete = async (record: JobProfile) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/job-profiles?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete job profile');
                }
            } catch {
                logger.error('Error deleting job profile:', error);
                alert('Error deleting job profile');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('job-profiles');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search job profiles:');
        if (query !== null) {
            fetchData(query);
        }
    };

    return (
        <DataPage<JobProfile>
            title="Job Profiles"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Job Profiles' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Job Family</label>
                        <select
                            value={record.jobFamilyId || ''}
                            onChange={e => onChange('jobFamilyId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select Job Family</option>
                            {jobFamilies.map(f => (
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
                            placeholder="e.g. JP-SDE-1"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Software Development Engineer I"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none min-h-[100px]"
                            placeholder="Enter description..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">Min Grade</label>
                            <select
                                value={record.minGradeId || ''}
                                onChange={e => onChange('minGradeId', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            >
                                <option value="">Select Min Grade</option>
                                {grades.map(g => (
                                    <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">Max Grade</label>
                            <select
                                value={record.maxGradeId || ''}
                                onChange={e => onChange('maxGradeId', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            >
                                <option value="">Select Max Grade</option>
                                {grades.map(g => (
                                    <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}
        />
    );
}
