'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface MFAConfig {
  id?: string;
  enabled: boolean;
  enforceForAdmins: boolean;
  enforceForAll: boolean;
  methods: { authenticatorApp: boolean; sms: boolean; email: boolean };
  gracePeriodDays: number;
}

const DEFAULT_METHODS = { authenticatorApp: true, sms: false, email: true };

export default function MFAPage() {
  const [config, setConfig] = useState<MFAConfig>({
    enabled: false,
    enforceForAdmins: true,
    enforceForAll: false,
    methods: DEFAULT_METHODS,
    gracePeriodDays: 7,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/mfa-config')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          const methods = typeof d.methods === 'string' ? JSON.parse(d.methods) : d.methods;
          setConfig({
            id: d.id,
            enabled: d.enabled ?? false,
            enforceForAdmins: d.enforceForAdmins ?? true,
            enforceForAll: d.enforceForAll ?? false,
            methods: methods || DEFAULT_METHODS,
            gracePeriodDays: d.gracePeriodDays ?? 7,
          });
        }
      })
      .catch(() => toast.error('Failed to load MFA configuration'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Use PUT if config already exists, POST otherwise
      const method = config.id ? 'PUT' : 'POST';
      const res = await fetch('/api/mfa-config', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        // If we just created, store the id so future saves use PUT
        if (json.data?.id && !config.id) {
          setConfig((prev) => ({ ...prev, id: json.data.id }));
        }
        toast.success('MFA configuration saved successfully');
      } else {
        toast.error(json.error || 'Failed to save configuration');
      }
    } catch (error: any) {
      console.error('Error saving MFA config:', error);
      toast.error('Error saving configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof MFAConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleMethodChange = (method: string, checked: boolean) => {
    setConfig((prev) => ({
      ...prev,
      methods: { ...prev.methods, [method]: checked },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-500" />
          Multi-Factor Authentication (MFA)
        </h1>
        <p className="text-silver-mist">
          Enhance security by requiring multiple forms of verification.
        </p>
      </div>

      <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-4">
        <div className="flex items-center justify-between pb-6 border-b border-cloud dark:border-nebula-purple/30">
          <div>
            <h3 className="text-lg font-medium text-midnight-blue dark:text-white">Enable MFA</h3>
            <p className="text-sm text-silver-mist">
              Turn on multi-factor authentication for the organization.
            </p>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="toggle"
              id="toggle"
              checked={config.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-6 checked:border-emerald-400"
            />
            <label
              htmlFor="toggle"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${config.enabled ? 'bg-emerald-400' : 'bg-gray-300'}`}
            ></label>
          </div>
        </div>

        <div
          className={`space-y-4 transition-opacity ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="text-sm font-medium text-midnight-blue dark:text-white mb-4">
                Enforcement
              </h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enforceForAdmins"
                    checked={config.enforceForAdmins}
                    onChange={(e) => handleChange('enforceForAdmins', e.target.checked)}
                    className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                  />
                  <label
                    htmlFor="enforceForAdmins"
                    className="ml-2 text-sm text-midnight-blue dark:text-white"
                  >
                    Enforce for Administrators
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enforceForAll"
                    checked={config.enforceForAll}
                    onChange={(e) => handleChange('enforceForAll', e.target.checked)}
                    className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                  />
                  <label
                    htmlFor="enforceForAll"
                    className="ml-2 text-sm text-midnight-blue dark:text-white"
                  >
                    Enforce for All Users
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-midnight-blue dark:text-white mb-4">
                Allowed Methods
              </h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="authenticatorApp"
                    checked={config.methods?.authenticatorApp}
                    onChange={(e) => handleMethodChange('authenticatorApp', e.target.checked)}
                    className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                  />
                  <label
                    htmlFor="authenticatorApp"
                    className="ml-2 text-sm text-midnight-blue dark:text-white"
                  >
                    Authenticator App (TOTP)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms"
                    checked={config.methods?.sms}
                    onChange={(e) => handleMethodChange('sms', e.target.checked)}
                    className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                  />
                  <label htmlFor="sms" className="ml-2 text-sm text-midnight-blue dark:text-white">
                    SMS / Text Message
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email"
                    checked={config.methods?.email}
                    onChange={(e) => handleMethodChange('email', e.target.checked)}
                    className="w-4 h-4 text-celestial-indigo rounded border-cloud focus:ring-celestial-indigo"
                  />
                  <label
                    htmlFor="email"
                    className="ml-2 text-sm text-midnight-blue dark:text-white"
                  >
                    Email Verification
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              Grace Period (Days)
            </label>
            <input
              type="number"
              min={0}
              max={30}
              value={config.gracePeriodDays}
              onChange={(e) => handleChange('gracePeriodDays', parseInt(e.target.value) || 0)}
              className="w-full max-w-xs px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            />
            <p className="text-xs text-silver-mist mt-1">
              Days before MFA is enforced for new users.
            </p>
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
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
