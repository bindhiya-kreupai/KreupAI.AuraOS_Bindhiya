/**
 * @module TenantsPage
 * @description Multi-tenant management dashboard — provision, configure, and monitor tenants.
 * @project AURA HCM Platform
 * @section 8.4 Multi-Tenancy & Isolation / 24.2 Tenant Administration & Provisioning
 */

'use client';

import React, { useState } from 'react';
import TenantDashboard from '@/components/admin/TenantDashboard';
import TenantConfiguration from '@/components/admin/TenantConfiguration';

export default function TenantsPage() {
  const [configuringTenantId, setConfiguringTenantId] = useState<string | null>(null);

  if (configuringTenantId) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
            System / Tenants / Configure
          </p>
          <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
            Tenant Configuration
          </h1>
          <p className="text-silver-mist text-sm mt-1 max-w-2xl">
            Configure settings, modules, limits, SSO, and data retention for this tenant.
          </p>
        </div>
        <TenantConfiguration
          tenantId={configuringTenantId}
          onSave={() => setConfiguringTenantId(null)}
        />
        <button
          onClick={() => setConfiguringTenantId(null)}
          className="text-sm text-silver-mist hover:text-ink-black dark:hover:text-pearl underline"
        >
          Back to Tenant List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="pb-4 border-b border-cloud dark:border-nebula-purple/20">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
          System / Tenants
        </p>
        <h1 className="text-2xl font-extrabold text-ink-black dark:text-pearl">
          Multi-Tenant Management
        </h1>
        <p className="text-silver-mist text-sm mt-1 max-w-2xl">
          Provision, configure, suspend, and monitor all tenant organizations from a single
          super-admin console. Each tenant is fully isolated with its own data, configuration, and
          module entitlements.
        </p>
      </div>
      <TenantDashboard onConfigureTenant={(id) => setConfiguringTenantId(id)} />
    </div>
  );
}
