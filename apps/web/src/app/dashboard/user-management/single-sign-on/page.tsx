'use client';

import React, { useState, useEffect } from 'react';

interface SSOConfig {
    id?: string;
    enabled: boolean;
    provider: string;
    issuerUrl: string;
    ssoUrl: string;
    certificate: string;
}

export default function SSOPage() {
    const [config, setConfig] = useState<SSOConfig>({
        enabled: false,
        provider: 'SAML',
        issuerUrl: '',
        ssoUrl: '',
        certificate: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch('/api/sso-config')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setConfig(data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/sso-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (res.ok) {
                alert('SSO configuration saved successfully');
            } else {
                alert('Failed to save configuration');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error saving SSO config:', error);
            alert('Error saving configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof SSOConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading) return <div className="p-8 text-center text-silver-mist">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2">Single Sign-On (SSO)</h1>
                <p className="text-silver-mist">Configure SAML or OIDC authentication for your organization.</p>
            </div>

            <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-4">
                <div className="flex items-center justify-between pb-6 border-b border-cloud dark:border-nebula-purple/30">
                    <div>
                        <h3 className="text-lg font-medium text-midnight-blue dark:text-white">Enable SSO</h3>
                        <p className="text-sm text-silver-mist">Allow users to log in using your identity provider.</p>
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
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Provider Type</label>
                        <select
                            value={config.provider}
                            onChange={e => handleChange('provider', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        >
                            <option value="SAML">SAML 2.0</option>
                            <option value="OIDC">OpenID Connect (OIDC)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Issuer URL (Entity ID)</label>
                        <input
                            type="text"
                            value={config.issuerUrl || ''}
                            onChange={e => handleChange('issuerUrl', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="https://idp.example.com/metadata"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">SSO URL (Login URL)</label>
                        <input
                            type="text"
                            value={config.ssoUrl || ''}
                            onChange={e => handleChange('ssoUrl', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                            placeholder="https://idp.example.com/sso"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">X.509 Certificate</label>
                        <textarea
                            value={config.certificate || ''}
                            onChange={e => handleChange('certificate', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none font-mono text-xs"
                            rows={5}
                            placeholder="-----BEGIN CERTIFICATE-----..."
                        />
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

