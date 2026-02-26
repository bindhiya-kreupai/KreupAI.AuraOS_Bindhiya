/**
 * @module DeveloperPortal
 * @description Developer portal with API documentation browser, API key management,
 *              webhook configuration, SDK downloads, API playground, and rate limit dashboard.
 * @project AURA HCM Platform
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Activity,
  Book,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Key,
  Package,
  Play,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Tag,
  Terminal,
  Trash2,
  Webhook,
  Zap,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  service: string;
  auth: boolean;
  rateLimit: string;
  params?: Array<{ name: string; type: string; required: boolean; description: string }>;
  requestBody?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

interface APIKey {
  id: string;
  name: string;
  prefix: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  scopes: string[];
  requestsToday: number;
  requestsLimit: number;
  status: 'active' | 'revoked' | 'expired';
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastDelivery?: string;
  lastStatus?: number;
  successRate: number;
}

interface SDKPackage {
  name: string;
  description: string;
  npmPackage: string;
  language: string;
  version: string;
  downloads: number;
}

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'feature' | 'fix' | 'breaking' | 'deprecation';
  description: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const API_ENDPOINTS: APIEndpoint[] = [
  {
    id: 'ep-1',
    method: 'GET',
    path: '/api/v1/employees',
    description: 'List all employees with pagination',
    service: 'core',
    auth: true,
    rateLimit: '100/min',
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (max 100)' },
    ],
  },
  {
    id: 'ep-2',
    method: 'GET',
    path: '/api/v1/employees/:id',
    description: 'Get single employee by ID',
    service: 'core',
    auth: true,
    rateLimit: '200/min',
  },
  {
    id: 'ep-3',
    method: 'POST',
    path: '/api/v1/employees',
    description: 'Create a new employee',
    service: 'core',
    auth: true,
    rateLimit: '20/min',
  },
  {
    id: 'ep-4',
    method: 'PUT',
    path: '/api/v1/employees/:id',
    description: 'Update employee data',
    service: 'core',
    auth: true,
    rateLimit: '50/min',
  },
  {
    id: 'ep-5',
    method: 'DELETE',
    path: '/api/v1/employees/:id',
    description: 'Soft-delete employee',
    service: 'core',
    auth: true,
    rateLimit: '10/min',
  },
  {
    id: 'ep-6',
    method: 'GET',
    path: '/api/v1/payroll/runs',
    description: 'List payroll processing runs',
    service: 'payroll',
    auth: true,
    rateLimit: '50/min',
  },
  {
    id: 'ep-7',
    method: 'POST',
    path: '/api/v1/payroll/runs',
    description: 'Trigger a new payroll run',
    service: 'payroll',
    auth: true,
    rateLimit: '5/min',
  },
  {
    id: 'ep-8',
    method: 'GET',
    path: '/api/v1/attendance',
    description: 'Get attendance records',
    service: 'attendance',
    auth: true,
    rateLimit: '100/min',
  },
  {
    id: 'ep-9',
    method: 'POST',
    path: '/api/v1/attendance/clock-in',
    description: 'Clock in for an employee',
    service: 'attendance',
    auth: true,
    rateLimit: '60/min',
  },
  {
    id: 'ep-10',
    method: 'GET',
    path: '/api/v1/analytics/headcount',
    description: 'Headcount analytics & trends',
    service: 'analytics',
    auth: true,
    rateLimit: '30/min',
  },
  {
    id: 'ep-11',
    method: 'GET',
    path: '/api/v1/notifications',
    description: 'Get user notifications',
    service: 'notifications',
    auth: true,
    rateLimit: '100/min',
  },
  {
    id: 'ep-12',
    method: 'POST',
    path: '/api/v1/notifications/send',
    description: 'Send a notification',
    service: 'notifications',
    auth: true,
    rateLimit: '10/min',
  },
  {
    id: 'ep-13',
    method: 'GET',
    path: '/api/v1/compliance/checks',
    description: 'List compliance check results',
    service: 'compliance',
    auth: true,
    rateLimit: '50/min',
  },
  {
    id: 'ep-14',
    method: 'GET',
    path: '/health',
    description: 'Service health check',
    service: 'system',
    auth: false,
    rateLimit: 'unlimited',
  },
];

const API_KEYS: APIKey[] = [
  {
    id: 'ak-1',
    name: 'Production Integration',
    prefix: 'aura_prod',
    maskedKey: 'aura_prod_••••••••••••••••Xk7m',
    createdAt: '2025-11-01',
    lastUsedAt: new Date(Date.now() - 60_000).toISOString(),
    scopes: ['employees:read', 'payroll:read', 'analytics:read'],
    requestsToday: 4521,
    requestsLimit: 10000,
    status: 'active',
  },
  {
    id: 'ak-2',
    name: 'HR Integration Bot',
    prefix: 'aura_svc',
    maskedKey: 'aura_svc_••••••••••••••••Lp9q',
    createdAt: '2025-12-15',
    lastUsedAt: new Date(Date.now() - 3_600_000).toISOString(),
    scopes: ['employees:read', 'employees:write', 'attendance:write'],
    requestsToday: 892,
    requestsLimit: 5000,
    status: 'active',
  },
  {
    id: 'ak-3',
    name: 'Analytics Dashboard',
    prefix: 'aura_svc',
    maskedKey: 'aura_svc_••••••••••••••••Rt2n',
    createdAt: '2025-10-05',
    lastUsedAt: new Date(Date.now() - 86_400_000).toISOString(),
    scopes: ['analytics:read'],
    requestsToday: 0,
    requestsLimit: 3000,
    status: 'active',
  },
  {
    id: 'ak-4',
    name: 'Legacy API Key',
    prefix: 'aura_test',
    maskedKey: 'aura_test_•••••••••••••••Wv5h',
    createdAt: '2025-09-01',
    expiresAt: '2025-12-31',
    scopes: ['employees:read'],
    requestsToday: 0,
    requestsLimit: 1000,
    status: 'expired',
  },
];

const WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-1',
    name: 'Employee Lifecycle',
    url: 'https://hrms.acme.com/hooks/employee',
    events: ['employee.created', 'employee.updated', 'employee.terminated'],
    active: true,
    lastDelivery: new Date(Date.now() - 120_000).toISOString(),
    lastStatus: 200,
    successRate: 99.2,
  },
  {
    id: 'wh-2',
    name: 'Payroll Completion',
    url: 'https://finance.acme.com/hooks/payroll',
    events: ['payroll.run.completed', 'payroll.run.failed'],
    active: true,
    lastDelivery: new Date(Date.now() - 86_400_000 * 7).toISOString(),
    lastStatus: 200,
    successRate: 100,
  },
  {
    id: 'wh-3',
    name: 'Compliance Alerts',
    url: 'https://slack.hooks.acme.com/compliance',
    events: ['compliance.check.failed', 'compliance.audit.completed'],
    active: false,
    successRate: 0,
  },
];

const SDK_PACKAGES: SDKPackage[] = [
  {
    name: 'AuraOS JavaScript SDK',
    description: 'Full-featured TypeScript/JavaScript SDK for browser and Node.js',
    npmPackage: '@aura-hcm/sdk-js',
    language: 'TypeScript',
    version: '2.4.1',
    downloads: 12450,
  },
  {
    name: 'AuraOS Python SDK',
    description: 'Python SDK with async support for data engineering pipelines',
    npmPackage: 'aura-hcm-sdk',
    language: 'Python',
    version: '1.8.0',
    downloads: 5230,
  },
  {
    name: 'AuraOS .NET SDK',
    description: 'C# SDK for enterprise .NET integration',
    npmPackage: 'AuraHCM.SDK',
    language: 'C#',
    version: '1.2.0',
    downloads: 2890,
  },
  {
    name: 'AuraOS REST OpenAPI',
    description: 'OpenAPI 3.1 specification for any language',
    npmPackage: 'openapi-spec',
    language: 'OpenAPI',
    version: '3.1.0',
    downloads: 8920,
  },
];

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.4.1',
    date: '2026-02-15',
    type: 'fix',
    description: 'Fixed pagination token encoding issue in /employees endpoint',
  },
  {
    version: '2.4.0',
    date: '2026-02-01',
    type: 'feature',
    description: 'Added bulk employee import endpoint POST /employees/bulk',
  },
  {
    version: '2.3.0',
    date: '2026-01-15',
    type: 'feature',
    description: 'Webhook retry with exponential backoff (max 5 retries)',
  },
  {
    version: '2.2.0',
    date: '2025-12-20',
    type: 'feature',
    description: 'Rate limit headers now included in all API responses',
  },
  {
    version: '2.1.0',
    date: '2025-12-01',
    type: 'feature',
    description: 'Added OpenAPI 3.1 spec at /api/v1/docs/openapi.json',
  },
  {
    version: '2.0.0',
    date: '2025-11-15',
    type: 'breaking',
    description: 'Migrated authentication to JWT Bearer tokens (API keys still supported)',
  },
  {
    version: '1.9.0',
    date: '2025-11-01',
    type: 'feature',
    description: 'Added /api/v1/analytics/headcount with department breakdowns',
  },
  {
    version: '1.8.0',
    date: '2025-10-15',
    type: 'deprecation',
    description: 'Basic auth deprecated — will be removed in v3.0',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const METHOD_COLOR: Record<APIEndpoint['method'], string> = {
  GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
  PUT: 'bg-amber-500/20  text-amber-400  border-amber-500/30',
  PATCH: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/20    text-red-400    border-red-500/30',
};

const CHANGE_TYPE_CONFIG: Record<ChangelogEntry['type'], { color: string; label: string }> = {
  feature: { color: 'bg-blue-500/20    text-blue-400    border-blue-500/30', label: 'Feature' },
  fix: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Bug Fix' },
  breaking: { color: 'bg-red-500/20     text-red-400     border-red-500/30', label: 'Breaking' },
  deprecation: {
    color: 'bg-amber-500/20  text-amber-400   border-amber-500/30',
    label: 'Deprecated',
  },
};

const SERVICES = [
  'all',
  'core',
  'payroll',
  'attendance',
  'analytics',
  'notifications',
  'compliance',
  'system',
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState<
    'docs' | 'keys' | 'webhooks' | 'sdks' | 'playground' | 'changelog'
  >('docs');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<APIEndpoint>(API_ENDPOINTS[0]);
  const [playgroundBody, setPlaygroundBody] = useState('{}');
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState(WEBHOOKS);
  const [keys, setKeys] = useState(API_KEYS);

  const filteredEndpoints =
    serviceFilter === 'all'
      ? API_ENDPOINTS
      : API_ENDPOINTS.filter((e) => e.service === serviceFilter);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  function handlePlayground() {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    setTimeout(() => {
      const mockResponse = {
        status: 200,
        data: {
          success: true,
          data:
            playgroundEndpoint.method === 'GET'
              ? [
                  {
                    id: 'emp_001',
                    name: 'Alice Johnson',
                    department: 'Engineering',
                    status: 'active',
                  },
                ]
              : { id: 'emp_' + Date.now(), created: true },
          meta: { total: 1, page: 1, limit: 20 },
        },
        headers: {
          'content-type': 'application/json',
          'x-ratelimit-remaining': '99',
          'x-request-id': `req-${Date.now().toString(36)}`,
        },
      };
      setPlaygroundResponse(JSON.stringify(mockResponse, null, 2));
      setPlaygroundLoading(false);
    }, 800);
  }

  function revokeKey(id: string) {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)));
  }

  function toggleWebhook(id: string) {
    setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Code className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Developer Portal</h1>
            <p className="text-xs text-slate-400">AuraOS HCM API v2.4 · OpenAPI 3.1</p>
          </div>
        </div>
        <a
          href="#"
          className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm border border-indigo-500/20 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          API Reference
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
        {[
          { id: 'docs', label: 'API Docs', icon: Book },
          { id: 'keys', label: 'API Keys', icon: Key },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'sdks', label: 'SDKs', icon: Package },
          { id: 'playground', label: 'Playground', icon: Play },
          { id: 'changelog', label: 'Changelog', icon: Tag },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-2 flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── API Docs ── */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded px-3 py-2"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Services' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-500">{filteredEndpoints.length} endpoints</span>
          </div>

          {SERVICES.filter(
            (s) => s !== 'all' && (serviceFilter === 'all' || serviceFilter === s)
          ).map((svc) => {
            const svcEndpoints = filteredEndpoints.filter((e) => e.service === svc);
            if (svcEndpoints.length === 0) return null;

            return (
              <div
                key={svc}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
              >
                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-semibold text-white capitalize">
                      {svc} Service
                    </span>
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded ml-1">
                      {svcEndpoints.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/50">
                  {svcEndpoints.map((ep) => (
                    <div key={ep.id}>
                      <div
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/30 transition-colors"
                        onClick={() =>
                          setExpandedEndpoint(expandedEndpoint === ep.id ? null : ep.id)
                        }
                      >
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border flex-shrink-0 w-14 text-center ${METHOD_COLOR[ep.method]}`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-xs text-slate-300 flex-1 font-mono">{ep.path}</code>
                        <span className="text-xs text-slate-500 hidden md:block flex-shrink-0">
                          {ep.description}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {ep.auth && (
                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                              Auth
                            </span>
                          )}
                          <span className="text-xs text-slate-600">{ep.rateLimit}</span>
                          {expandedEndpoint === ep.id ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {expandedEndpoint === ep.id && (
                        <div className="px-4 pb-4 bg-slate-950/50">
                          <p className="text-xs text-slate-400 mb-3">{ep.description}</p>
                          {ep.params && ep.params.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-semibold text-slate-300 mb-2">
                                Parameters
                              </div>
                              <div className="space-y-1.5">
                                {ep.params.map((p) => (
                                  <div key={p.name} className="flex items-center gap-2 text-xs">
                                    <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded">
                                      {p.name}
                                    </code>
                                    <span className="text-slate-500">{p.type}</span>
                                    {p.required && <span className="text-red-400">required</span>}
                                    <span className="text-slate-500">{p.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPlaygroundEndpoint(ep);
                                setActiveTab('playground');
                              }}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              Try in Playground
                            </button>
                            <button
                              onClick={() =>
                                handleCopy(
                                  `curl -X ${ep.method} 'https://api.aura-hcm.com${ep.path}' -H 'Authorization: Bearer YOUR_TOKEN'`,
                                  ep.id
                                )
                              }
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors"
                            >
                              {copied === ep.id ? (
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy cURL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── API Keys ── */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-slate-400">
              {keys.filter((k) => k.status === 'active').length} active keys
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Create API Key
            </button>
          </div>

          {keys.map((k) => {
            const usagePct = (k.requestsToday / k.requestsLimit) * 100;
            const isRevoked = k.status !== 'active';

            return (
              <div
                key={k.id}
                className={`bg-slate-900 border border-slate-800 rounded-xl p-5 ${isRevoked ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold text-white">{k.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          k.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : k.status === 'revoked'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-slate-700 text-slate-500 border-slate-600'
                        }`}
                      >
                        {k.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {showKey === k.id
                          ? k.maskedKey
                          : k.maskedKey.replace(/[^•]/g, (c, i) => (i < 12 ? c : '•'))}
                      </code>
                      <button
                        onClick={() => setShowKey(showKey === k.id ? null : k.id)}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {showKey === k.id ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(k.maskedKey, k.id + '-copy')}
                        className="text-slate-500 hover:text-slate-300"
                      >
                        {copied === k.id + '-copy' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {!isRevoked && (
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Revoke
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-500">Created</span>
                    <div className="text-slate-300">{k.createdAt}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Used</span>
                    <div className="text-slate-300">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Requests Today</span>
                    <div className="text-slate-300">
                      {k.requestsToday.toLocaleString()} / {k.requestsLimit.toLocaleString()}
                    </div>
                  </div>
                  {k.expiresAt && (
                    <div>
                      <span className="text-slate-500">Expires</span>
                      <div className="text-amber-400">{k.expiresAt}</div>
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Daily quota</span>
                    <span>{usagePct.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-amber-400' : 'bg-blue-500'}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {k.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Webhooks ── */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-400">
              {webhooks.filter((w) => w.active).length} active webhooks
            </span>
            <button className="flex items-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Webhook
            </button>
          </div>

          {webhooks.map((wh) => (
            <div key={wh.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-white">{wh.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${wh.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700 text-slate-500 border-slate-600'}`}
                    >
                      {wh.active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <code className="text-xs font-mono text-slate-400 mt-1 block">{wh.url}</code>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleWebhook(wh.id)}
                    className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded transition-colors"
                  >
                    {wh.active ? 'Pause' : 'Resume'}
                  </button>
                  <button className="p-1 text-slate-500 hover:text-slate-300 rounded border border-slate-700 hover:bg-slate-800 transition-colors">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {wh.events.map((e) => (
                  <span
                    key={e}
                    className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded"
                  >
                    {e}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Last Delivery</span>
                  <div className="text-slate-300">
                    {wh.lastDelivery ? new Date(wh.lastDelivery).toLocaleDateString() : 'Never'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Last Status</span>
                  <div className={wh.lastStatus === 200 ? 'text-emerald-400' : 'text-red-400'}>
                    {wh.lastStatus ?? 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Success Rate</span>
                  <div className={wh.successRate >= 95 ? 'text-emerald-400' : 'text-amber-400'}>
                    {wh.successRate}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SDKs ── */}
      {activeTab === 'sdks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SDK_PACKAGES.map((sdk) => (
            <div key={sdk.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-slate-800 rounded-xl">
                  <Package className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white text-sm">{sdk.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sdk.description}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mb-4">
                <div>
                  <span className="text-slate-500">Version</span>
                  <div className="text-white font-medium">v{sdk.version}</div>
                </div>
                <div>
                  <span className="text-slate-500">Language</span>
                  <div className="text-white">{sdk.language}</div>
                </div>
                <div>
                  <span className="text-slate-500">Downloads</span>
                  <div className="text-white">{sdk.downloads.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 text-xs font-mono bg-slate-800 text-slate-300 px-3 py-2 rounded-lg border border-slate-700">
                  {sdk.language === 'Python'
                    ? `pip install ${sdk.npmPackage}`
                    : sdk.language === 'C#'
                      ? `dotnet add package ${sdk.npmPackage}`
                      : sdk.language === 'OpenAPI'
                        ? `GET /api/v1/docs/openapi.json`
                        : `npm install ${sdk.npmPackage}`}
                </code>
                <button
                  onClick={() => handleCopy(sdk.npmPackage, sdk.name)}
                  className="p-2 text-slate-500 hover:text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {copied === sdk.name ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <a
                href="#"
                className="flex items-center gap-2 justify-center w-full px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download / View Docs
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* ── Playground ── */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">API Playground</h2>
            </div>

            {/* Endpoint selector */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1.5 block">Select Endpoint</label>
              <select
                value={playgroundEndpoint.id}
                onChange={(e) => {
                  const ep = API_ENDPOINTS.find((x) => x.id === e.target.value);
                  if (ep) setPlaygroundEndpoint(ep);
                }}
                className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2"
              >
                {API_ENDPOINTS.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    {ep.method} {ep.path}
                  </option>
                ))}
              </select>
            </div>

            {/* Endpoint display */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800 rounded-lg">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${METHOD_COLOR[playgroundEndpoint.method]}`}
              >
                {playgroundEndpoint.method}
              </span>
              <code className="text-xs font-mono text-slate-300 flex-1">
                https://api.aura-hcm.com{playgroundEndpoint.path}
              </code>
            </div>

            {/* Request body */}
            {['POST', 'PUT', 'PATCH'].includes(playgroundEndpoint.method) && (
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1.5 block">Request Body (JSON)</label>
                <textarea
                  value={playgroundBody}
                  onChange={(e) => setPlaygroundBody(e.target.value)}
                  rows={6}
                  className="w-full text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300 rounded-lg p-3 resize-none"
                  placeholder='{ "name": "Jane Doe" }'
                />
              </div>
            )}

            <button
              onClick={handlePlayground}
              disabled={playgroundLoading}
              className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {playgroundLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {playgroundLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Response</h2>
              </div>
              {playgroundResponse && (
                <button
                  onClick={() => handleCopy(playgroundResponse, 'response')}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
                >
                  {copied === 'response' ? (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy
                </button>
              )}
            </div>

            {playgroundLoading && (
              <div className="flex items-center justify-center h-40">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            )}

            {!playgroundLoading && playgroundResponse && (
              <pre className="text-xs font-mono text-emerald-300 bg-slate-950 rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap">
                {playgroundResponse}
              </pre>
            )}

            {!playgroundLoading && !playgroundResponse && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                <Zap className="w-8 h-8 mb-2" />
                <span className="text-sm">Send a request to see the response</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Changelog ── */}
      {activeTab === 'changelog' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Tag className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-white">API Changelog</h2>
          </div>

          <div className="space-y-4">
            {CHANGELOG.map((entry) => {
              const cfg = CHANGE_TYPE_CONFIG[entry.type];
              return (
                <div key={entry.version + entry.date} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                    <div className="w-px flex-1 bg-slate-800 mt-1" />
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">v{entry.version}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-slate-500 ml-auto">{entry.date}</span>
                    </div>
                    <p className="text-xs text-slate-400">{entry.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
