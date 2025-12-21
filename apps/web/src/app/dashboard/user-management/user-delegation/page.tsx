'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { logger } from '@/lib/logger';

interface UserDelegation {
    id: string;
    delegatorId: string;
    delegator?: { email: string };
    delegateeId: string;
    delegatee?: { email: string };
    role: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
}

interface User {
    id: string;
    email: string;
}

export default function UserDelegationPage() {
    const [data, setData] = useState<UserDelegation[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [delegationsRes, usersRes] = await Promise.all([
                fetch('/api/user-delegation'),
                fetch('/api/users')
            ]);

            if (delegationsRes.ok) setData(await delegationsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
        } catch (error) {
            logger.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<UserDelegation>[] = [
        { key: 'delegator', header: 'Delegator', render: (row) => <span className="font-medium">{row.delegator?.email}</span> },
        { key: 'delegatee', header: 'Delegatee', render: (row) => <span className="font-medium">{row.delegatee?.email}</span> },
        { key: 'role', header: 'Role' },
        {
            key: 'startDate',
            header: 'Start Date',
            width: '120px',
            render: (row) => <span className="text-xs text-silver-mist">{new Date(row.startDate).toLocaleDateString()}</span>
        },
        {
            key: 'endDate',
            header: 'End Date',
            width: '120px',
            render: (row) => <span className="text-xs text-silver-mist">{new Date(row.endDate).toLocaleDateString()}</span>
        },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleSave = async (record: Partial<UserDelegation>) => {
        try {
            const response = await fetch('/api/user-delegation', {
                method: 'POST', // Only create allowed for now
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });

            if (response.ok) {
                fetchData();
            } else {
                const error = await response.json();
                alert(`Failed to create delegation: ${error.error}`);
            }
        } catch (error) {
            logger.error('Error creating delegation:', error);
            alert('Error creating delegation');
        }
    };

    const handleDelete = async (record: UserDelegation) => {
        if (confirm(`Are you sure you want to delete this delegation?`)) {
            try {
                const response = await fetch(`/api/user-delegation?id=${record.id}`, { method: 'DELETE' });
                if (response.ok) fetchData();
                else alert('Failed to delete delegation');
            } catch (error) {
                logger.error('Error deleting delegation:', error);
                alert('Error deleting delegation');
            }
        }
    };

    return (
        <DataPage<UserDelegation>
            title="User Delegation"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Delegation' }]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            defaultValues={{ role: 'Admin', status: 'Scheduled' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Delegator (From)</label>
                        <select
                            value={record.delegatorId || ''}
                            onChange={e => onChange('delegatorId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select User</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Delegatee (To)</label>
                        <select
                            value={record.delegateeId || ''}
                            onChange={e => onChange('delegateeId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select User</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Role to Delegate</label>
                        <input
                            type="text"
                            value={record.role || ''}
                            onChange={e => onChange('role', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Admin"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">Start Date</label>
                            <input
                                type="date"
                                value={record.startDate ? new Date(record.startDate).toISOString().split('T')[0] : ''}
                                onChange={e => onChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">End Date</label>
                            <input
                                type="date"
                                value={record.endDate ? new Date(record.endDate).toISOString().split('T')[0] : ''}
                                onChange={e => onChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Reason</label>
                        <textarea
                            value={record.reason || ''}
                            onChange={e => onChange('reason', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            rows={2}
                        />
                    </div>
                </>
            )}
        />
    );
}
