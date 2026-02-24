'use client';

import React, { useState, useEffect } from 'react';

interface MFAConfig {
    id?: string;
    enabled: boolean;
    enforceForAdmins: boolean;
    enforceForAll: boolean;
    methods: any;
    gracePeriodDays: number;
}

export default function MFAPage() {
    const [config, setConfig] = useState<MFAConfig>({
        enabled: false,
        enforceForAdmins: true,
        enforceForAll: false,
        methods: { authenticatorApp: true, sms: false, email: true },
        gracePeriodDays: 7,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch('/api/mfa-config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    // Parse methods if string, though Prisma handles Json type usually
                    const methods = typeof data.methods === 'string' ? JSON.parse(data.methods) : data.methods;
                    setConfig({ ...data, methods: methods || { authenticatorApp: true, sms: false, email: true } });
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/mfa-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                alert('MFA configuration saved successfully');
            } else {
                alert('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving MFA config:', error);
            alert('Error saving configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof MFAConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleMethodChange = (method: string, checked: boolean) => {
        setConfig(prev => ({
            ...prev,
            methods: { ...prev.methods, [method]: checked }
        }));
    };

    if (isLoading) return <div className="p-8 text-center text-silver-mist">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2">Multi-Factor Authentication (MFA)</h1>
                <p className="text-silver-mist">Enhance security by requiring multiple forms of verification.</p>
            </div>

            <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-4">
                <div className="flex items-center justify-between pb-6 border-b border-cloud dark:border-nebula-purple/30">
                    <div>
                        <h3 className="text-lg font-medium text-midnight-blue dark:text-white">Enable MFA</h3>
                        <p className="text-sm text-silver-mist">Turn on multi-factor authentication for the organization.</p>
                    </div>
                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input
                            type="checkbox"
                            name="toggle"
                            id="toggle"
                            checked={config.enabled}
                            onChange={e => handleChange('enabled', e.target.checked)}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-emerald-400"
                        />
                        <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${config.enabled ? 'bg-emerald-400' : 'bg-gray-300'}`}></label>
                    </div>
                </div>

                <div className={`space-y-4 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <h4 className="text-sm font-medium text-midnight-blue dark:text-white mb-4">Enforcement</h4>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enforceForAdmins"
                                        checked={config.enforceForAdmins}
                                        onChange={e => handleChange('enforceForAdmins', e.target.checked)}
                                        className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                                    />
                                    <label htmlFor="enforceForAdmins" className="ml-2 text-sm text-midnight-blue dark:text-white">Enforce for Administrators</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enforceForAll"
                                        checked={config.enforceForAll}
                                        onChange={e => handleChange('enforceForAll', e.target.checked)}
                                        className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                                    />
                                    <label htmlFor="enforceForAll" className="ml-2 text-sm text-midnight-blue dark:text-white">Enforce for All Users</label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-midnight-blue dark:text-white mb-4">Allowed Methods</h4>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="authenticatorApp"
                                        checked={config.methods?.authenticatorApp}
                                        onChange={e => handleMethodChange('authenticatorApp', e.target.checked)}
                                        className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                                    />
                                    <label htmlFor="authenticatorApp" className="ml-2 text-sm text-midnight-blue dark:text-white">Authenticator App (TOTP)</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="sms"
                                        checked={config.methods?.sms}
                                        onChange={e => handleMethodChange('sms', e.target.checked)}
                                        className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                                    />
                                    <label htmlFor="sms" className="ml-2 text-sm text-midnight-blue dark:text-white">SMS / Text Message</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="email"
                                        checked={config.methods?.email}
                                        onChange={e => handleMethodChange('email', e.target.checked)}
                                        className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                                    />
                                    <label htmlFor="email" className="ml-2 text-sm text-midnight-blue dark:text-white">Email Verification</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Grace Period (Days)</label>
                        <input
                            type="number"
                            value={config.gracePeriodDays}
                            onChange={e => handleChange('gracePeriodDays', parseInt(e.target.value))}
                            className="w-full max-w-xs px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                        <p className="text-xs text-silver-mist mt-1">Days before MFA is enforced for new users.</p>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}

