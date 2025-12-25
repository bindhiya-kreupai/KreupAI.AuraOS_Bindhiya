'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';
import { logger } from '@/lib/logger';

interface CostCenter {
    id: string;
    code: string;
    name: string;
    description: string;
}

const columns: Column<CostCenter>[] = [
    { key: 'code', header: 'Code', width: '120px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'description', header: 'Description', render: (row) => <span className="text-silver-mist text-xs truncate max-w-[200px]">{row.description}</span> },
];

export default function CostCentersPage() {
    const [data, setData] = useState<CostCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCostCenters = async (query?: string) => {
        try {
            const url = query
                ? `/api/master-data/cost-centers?q=${encodeURIComponent(query)}`
                : '/api/master-data/cost-centers';
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch {
            logger.error('Failed to fetch cost centers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCostCenters();
    }, []);

    // ... (rest of the component)

    const handleSave = async (record: Partial<CostCenter>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/cost-centers`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/cost-centers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchCostCenters();
            } else {
                alert('Failed to save cost center');
            }
        } catch {
            logger.error('Error saving cost center:', error);
            alert('Error saving cost center');
        }
    };

    const handleDelete = async (record: CostCenter) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/cost-centers?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchCostCenters();
                } else {
                    alert('Failed to delete cost center');
                }
            } catch {
                logger.error('Error deleting cost center:', error);
                alert('Error deleting cost center');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('cost-centers');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search cost centers:');
        if (query !== null) {
            fetchCostCenters(query);
        }
    };

    return (
        <DataPage<CostCenter>
            title="Cost Centers"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Cost Centers' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. CC-001"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Engineering Ops"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none min-h-[100px]"
                            placeholder="Enter description..."
                        />
                    </div>
                </>
            )}
        />
    );
}
