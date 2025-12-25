'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { logger } from '@/lib/logger';

interface UserDeactivation {
    id: string;
    userId: string;
    user?: { email: string };
    reason: string;
    deactivatedBy: string;
    deactivatedAt: string;
}

interface User {
    id: string;
    email: string;
}

export default function UserDeactivationPage() {
    const [data, setData] = useState<UserDeactivation[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [deactivationsRes, usersRes] = await Promise.all([
                fetch('/api/user-deactivation'),
                fetch('/api/users')
            ]);

            if (deactivationsRes.ok) setData(await deactivationsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch {
            logger.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<UserDeactivation>[] = [
        { key: 'user', header: 'User', render: (row) => <span className="font-medium">{row.user?.email}</span> },
        { key: 'reason', header: 'Reason' },
        { key: 'deactivatedBy', header: 'Deactivated By' },
        {
            key: 'deactivatedAt',
            header: 'Date',
            width: '180px',
            render: (row) => <span className="text-xs text-silver-mist">{new Date(row.deactivatedAt).toLocaleString()}</span>
        },
    ];

    const handleSave = async (record: Partial<UserDeactivation>) => {
        try {
            const response = await fetch('/api/user-deactivation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...record,
                    deactivatedBy: 'Admin (You)', // Mocked current user
                }),
            });

            if (response.ok) {
                fetchData();
            } else {
                const error = await response.json();
                alert(`Failed to deactivate user: ${error.error}`);
            }
        } catch {
            logger.error('Error deactivating user:', error);
            alert('Error deactivating user');
        }
    };

    return (
        <DataPage<UserDeactivation>
            title="User Deactivation"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Deactivation' }]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={undefined}
            defaultValues={{}}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">User to Deactivate</label>
                        <select
                            value={record.userId || ''}
                            onChange={e => onChange('userId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select User</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Reason</label>
                        <textarea
                            value={record.reason || ''}
                            onChange={e => onChange('reason', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            rows={3}
                            placeholder="Reason for deactivation..."
                        />
                    </div>
                </>
            )}
        />
    );
}
