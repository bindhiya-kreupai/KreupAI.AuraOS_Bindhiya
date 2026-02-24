'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface Role {
    id: string;
    name: string;
    description: string;
    status: string;
    usersCount: number;
}

export default function RolesPage() {
    const [data, setData] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/roles');
            if (res.ok) setData(await res.json());
        } catch (error) {
            console.error('Error:', error);
            console.error('Failed to fetch roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<Role>[] = [
        { key: 'name', header: 'Role Name', render: (row) => <span className="font-medium">{row.name}</span> },
        { key: 'description', header: 'Description' },
        { key: 'usersCount', header: 'Users', width: '100px', render: (row) => <span className="text-sm text-silver-mist">{row.usersCount}</span> },
        {
            key: 'status',
            header: 'Status',
            width: '120px',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleSave = async (record: Partial<Role>) => {
        try {
            const method = record.id ? 'PUT' : 'POST';
            const response = await fetch('/api/roles', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });

            if (response.ok) {
                fetchData();
            } else {
                const error = await response.json();
                alert(`Failed to save role: ${error.error}`);
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
                const response = await fetch(`/api/roles?id=${record.id}`, { method: 'DELETE' });
                if (response.ok) fetchData();
                else alert('Failed to delete role');
            } catch (error) {
            console.error('Error:', error);
                console.error('Error deleting role:', error);
                alert('Error deleting role');
            }
        }
    };

    return (
        <DataPage<Role>
            title="Role Management"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Roles' }]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            defaultValues={{ status: 'Active', usersCount: 0 }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Role Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Admin"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="Role description..."
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

