'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface AuditLog {
    id: string;
    user: { email: string };
    action: string;
    module: string;
    details: string;
    ipAddress: string;
    timestamp: string;
}

export default function AuditTrailPage() {
    const [data, setData] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/audit-logs');
            if (res.ok) setData(await res.json());
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<AuditLog>[] = [
        {
            key: 'timestamp',
            header: 'Timestamp',
            width: '180px',
            render: (row) => <span className="text-xs text-silver-mist">{new Date(row.timestamp).toLocaleString()}</span>
        },
        { key: 'user', header: 'User', render: (row) => <span className="font-medium">{row.user?.email || 'System'}</span> },
        { key: 'action', header: 'Action', width: '120px' },
        { key: 'module', header: 'Module', width: '150px' },
        { key: 'details', header: 'Details' },
        { key: 'ipAddress', header: 'IP Address', width: '140px' },
    ];

    return (
        <DataPage<AuditLog>
            title="Audit Trail"
            breadcrumbs={[{ label: 'Admin' }, { label: 'User Management' }, { label: 'Audit Trail' }]}
            data={data}
            columns={columns}
            // Read-only
            onSave={undefined}
            onDelete={undefined}
            renderForm={() => <></>}
        />
    );
}
