'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';
import { handleValuesExport } from '@/lib/master-data-utils';

interface Location {
    id: string;
    code: string;
    name: string;
    type: 'HEADQUARTERS' | 'BRANCH' | 'REMOTE_HUB' | 'WAREHOUSE' | 'PLANT';
    companyId: string;
    addressId: string;
}

interface Company {
    id: string;
    name: string;
}

interface Address {
    id: string;
    line1: string;
    city: { name: string };
    state: { name: string };
    country: { name: string };
}

const locationTypes = [
    'HEADQUARTERS',
    'BRANCH',
    'REMOTE_HUB',
    'WAREHOUSE',
    'PLANT'
];

export default function LocationsPage() {
    const [data, setData] = useState<Location[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async (query?: string) => {
        try {
            const locationsUrl = query
                ? `/api/master-data/locations?q=${encodeURIComponent(query)}`
                : '/api/master-data/locations';

            const [locsRes, compsRes, addrRes] = await Promise.all([
                fetch(locationsUrl),
                fetch('/api/master-data/companies'),
                fetch('/api/master-data/addresses')
            ]);

            if (locsRes.ok) setData(await locsRes.json());
            if (compsRes.ok) setCompanies(await compsRes.json());
            if (addrRes.ok) setAddresses(await addrRes.json());
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

    const columns: Column<Location>[] = [
        { key: 'code', header: 'Code', width: '100px', render: (row) => <span className="font-mono text-xs">{row.code}</span> },
        { key: 'name', header: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
        {
            key: 'type',
            header: 'Type',
            width: '120px',
            render: (row) => (
                <span className="px-2 py-0.5 rounded-md bg-pearl dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/50 text-xs font-medium">
                    {row.type ? row.type.replace('_', ' ') : 'N/A'}
                </span>
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
            key: 'addressId',
            header: 'Address',
            width: '200px',
            render: (row) => {
                const addr = addresses.find(a => a.id === row.addressId);
                return <span className="text-sm text-silver-mist">{addr ? `${addr.line1}, ${addr.city?.name}` : 'Unknown'}</span>;
            }
        },
    ];

    const handleSave = async (record: Partial<Location>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/locations`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/locations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchData();
            } else {
                alert('Failed to save location');
            }
        } catch (error: any) {
            console.error('Error:', error);
            console.error('Error saving location:', error);
            alert('Error saving location');
        }
    };

    const handleDelete = async (record: Location) => {
        if (confirm(`Are you sure you want to delete ${record.name}?`)) {
            try {
                const response = await fetch(`/api/master-data/locations?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchData();
                } else {
                    alert('Failed to delete location');
                }
            } catch (error: any) {
            console.error('Error:', error);
                console.error('Error deleting location:', error);
                alert('Error deleting location');
            }
        }
    };

    const handleExport = () => {
        handleValuesExport('locations');
    };

    const handleImport = () => {
        alert('Import functionality coming soon!');
    };

    const handleFilter = () => {
        const query = prompt('Search locations:');
        if (query !== null) {
            fetchData(query);
        }
    };

    return (
        <DataPage<Location>
            title="Locations"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'Locations' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ type: 'HEADQUARTERS' }}
            renderForm={(record, onChange) => (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
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
                            <label className="block text-xs font-medium text-silver-mist mb-1">Location Code</label>
                            <input
                                type="text"
                                value={record.code || ''}
                                onChange={e => onChange('code', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                                placeholder="e.g. NYC_HQ"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-silver-mist mb-1">Location Type</label>
                            <select
                                value={record.type || 'BRANCH'}
                                onChange={e => onChange('type', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            >
                                {locationTypes.map(t => (
                                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-silver-mist mb-1">Location Name</label>
                            <input
                                type="text"
                                value={record.name || ''}
                                onChange={e => onChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                                placeholder="e.g. New York Headquarters"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-silver-mist mb-1">Address</label>
                            <select
                                value={record.addressId || ''}
                                onChange={e => onChange('addressId', e.target.value)}
                                className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            >
                                <option value="" disabled>Select Address</option>
                                {addresses.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.line1}, {a.city?.name}, {a.state?.name}, {a.country?.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}
        />
    );
}

