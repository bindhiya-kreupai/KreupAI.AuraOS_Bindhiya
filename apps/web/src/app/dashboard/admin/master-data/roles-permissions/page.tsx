'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Role {
    id: string;
    name: string;
    description: string;
    usersCount: number;
    status: 'Active' | 'Inactive';
}

const columns: Column<Role>[] = [
    { key: 'name', header: 'Role Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', header: 'Description', render: (row) => <span className="text-sm text-silver-mist">{row.description}</span> },
    { key: 'usersCount', header: 'Users', width: '100px', render: (row) => <span className="font-mono text-sm">{row.usersCount}</span> },
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

export default function RolesPermissionsPage() {
    const [data, setData] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRoles = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/roles-permissions?q=${encodeURIComponent(query)}`
                : '/api/master-data/roles-permissions';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<Role>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/roles-permissions`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/roles-permissions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...record, usersCount: 0 }),
                });
            }

            if (response.ok) {
                fetchRoles();
            } else {
                alert('Failed to save role');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving role:', error);
            alert('Error saving role');
        }
    };

    const handleDelete = async (record: Role) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/roles-permissions?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchRoles();
                } else {
                    alert('Failed to delete role');
                }
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting role:', error);
                alert('Error deleting role');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('roles-permissions');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search roles:');
        if (query !== null) {
            fetchRoles(query);
        }
    };

    return (
        <DataPage<Role>
            title="Roles & Permissions"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Roles & Permissions' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Role Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. HR Manager"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Access to HR modules"
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

