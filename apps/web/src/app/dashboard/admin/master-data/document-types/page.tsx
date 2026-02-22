'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface DocumentType {
    id: string;
    code: string;
    name: string;
    category: 'Personal' | 'Professional' | 'Education' | 'Other';
    status: 'Active' | 'Inactive';
}

const columns: Column<DocumentType>[] = [
    { key: 'code', header: 'Code', width: '120px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    {
        key: 'category',
        header: 'Category',
        width: '120px',
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

export default function DocumentTypesPage() {
    const [data, setData] = useState<DocumentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocumentTypes = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/document-types?q=${encodeURIComponent(query)}`
                : '/api/master-data/document-types';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch document types:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<DocumentType>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/document-types`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/document-types`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchDocumentTypes();
            } else {
                alert('Failed to save document type');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving document type:', error);
            alert('Error saving document type');
        }
    };

    const handleDelete = async (record: DocumentType) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/document-types?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchDocumentTypes();
                } else {
                    alert('Failed to delete document type');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting document type:', error);
                alert('Error deleting document type');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('document-types');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search document types:');
        if (query !== null) {
            fetchDocumentTypes(query);
        }
    };

    return (
        <DataPage<DocumentType>
            title="Document Types"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Document Types' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ status: 'Active', category: 'Personal' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. ID_PROOF"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Identity Proof"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Category</label>
                        <select
                            value={record.category || 'Personal'}
                            onChange={e => onChange('category', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="Personal">Personal</option>
                            <option value="Professional">Professional</option>
                            <option value="Education">Education</option>
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

