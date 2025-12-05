'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface User {
    id: string;
    email: string;
    tenantId: string;
    tenant?: {
        name: string;
    };
    createdAt: string;
}

interface Tenant {
    id: string;
    name: string;
    code: string;
}

export default function UsersPage() {
    const [data, setData] = useState<User[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [usersRes, tenantsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/master-data/tenants')
            ]);

            if (usersRes.ok) setData(await usersRes.json());
            if (tenantsRes.ok) setTenants(await tenantsRes.json());
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<User>[] = [
        { key: 'email', header: 'Email', render: (row) => <span className="font-medium">{row.email}</span> },
        {
            key: 'tenantId',
            header: 'Tenant',
            render: (row) => <span className="text-sm text-silver-mist">{row.tenant?.name || 'Unknown'}</span>
        },
        {
            key: 'createdAt',
            header: 'Created At',
            width: '180px',
            render: (row) => <span className="text-xs text-silver-mist">{new Date(row.createdAt).toLocaleDateString()}</span>
        },
    ];

    const handleSave = async (record: Partial<User> & { password?: string }) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/users`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData();
            } else {
                const error = await response.json();
                alert(`Failed to save user: ${error.error}`);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user');
        }
    };

    const handleDelete = async (record: User) => {
        if (confirm(`Are you sure you want to delete ${record.email}?`)) {
            try {
                const response = await fetch(`/api/users?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete user');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            }
        }
    };

    const handleExport = () => {
        alert('Export functionality coming soon!');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        alert('Advanced filter functionality coming soon!');
    };

    return (
        <DataPage<User>
            title="Users"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'User Management' },
                { label: 'Users' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Email</label>
                        <input
                            type="email"
                            value={record.email || ''}
                            onChange={e => onChange('email', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Password {record.id && '(Leave blank to keep unchanged)'}</label>
                        <input
                            type="password"
                            // @ts-ignore
                            value={record.password || ''}
                            // @ts-ignore
                            onChange={e => onChange('password', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="********"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Tenant</label>
                        <select
                            value={record.tenantId || ''}
                            onChange={e => onChange('tenantId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select Tenant</option>
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                            ))}
                        </select>
                    </div>
                </>
            )}
        />
    );
}
