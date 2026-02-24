'use client';

import React, { useState, useEffect } from 'react';

interface UserProfile {
    id: string;
    email: string;
    employee?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Fetch current user profile (mocked or from session)
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setProfile(data);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        if (!profile) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: profile.id,
                    email: profile.email,
                    firstName: profile.employee?.firstName,
                    lastName: profile.employee?.lastName,
                }),
            });
            if (res.ok) {
                alert('Profile updated successfully');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error:', error);
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        if (!profile) return;
        if (field === 'email') {
            setProfile({ ...profile, email: value });
        } else {
            setProfile({
                ...profile,
                employee: {
                    ...profile.employee!,
                    [field]: value,
                }
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center text-silver-mist">Loading...</div>;
    if (!profile) return <div className="p-8 text-center text-silver-mist">User not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2">My Profile</h1>
                <p className="text-silver-mist">Manage your personal information and account settings.</p>
            </div>

            <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-4">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-celestial-indigo/20 flex items-center justify-center text-2xl font-bold text-celestial-indigo">
                        {profile.employee?.firstName?.[0]}{profile.employee?.lastName?.[0]}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-midnight-blue dark:text-white">
                            {profile.employee?.firstName} {profile.employee?.lastName}
                        </h2>
                        <p className="text-silver-mist">{profile.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">First Name</label>
                        <input
                            type="text"
                            value={profile.employee?.firstName || ''}
                            onChange={e => handleChange('firstName', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Last Name</label>
                        <input
                            type="text"
                            value={profile.employee?.lastName || ''}
                            onChange={e => handleChange('lastName', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">Email Address</label>
                        <input
                            type="email"
                            value={profile.email || ''}
                            onChange={e => handleChange('email', e.target.value)}
                            className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

