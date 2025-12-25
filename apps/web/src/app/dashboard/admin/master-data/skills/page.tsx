'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Skill {
    id: string;
    code: string;
    name: string;
    category: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<Skill>[] = [
    { key: 'code', header: 'Code', width: '120px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
        key: 'category',
        header: 'Category',
        width: '150px',
        render: (row) => (
            <span className="px-2 py-0.5 rounded-md bg-pearl dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-xs font-medium">
                {row.category}
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

export default function SkillsPage() {
    const [data, setData] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSkills = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/skills?q=${encodeURIComponent(query)}`
                : '/api/master-data/skills';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch skills:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Skill>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/skills`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/skills`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchSkills();
            } else {
                alert('Failed to save skill');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving skill:', error);
            alert('Error saving skill');
        }
    };

    const handleDelete = async (record: Skill) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/skills?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchSkills();
                } else {
                    alert('Failed to delete skill');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting skill:', error);
                alert('Error deleting skill');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('skills');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search skills:');
        if (query !== null) {
            fetchSkills(query);
        }
    };

    return (
        <DataPage<Skill>
            title="Skills"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Skills' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', category: 'Technical' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. SK_REACT"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. React.js"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Category</label>
                        <select
                            value={record.category || 'Technical'}
                            onChange={e => onChange('category', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Technical">Technical</option>
                            <option value="Soft Skill">Soft Skill</option>
                            <option value="Design">Design</option>
                            <option value="Management">Management</option>
                            <option value="Other">Other</option>
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
