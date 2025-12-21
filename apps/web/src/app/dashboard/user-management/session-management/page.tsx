'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { logger } from '@/lib/logger';

interface UserSession {
    id: string;
    user: { email: string };
    ipAddress: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    status: string;
}

export default function SessionsPage() {
    const [data, setData] = useState<UserSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) setData(await res.json());
        } catch (error) {
            logger.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<UserSession>[] = [
        { key: 'user', header: 'User', render: (row) => <span className="font-medium">{row.user?.email}</span> },
        { key: 'ipAddress', header: 'IP Address', width: '140px' },
        { key: 'device', header: 'Device' },
        { key: 'location', header: 'Location' },
        {
            key: 'lastActive',
            header: 'Last Active',
            width: '180px',
            render: (row) => <span className="text-xs text-silver-mist">{new Date(row.lastActive).toLocaleString()}</span>
        },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleRevoke = async (record: UserSession) => {
        if (confirm(`Are you sure you want to revoke this session?`)) {
            try {
                const response = await fetch(`/api/sessions?id=${record.id}`, { method: 'DELETE' });
                if (response.ok) fetchData();
                else alert('Failed to revoke session');
            } catch (error) {
                logger.error('Error revoking session:', error);
                alert('Error revoking session');
            }
        }
    };

    return (
        <DataPage<UserSession>
            title="Session Management"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Sessions' }]}
            data={data}
            columns={columns}
            // We reuse onDelete for Revoke to leverage DataPage's action column
            onDelete={handleRevoke}
            // Disable Create/Edit as sessions are managed by system
            onSave={undefined}
            renderForm={() => <></>} // Empty form as we don't allow creating sessions manually
        />
    );
}
