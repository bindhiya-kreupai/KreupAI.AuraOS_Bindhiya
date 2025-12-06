'use client';

import React, { useState, useEffect } from 'react';
// If Card doesn't exist, we'll use standard div structure.
// Let's use standard Tailwind for now to be safe and match the other pages.

interface SystemSetting {
    key: string;
    value: string;
    group: string;
    description?: string;
}

const REGIONS = [
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'QA', name: 'Qatar' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'IN', name: 'India' },
];

export default function SystemSettingsPage() {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/master-data/system-settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);

                // Extract active regions
                const activeRegionsSetting = data.find((s: SystemSetting) => s.key === 'ACTIVE_REGIONS');
                if (activeRegionsSetting) {
                    setSelectedRegions(activeRegionsSetting.value.split(',').map((s: string) => s.trim()));
                } else {
                    // Default to all if not set or empty? Or none?
                    // Let's default to all for safety if nothing is configured
                    setSelectedRegions(REGIONS.map(r => r.code));
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegionToggle = (code: string) => {
        setSelectedRegions(prev => {
            if (prev.includes(code)) {
                return prev.filter(c => c !== code);
            } else {
                return [...prev, code];
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // We need to either create or update the ACTIVE_REGIONS setting.
            // Since the API for master-data seems to be generic CR for entities,
            // we should lookup if 'ACTIVE_REGIONS' exists in `settings` state to get its ID,
            // OR if the system-settings endpoint supports upsert by Key.
            // Scanning the generic route.ts, it uses `update` with `id`.
            // So we need to find the ID of the setting 'ACTIVE_REGIONS'.

            const existingSetting = settings.find(s => s.key === 'ACTIVE_REGIONS');
            const newValue = selectedRegions.join(',');

            if (existingSetting && (existingSetting as any).id) {
                // Update
                const response = await fetch(`/api/master-data/system-settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: (existingSetting as any).id,
                        value: newValue
                    })
                });

                if (!response.ok) throw new Error('Failed to update');
            } else {
                // Create
                const response = await fetch(`/api/master-data/system-settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: 'ACTIVE_REGIONS',
                        value: newValue,
                        group: 'General',
                        description: 'Active Regions for Master Data'
                    })
                });

                if (!response.ok) throw new Error('Failed to create');
            }

            alert('Settings saved successfully!');
            fetchSettings(); // Refresh
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-silver-mist">Loading settings...</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-deep-ocean dark:text-white">System Settings</h1>
                <p className="text-silver-mist mt-1">Configure global application settings and regional preferences.</p>
            </div>

            <div className="bg-white dark:bg-void p-6 rounded-xl border border-cloud dark:border-nebula-purple/20 shadow-sm max-w-4xl">
                <h2 className="text-lg font-medium text-deep-ocean dark:text-white mb-4">Regional Configuration</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-sm text-blue-700 dark:text-blue-200">
                    <p>Select the regions that should be active in the system. This will filter Master Data (Banks, Tax Regimes, etc.) to only show relevant records.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {REGIONS.map(region => (
                        <label
                            key={region.code}
                            className={`
                                flex items-center p-4 rounded-lg border cursor-pointer transition-all
                                ${selectedRegions.includes(region.code)
                                    ? 'border-celestial-indigo bg-celestial-indigo/5 dark:bg-celestial-indigo/20 ring-1 ring-celestial-indigo'
                                    : 'border-cloud dark:border-nebula-purple/30 hover:border-celestial-indigo/50'}
                            `}
                        >
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-celestial-indigo rounded border-gray-300 focus:ring-celestial-indigo"
                                checked={selectedRegions.includes(region.code)}
                                onChange={() => handleRegionToggle(region.code)}
                            />
                            <span className="ml-3 font-medium text-deep-ocean dark:text-white">{region.name}</span>
                            <span className="ml-auto text-xs font-mono text-silver-mist bg-cloud/50 dark:bg-white/10 px-2 py-1 rounded">
                                {region.code}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end pt-6 border-t border-cloud dark:border-nebula-purple/20">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg font-medium transition-colors shadow-lg shadow-celestial-indigo/20 flex items-center"
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
