'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, Users, ChevronDown, ChevronRight, RefreshCw, X } from 'lucide-react';

interface AccessControlItem {
  id: string;
  name: string;
  type: string;
  description: string;
  permissions: string[];
  permissionCount: number;
  usersCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RolePermissionDetail {
  role: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    usersCount: number;
  };
  permissions: string[];
  permissionsByResource: Record<string, string[]>;
  totalPermissions: number;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

export default function AccessControlPage() {
  const [data, setData] = useState<AccessControlItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<RolePermissionDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const res = await fetch('/api/access-control');

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data || []);
        } else {
          setError(json.error || 'Failed to load access control data');
        }
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || `Failed to load access control data (${res.status})`);
      }
    } catch (error: any) {
      setError(error.message || 'Network error while fetching data');
      console.error('Failed to fetch access control data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchRoleDetail = useCallback(
    async (roleId: string) => {
      try {
        setIsLoadingDetail(true);
        const res = await fetch('/api/access-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roleId }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSelectedRole(json.data);
          } else {
            showNotification('error', json.error || 'Failed to load role details');
          }
        } else {
          showNotification('error', 'Failed to load role details');
        }
      } catch {
        showNotification('error', 'Network error while fetching role details');
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [showNotification]
  );

  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.name.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q) ||
      row.permissions.some((p) => p.toLowerCase().includes(q))
    );
  });

  const resourceColors: Record<string, string> = {
    users: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    roles: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    employees: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    departments: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    payroll: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    leave: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    attendance: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    recruitment: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    audit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-rose-500 text-lg font-medium">Failed to load access control data</div>
        <p className="text-silver-mist text-sm">{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 bg-celestial-indigo hover:bg-celestial-indigo/90 text-white rounded-lg text-sm font-medium transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col relative overflow-hidden">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-black dark:text-pearl">Access Control</h1>
          <p className="text-sm text-silver-mist mt-0.5">
            View role-based permissions across all modules
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-silver-mist hover:text-celestial-indigo hover:bg-celestial-indigo/5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by role name, description, or permission..."
          className="w-full px-4 py-2.5 bg-pearl dark:bg-stellar-blue rounded-lg text-sm border border-cloud dark:border-nebula-purple/50 focus:ring-2 focus:ring-celestial-indigo/50 outline-none pl-10"
        />
        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver-mist" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-auto">
        {filteredData.map((item) => (
          <div
            key={item.id}
            onClick={() => fetchRoleDetail(item.id)}
            className="bg-white dark:bg-stellar-black border border-cloud dark:border-nebula-purple/30 rounded-xl p-4 hover:shadow-md hover:border-celestial-indigo/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-celestial-indigo/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div>
                  <h3 className="font-medium text-sm text-ink-black dark:text-pearl">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-silver-mist line-clamp-1">
                    {item.description || 'No description'}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  item.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-silver-mist">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {item.permissionCount} permission{item.permissionCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {item.usersCount} user{item.usersCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {item.permissions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {[...new Set(item.permissions.map((p) => p.split(':')[0]))].map((resource) => (
                  <span
                    key={resource}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      resourceColors[resource] ||
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {resource}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-1 text-[10px] text-celestial-indigo opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View details</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Shield className="w-12 h-12 text-silver-mist/50" />
          <p className="text-silver-mist text-sm font-medium">
            {searchQuery ? 'No roles match your search' : 'No access control data available'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-celestial-indigo hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-stellar-black rounded-2xl shadow-2xl border border-cloud dark:border-nebula-purple/30 w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cloud dark:border-nebula-purple/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-celestial-indigo/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-celestial-indigo" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
                    {selectedRole.role.name}
                  </h2>
                  <p className="text-xs text-silver-mist">
                    {selectedRole.role.description || 'No description'} &middot;{' '}
                    {selectedRole.role.usersCount} user
                    {selectedRole.role.usersCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-silver-mist" />
              </button>
            </div>

            <div className="px-6 py-4 overflow-auto max-h-[calc(85vh-80px)]">
              {isLoadingDetail ? (
                <div className="space-y-3 py-8">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-ink-black dark:text-pearl">
                      Permissions ({selectedRole.totalPermissions})
                    </h3>
                    <span className="text-xs text-silver-mist">
                      {Object.keys(selectedRole.permissionsByResource).length} resource(s)
                    </span>
                  </div>

                  {Object.entries(selectedRole.permissionsByResource).map(([resource, actions]) => (
                    <div
                      key={resource}
                      className="border border-cloud dark:border-nebula-purple/30 rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-stellar-blue/50 border-b border-cloud dark:border-nebula-purple/30">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            resourceColors[resource] ||
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {resource}
                        </span>
                        <span className="text-[10px] text-silver-mist ml-auto">
                          {actions.length} action{actions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="px-4 py-2.5 flex flex-wrap gap-1.5">
                        {actions.map((action) => (
                          <span
                            key={`${resource}:${action}`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-celestial-indigo/5 text-celestial-indigo rounded-md text-xs font-medium"
                          >
                            <Shield className="w-3 h-3" />
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
