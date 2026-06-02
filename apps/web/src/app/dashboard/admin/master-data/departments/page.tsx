'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Department {
    id: string;
    code: string;
    name: string;
    companyId: string;
    costCenterId?: string;
    parentId?: string;
}

interface Company {
    id: string;
    name: string;
}

interface CostCenter {
    id: string;
    code: string;
    name: string;
}

export default function DepartmentsPage() {
    const [data, setData] = useState<Department[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (query?: string) => {
        try {
            const depsUrl = query
                ? `/api/master-data/departments?q=${encodeURIComponent(query)}`
                : '/api/master-data/departments';

            const [depsRes, compsRes, costsRes] = await Promise.all([
                fetch(depsUrl),
                fetch('/api/master-data/companies'),
                fetch('/api/master-data/cost-centers')
            ]);

            if (depsRes.ok) setData(await depsRes.json());
            if (compsRes.ok) setCompanies(await compsRes.json());
            if (costsRes.ok) setCostCenters(await costsRes.json());
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns: Column<Department>[] = [
        { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
        {
            key: 'name',
            header: 'Name',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.name}</span>
                    {row.parentId && <span className="text-xs text-silver-mist">Parent: {data.find(d => d.id === row.parentId)?.name}</span>}
                </div>
            )
        },
        {
            key: 'companyId',
            header: 'Company',
            width: '180px',
            render: (row) => {
                const company = companies.find(c => c.id === row.companyId);
                return <span className="text-sm">{company?.name || 'Unknown'}</span>;
            }
        },
        {
            key: 'costCenterId',
            header: 'Cost Center',
            width: '150px',
            render: (row) => {
                const cc = costCenters.find(c => c.id === row.costCenterId);
                return cc ? (
                    <span className="px-2 py-0.5 rounded-md bg-pearl dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-xs font-mono">
                        {cc.code}
                    </span>
                ) : <span className="text-silver-mist text-xs">-</span>;
            }
        },
    ];

    const handleSave = async (record: Partial<Department>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/departments`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/departments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData(); // Re-fetch all to ensure parent/child names resolve correctly
            } else {
                alert('Failed to save department');
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Error saving department:', error);
            alert('Error saving department');
        }
    };

    const handleDelete = async (record: Department) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/departments?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete department');
                }
            } catch (error: any) {
            console.error('Error:', error);
                console.error('Error deleting department:', error);
                alert('Error deleting department');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('departments');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search departments:');
        if (query !== null) {
            fetchData(query);
        }
    };

    return (
        <DataPage<Department>
            title="Departments"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Departments' }
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
                        <label className="block text-xs font-medium text-silver-mist mb-1">Company</label>
                        <select
                            value={record.companyId || ''}
                            onChange={e => onChange('companyId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="" disabled>Select Company</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Parent Department (Optional)</label>
                        <select
                            value={record.parentId || ''}
                            onChange={e => onChange('parentId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="">None (Root Department)</option>
                            {data.filter(d => d.id !== record.id).map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Cost Center (Optional)</label>
                        <select
                            value={record.costCenterId || ''}
                            onChange={e => onChange('costCenterId', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="">Select Cost Center</option>
                            {costCenters.map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Department Code</label>
                        <input
                            type="text"
                            value={record.code || ''}
                            onChange={e => onChange('code', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. DEP-ENG"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Department Name</label>
                        <input
                            type="text"
                            value={record.name || ''}
                            onChange={e => onChange('name', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Engineering"
                        />
                    </div>
                </>
            )}
        />
    );
}

