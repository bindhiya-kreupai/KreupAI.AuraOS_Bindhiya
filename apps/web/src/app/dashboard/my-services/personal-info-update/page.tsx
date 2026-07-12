'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Save,
  Shield,
  Building2,
  CreditCard,
  Hash,
  Loader2,
} from 'lucide-react';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import ProfileCompletenessIndicator from '@/components/profile/ProfileCompletenessIndicator';
import CertificationsSelfUpdate from '@/components/skills/CertificationsSelfUpdate';
import { PersonalInfoService } from '../services';
import { useCurrentUser } from '@/lib/auth';

export default function PersonalInfoPage() {
  const { refresh } = useCurrentUser();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    personalEmail: '',
    mobileNumber: '',
    currentAddress: '',
    emergencyContactName: '',
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: '',
    bankName: '',
    bankAccountType: 'Checking',
    bankAccountNumber: '',
    bankRoutingNumber: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await PersonalInfoService.getProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setForm({
            personalEmail: res.data.personalEmail || res.data.email || '',
            mobileNumber: res.data.mobileNumber || res.data.phone || '',
            currentAddress: res.data.currentAddress || '',
            emergencyContactName: res.data.emergencyContactName || '',
            emergencyContactRelationship: res.data.emergencyContactRelationship || 'Spouse',
            emergencyContactPhone: res.data.emergencyContactPhone || '',
            bankName: res.data.bankName || '',
            bankAccountType: res.data.bankAccountType || 'Checking',
            bankAccountNumber: res.data.bankAccountNumber || '',
            bankRoutingNumber: res.data.bankRoutingNumber || '',
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await PersonalInfoService.updateProfile(form);
      if (res.success) {
        setProfile(res.data);
        alert('Changes saved successfully!');
        refresh();
      }
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 h-[calc(100vh-6rem)] flex flex-col relative text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-500" />
            My Profile
          </h1>
          <p className="text-slate-500 text-sm">
            Update your personal details and contact information.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="mb-4">
              <ProfilePhotoUpload currentPhoto={profile?.photoUrl || 'https://i.pravatar.cc/300'} />
            </div>
            <h2 className="text-xl font-bold">
              {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
            </h2>
            <p className="text-slate-500">{profile?.jobProfile?.name || ''}</p>
            <div className="mt-4 flex gap-2 w-full">
              <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                <div className="text-xs text-indigo-500 font-bold uppercase">Emp ID</div>
                <div className="font-bold text-indigo-700 dark:text-indigo-300">
                  {profile?.employeeCode || '—'}
                </div>
              </div>
              <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                <div className="text-xs text-emerald-500 font-bold uppercase">Status</div>
                <div className="font-bold text-emerald-700 dark:text-emerald-300">
                  {profile?.status?.name || 'Active'}
                </div>
              </div>
            </div>
          </div>
          <ProfileCompletenessIndicator />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-500" /> Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Personal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) => updateField('personalEmail', e.target.value)}
                    className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(e) => updateField('mobileNumber', e.target.value)}
                    className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Current Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <textarea
                    value={form.currentAddress}
                    onChange={(e) => updateField('currentAddress', e.target.value)}
                    rows={2}
                    className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-500" /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={form.emergencyContactName}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Relationship</label>
                <select
                  value={form.emergencyContactRelationship}
                  onChange={(e) => updateField('emergencyContactRelationship', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                >
                  <option>Spouse</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Friend</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.emergencyContactPhone}
                  onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" /> Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Bank Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={(e) => updateField('bankName', e.target.value)}
                    className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Account Type</label>
                <select
                  value={form.bankAccountType}
                  onChange={(e) => updateField('bankAccountType', e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                >
                  <option>Checking</option>
                  <option>Savings</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Account Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={form.bankAccountNumber}
                    onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                    className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Routing Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.bankRoutingNumber}
                    onChange={(e) => updateField('bankRoutingNumber', e.target.value)}
                    className="w-full pl-10 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Your bank details are encrypted and stored securely.
            </p>
          </div>

          <CertificationsSelfUpdate />
        </div>
      </div>
    </div>
  );
}
