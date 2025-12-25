'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Language {
    id: string;
    code: string;
    name: string;
    nativeName: string;
    status: 'Active' | 'Inactive';
}

const columns: Column<Language>[] = [
    { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'nativeName', header: 'Native Name', render: (row) => <span className="text-silver-mist">{row.nativeName}</span> },
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

export default function LanguagesPage() {
    const [data, setData] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLanguages = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/languages?q=${encodeURIComponent(query)}`
                : '/api/master-data/languages';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch languages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Language>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/languages`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/languages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchLanguages();
            } else {
                alert('Failed to save language');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving language:', error);
            alert('Error saving language');
        }
    };

    const handleDelete = async (record: Language) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/languages?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchLanguages();
                } else {
                    alert('Failed to delete language');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting language:', error);
                alert('Error deleting language');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('languages');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search languages:');
        if (query !== null) {
            fetchLanguages(query);
        }
    };

    return (
        <DataPage<Language>
            title="Languages"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Languages' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Language Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. en"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Language Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. English"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Native Name</label>
                        <input
                            type="text"
                            value={record.nativeName || ''}
                            onChange={e => onChange('nativeName', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. English"
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
