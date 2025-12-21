'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface PasswordPolicy {
    id?: string;
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    historyCount: number;
    lockoutAttempts: number;
}

export default function PasswordPolicyPage() {
    const [policy, setPolicy] = useState<PasswordPolicy>({
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expiryDays: 90,
        historyCount: 5,
        lockoutAttempts: 3,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch('/api/password-policy')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setPolicy(data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/password-policy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(policy),
            });
            if (res.ok) {
                alert('Password policy saved successfully');
            } else {
                alert('Failed to save policy');
            }
        } catch (error) {
            logger.error('Error saving policy:', error);
            alert('Error saving policy');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof PasswordPolicy, value: any) => {
        setPolicy(prev => ({ ...prev, [key]: value }));
    };

    if (isLoading) return <div className="p-8 text-center text-silver-mist">Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2">Password Policy</h1>
                <p className="text-silver-mist">Configure security requirements for user passwords.</p>
            </div>

            <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Minimum Length</label>
                        <input
                            type="number"
                            value={policy.minLength}
                            onChange={e => handleChange('minLength', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Password Expiry (Days)</label>
                        <input
                            type="number"
                            value={policy.expiryDays}
                            onChange={e => handleChange('expiryDays', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">History Count (Prevent reuse)</label>
                        <input
                            type="number"
                            value={policy.historyCount}
                            onChange={e => handleChange('historyCount', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Lockout Attempts</label>
                        <input
                            type="number"
                            value={policy.lockoutAttempts}
                            onChange={e => handleChange('lockoutAttempts', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-cloud dark:border-nebula-purple/30">
                    <h3 className="text-lg font-medium text-midnight-blue dark:text-white">Complexity Requirements</h3>

                    {[
                        { key: 'requireUppercase', label: 'Require Uppercase Letters' },
                        { key: 'requireLowercase', label: 'Require Lowercase Letters' },
                        { key: 'requireNumbers', label: 'Require Numbers' },
                        { key: 'requireSpecialChars', label: 'Require Special Characters' },
                    ].map(({ key, label }) => (
                        <div key={key} className="flex items-center">
                            <input
                                type="checkbox"
                                id={key}
                                checked={policy[key as keyof PasswordPolicy] as boolean}
                                onChange={e => handleChange(key as keyof PasswordPolicy, e.target.checked)}
                                className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                            />
                            <label htmlFor={key} className="ml-2 text-sm text-midnight-blue dark:text-white">{label}</label>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Policy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
