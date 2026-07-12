'use client';

import React, { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/auth/AuthProvider';
import { toast } from 'sonner';
import { User, Lock, Loader2, Save } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  employee?: {
    firstName: string;
    lastName: string;
    email: string;
    employeeCode: string;
    jobProfile?: { title: string };
    department?: { name: string };
    type?: { name: string };
    status?: { name: string };
  } | null;
}

export default function ProfilePage() {
  const { refresh } = useCurrentUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProfile(json.data);
        } else {
          setError(json.error || 'Failed to load profile');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const firstName = profile.employee?.firstName ?? profile.firstName ?? '';
      const lastName = profile.employee?.lastName ?? profile.lastName ?? '';
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      });
      const json = await res.json();
      if (json.success) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                firstName,
                lastName,
                employee: prev.employee ? { ...prev.employee, firstName, lastName } : null,
              }
            : prev
        );
        toast.success('Profile updated successfully');
        refresh();
      } else {
        toast.error(json.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    if (!profile) return;
    if (field === 'email') {
      setProfile({ ...profile, email: value });
    } else if (profile.employee) {
      setProfile({
        ...profile,
        employee: { ...profile.employee, [field]: value },
      });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        toast.error(json.error || 'Failed to change password');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (error) return <div className="p-8 text-center text-coral-alert">{error}</div>;
  if (!profile) return <div className="p-8 text-center text-silver-mist">User not found</div>;

  const displayName = profile.employee
    ? `${profile.employee.firstName} ${profile.employee.lastName}`
    : `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.email;
  const displayEmail = profile.employee?.email || profile.email;
  const initials = profile.employee
    ? `${profile.employee.firstName?.[0] || ''}${profile.employee.lastName?.[0] || ''}`
    : `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          My Profile
        </h1>
        <p className="text-silver-mist">Manage your personal information and account settings.</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-4">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-celestial-indigo/20 flex items-center justify-center text-2xl font-bold text-celestial-indigo">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-midnight-blue dark:text-white">{displayName}</h2>
            <p className="text-silver-mist">{displayEmail}</p>
            {profile.employee?.jobProfile?.title && (
              <p className="text-xs text-silver-mist/70">{profile.employee.jobProfile.title}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profile.employee?.firstName || profile.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profile.employee?.lastName || profile.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={displayEmail}
              readOnly
              className="w-full px-4 py-2 bg-pearl/50 dark:bg-stellar-blue/50 rounded-lg border border-cloud dark:border-nebula-purple/50 text-silver-mist"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-medium text-midnight-blue dark:text-white">
              Change Password
            </h3>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-celestial-indigo hover:underline"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex items-center gap-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
