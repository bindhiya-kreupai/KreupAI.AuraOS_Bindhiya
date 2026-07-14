'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, RotateCcw, Shield } from 'lucide-react';

interface SSOConfig {
  id?: string;
  enabled: boolean;
  provider: string;
  issuerUrl: string;
  ssoUrl: string;
  certificate: string;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

const DEFAULTS: SSOConfig = {
  enabled: false,
  provider: 'SAML',
  issuerUrl: '',
  ssoUrl: '',
  certificate: '',
};

export default function SSOPage() {
  const [config, setConfig] = useState<SSOConfig>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    fetch('/api/sso-config')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setConfig({ ...DEFAULTS, ...json.data });
        } else if (!json.success) {
          setError(json.error || 'Failed to load SSO configuration');
        }
      })
      .catch((err) => {
        setError(err.message || 'Network error');
        console.error('Error fetching SSO config:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (key: keyof SSOConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isUpdate = !!config.id;
      const res = await fetch('/api/sso-config', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const json = await res.json();

      if (res.ok) {
        if (json.data?.id) {
          setConfig((prev) => ({ ...prev, id: json.data.id }));
        }
        showNotification('success', json.message || 'SSO configuration saved successfully');
      } else {
        showNotification('error', json.error || 'Failed to save SSO configuration');
      }
    } catch (err: any) {
      showNotification('error', 'Network error while saving SSO configuration');
      console.error('Error saving SSO config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!config.id) return;
    if (
      !window.confirm(
        'Reset SSO configuration to defaults? This will delete the current configuration.'
      )
    )
      return;

    try {
      const res = await fetch('/api/sso-config', { method: 'DELETE' });
      const json = await res.json();

      if (res.ok) {
        setConfig({ ...DEFAULTS, id: undefined });
        showNotification('success', json.message || 'SSO configuration reset to defaults');
      } else {
        showNotification('error', json.error || 'Failed to reset SSO configuration');
      }
    } catch (err: any) {
      showNotification('error', 'Network error while resetting SSO configuration');
      console.error('Error resetting SSO config:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-rose-500 text-lg font-medium">Failed to load SSO configuration</div>
        <p className="text-silver-mist text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-midnight-blue dark:text-white mb-2">
          Single Sign-On (SSO)
        </h1>
        <p className="text-silver-mist">
          Configure SAML or OIDC authentication for your organization.
        </p>
      </div>

      <div className="bg-white dark:bg-stellar-blue/20 rounded-xl border border-cloud dark:border-nebula-purple/30 p-6 space-y-4">
        <div className="flex items-center justify-between pb-6 border-b border-cloud dark:border-nebula-purple/30">
          <div>
            <h3 className="text-lg font-medium text-midnight-blue dark:text-white">Enable SSO</h3>
            <p className="text-sm text-silver-mist">
              Allow users to log in using your identity provider.
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
            />
          </div>
        </div>

        <div className={`space-y-4 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              Provider Type
            </label>
            <select
              value={config.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
            >
              <option value="SAML">SAML 2.0</option>
              <option value="OIDC">OpenID Connect (OIDC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              Issuer URL (Entity ID)
            </label>
            <input
              type="text"
              value={config.issuerUrl || ''}
              onChange={(e) => handleChange('issuerUrl', e.target.value)}
              className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="https://idp.example.com/metadata"
            />
            <p className="text-[10px] text-silver-mist mt-1">
              The entity ID or issuer URI of your identity provider
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              SSO URL (Login URL)
            </label>
            <input
              type="text"
              value={config.ssoUrl || ''}
              onChange={(e) => handleChange('ssoUrl', e.target.value)}
              className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none"
              placeholder="https://idp.example.com/sso"
            />
            <p className="text-[10px] text-silver-mist mt-1">
              The SSO endpoint URL of your identity provider
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight-blue dark:text-white mb-2">
              X.509 Certificate
            </label>
            <textarea
              value={config.certificate || ''}
              onChange={(e) => handleChange('certificate', e.target.value)}
              className="w-full px-4 py-2 bg-pearl dark:bg-stellar-blue rounded-lg border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none font-mono text-xs"
              rows={5}
              placeholder="-----BEGIN CERTIFICATE-----..."
            />
            <p className="text-[10px] text-silver-mist mt-1">
              The X.509 certificate from your identity provider for signature verification
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-cloud dark:border-nebula-purple/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-silver-mist">
            <Shield className="w-4 h-4" />
            {config.id ? (
              <span>
                SSO is configured — uses <strong>PUT</strong> for updates
              </span>
            ) : (
              <span>
                No SSO configuration yet — first save will <strong>create</strong> a new config
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {config.id && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
