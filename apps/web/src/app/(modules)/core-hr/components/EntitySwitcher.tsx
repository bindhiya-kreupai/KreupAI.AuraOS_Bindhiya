'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe, Building2, Check, LayoutGrid } from 'lucide-react';
import { cn } from '@aura/ui/utils';

interface EntityOption {
  id: string;
  name: string;
}

const GLOBAL_VIEW: EntityOption = { id: 'global', name: 'Global Group View' };
const STORAGE_KEY = 'aura.selectedEntityId';

export function EntitySwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [entities, setEntities] = useState<EntityOption[]>([GLOBAL_VIEW]);
  const [selectedId, setSelectedId] = useState<string>(GLOBAL_VIEW.id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/v1/companies');
        const json = await response.json();
        const companies: EntityOption[] = json?.success
          ? (json.data?.data ?? []).map((c: { id: string; name: string }) => ({
              id: c.id,
              name: c.name,
            }))
          : [];
        if (!active) return;
        setEntities([GLOBAL_VIEW, ...companies]);
      } catch {
        if (active) setEntities([GLOBAL_VIEW]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Restore persisted selection once entities are loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && entities.some((e) => e.id === stored)) {
      setSelectedId(stored);
    }
  }, [entities]);

  const selected = entities.find((e) => e.id === selectedId) ?? GLOBAL_VIEW;
  const SelectedIcon = selected.id === 'global' ? Globe : Building2;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id);
      window.dispatchEvent(new CustomEvent('aura:entity-changed', { detail: { entityId: id } }));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
          <SelectedIcon
            className={cn(
              'w-5 h-5',
              selected.id === 'global' ? 'text-indigo-500' : 'text-emerald-500'
            )}
          />
        </div>
        <div className="text-left">
          <p className="text-xs text-silver-mist font-medium uppercase tracking-wider">
            Legal Entity
          </p>
          <p className="text-sm font-bold text-ink-black dark:text-pearl">
            {loading ? 'Loading...' : selected.name}
          </p>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-silver-mist transition-transform duration-300 ml-2',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-stellar-blue border border-cloud dark:border-nebula-purple/30 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            <div className="p-2 max-h-72 overflow-y-auto">
              {entities.length === 1 && !loading && (
                <p className="px-3 py-2 text-xs text-silver-mist">No legal entities yet.</p>
              )}
              {entities.map((entity) => {
                const Icon = entity.id === 'global' ? Globe : Building2;
                return (
                  <button
                    key={entity.id}
                    onClick={() => handleSelect(entity.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors group',
                      selectedId === entity.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          'w-4 h-4',
                          entity.id === 'global' ? 'text-indigo-500' : 'text-emerald-500'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium truncate',
                          selectedId === entity.id
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-600 dark:text-slate-300'
                        )}
                      >
                        {entity.name}
                      </span>
                    </div>
                    {selectedId === entity.id && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-cloud dark:border-nebula-purple/20 p-2 bg-slate-50/50 dark:bg-slate-900/50">
              <Link
                href="/core-hr/entities"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Manage Legal Entities
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
