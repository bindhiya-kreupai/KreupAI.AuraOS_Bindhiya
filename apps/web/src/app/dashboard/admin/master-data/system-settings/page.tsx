'use client';

import React, { useState, useEffect } from 'react';
import { DataPage } from '@aura/ui/components/ui';
import type { Column } from '@aura/ui/components/ui';

interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description: string;
    group: string;
}

const columns: Column<SystemSetting>[] = [
    { key: 'key', header: 'Key', width: '200px', render: (row) => <span className="font-mono text-xs font-medium">{row.key}</span> },
    { key: 'value', header: 'Value', render: (row) => <span className="font-mono text-sm">{row.value}</span> },
    { key: 'group', header: 'Group', width: '150px', render: (row) => <span className="text-xs text-silver-mist">{row.group}</span> },
    { key: 'description', header: 'Description', render: (row) => <span className="text-sm text-silver-mist truncate max-w-xs">{row.description}</span> },
];

export default function SystemSettingsPage() {
    const [data, setData] = useState<SystemSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSystemSettings = async () => {
        try {
            const response = await fetch('/api/master-data/system-settings');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Failed to fetch system settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemSettings();
    }, []);

    const handleSave = async (record: Partial<SystemSetting>) => {
        try {
            let response;
            if (record.id) {
                response = await fetch(`/api/master-data/system-settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            } else {
                response = await fetch(`/api/master-data/system-settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(record),
                });
            }

            if (response.ok) {
                fetchSystemSettings();
            } else {
                alert('Failed to save system setting');
            }
        } catch (error) {
            console.error('Error saving system setting:', error);
            alert('Error saving system setting');
        }
    };

    const handleDelete = async (record: SystemSetting) => {
        if (confirm(`Are you sure you want to delete ${record.key}?`)) {
            try {
                const response = await fetch(`/api/master-data/system-settings?id=${record.id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchSystemSettings();
                } else {
                    alert('Failed to delete system setting');
                }
            } catch (error) {
                console.error('Error deleting system setting:', error);
                alert('Error deleting system setting');
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
        <DataPage<SystemSetting>
            title="System Settings"
            breadcrumbs={[
                { label: 'Admin' },
                { label: 'Master Data' },
                { label: 'System Settings' }
            ]}
            data={data}
            columns={columns}
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onImport={handleImport}
            onFilter={handleFilter}
            defaultValues={{ group: 'General' }}
            renderForm={(record, onChange) => (
                <>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Key</label>
                        <input
                            type="text"
                            value={record.key || ''}
                            onChange={e => onChange('key', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. COMPANY_NAME"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Value</label>
                        <input
                            type="text"
                            value={record.value || ''}
                            onChange={e => onChange('value', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. KreupAI Technologies"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Group</label>
                        <select
                            value={record.group || 'General'}
                            onChange={e => onChange('group', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="General">General</option>
                            <option value="Finance">Finance</option>
                            <option value="Localization">Localization</option>
                            <option value="Security">Security</option>
                            <option value="Appearance">Appearance</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-silver-mist mb-1">Description</label>
                        <textarea
                            value={record.description || ''}
                            onChange={e => onChange('description', e.target.value)}
                            className="w-full px-3 py-2 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="e.g. Name of the organization"
                            rows={3}
                        />
                    </div>
                </>
            )}
        />
    );
}
