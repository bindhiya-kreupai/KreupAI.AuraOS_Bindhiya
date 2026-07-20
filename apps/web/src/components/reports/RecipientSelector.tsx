'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  X,
  Mail,
  UserPlus,
  Building2,
  User,
  Check,
  AtSign,
  Loader2,
} from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string;
  type: 'employee' | 'team';
  department?: string;
  teamSize?: number;
  avatar?: string;
}

interface RecipientSelectorProps {
  selectedRecipients?: string[];
  onChange?: (recipientIds: string[], externalEmails: string[]) => void;
  /** Called with the flat list of resolved email addresses (selected employees + externals). */
  onEmailsChange?: (emails: string[]) => void;
}

export function RecipientSelector({
  selectedRecipients: initialSelected,
  onChange,
  onEmailsChange,
}: RecipientSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected || []);
  const [externalEmails, setExternalEmails] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [externalInput, setExternalInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'employees' | 'teams'>('all');

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real employees from the directory API (tenant-scoped server-side).
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const url = `/api/v1/employees?limit=100${
      searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : ''
    }`;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.success && Array.isArray(json.data)) {
          setRecipients(
            json.data
              .filter((e: any) => e.email)
              .map((e: any) => ({
                id: e.id,
                name: e.name || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.email,
                email: e.email,
                type: 'employee' as const,
                department: e.department?.name || e.dept || undefined,
              }))
          );
        } else {
          setError(json.error?.message || 'Failed to load recipients');
        }
      })
      .catch(() => active && setError('Failed to load recipients'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [searchQuery]);

  const filteredRecipients = useMemo(() => {
    let filtered = recipients;
    if (activeTab === 'teams') {
      filtered = filtered.filter((r) => r.type === 'team');
    } else if (activeTab === 'employees') {
      filtered = filtered.filter((r) => r.type === 'employee');
    }
    return filtered;
  }, [recipients, activeTab]);

  // Emit resolved email list (selected employees + external emails) whenever selection changes.
  useEffect(() => {
    if (!onEmailsChange) return;
    const selectedEmails = recipients.filter((r) => selectedIds.includes(r.id)).map((r) => r.email);
    onEmailsChange([...new Set([...selectedEmails, ...externalEmails])]);
  }, [selectedIds, externalEmails, recipients, onEmailsChange]);

  const toggleRecipient = (id: string) => {
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((r) => r !== id)
      : [...selectedIds, id];
    setSelectedIds(updated);
    onChange?.(updated, externalEmails);
  };

  const removeRecipient = (id: string) => {
    const updated = selectedIds.filter((r) => r !== id);
    setSelectedIds(updated);
    onChange?.(updated, externalEmails);
  };

  const addExternalEmail = () => {
    const email = externalInput.trim();
    if (email && email.includes('@') && !externalEmails.includes(email)) {
      const updated = [...externalEmails, email];
      setExternalEmails(updated);
      setExternalInput('');
      onChange?.(selectedIds, updated);
    }
  };

  const removeExternalEmail = (email: string) => {
    const updated = externalEmails.filter((e) => e !== email);
    setExternalEmails(updated);
    onChange?.(selectedIds, updated);
  };

  const selectedRecipientObjects = recipients.filter((r) => selectedIds.includes(r.id));

  const totalRecipientCount = selectedIds.length + externalEmails.length;

  return (
    <div className="bg-white dark:bg-stellar-blue rounded-xl border border-cloud dark:border-nebula-purple/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-celestial-indigo/10 rounded-lg">
            <Users className="w-5 h-5 text-celestial-indigo" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">Recipients</h2>
            <p className="text-sm text-silver-mist">Select recipients for report delivery</p>
          </div>
        </div>
        <span className="text-xs font-medium text-celestial-indigo bg-celestial-indigo/10 px-2.5 py-1 rounded-full">
          {totalRecipientCount} selected
        </span>
      </div>

      {/* Selected Recipients */}
      {(selectedRecipientObjects.length > 0 || externalEmails.length > 0) && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-2">
            Selected Recipients
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedRecipientObjects.map((recipient) => (
              <span
                key={recipient.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-celestial-indigo/10 text-celestial-indigo rounded-full"
              >
                {recipient.type === 'team' ? (
                  <Building2 className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                {recipient.name}
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="ml-0.5 p-0.5 hover:bg-celestial-indigo/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {externalEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-sunset-amber/10 text-sunset-amber rounded-full"
              >
                <AtSign className="w-3 h-3" />
                {email}
                <button
                  onClick={() => removeExternalEmail(email)}
                  className="ml-0.5 p-0.5 hover:bg-sunset-amber/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-slate-50 dark:bg-deep-cosmos mb-3">
          <Search className="w-4 h-4 text-silver-mist flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees or teams..."
            className="flex-1 text-sm bg-transparent outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-deep-cosmos rounded-lg p-1">
          {(['all', 'employees', 'teams'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm'
                  : 'text-silver-mist hover:text-ink-black dark:hover:text-pearl'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'employees' ? 'Employees' : 'Teams'}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient List */}
      <div className="max-h-60 overflow-y-auto border border-cloud dark:border-nebula-purple/50 rounded-lg divide-y divide-cloud dark:divide-nebula-purple/50 mb-5">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-5 h-5 text-celestial-indigo mx-auto animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-6 h-6 text-silver-mist mx-auto mb-2" />
            <p className="text-sm text-silver-mist">No recipients found</p>
          </div>
        ) : (
          filteredRecipients.map((recipient) => {
            const isSelected = selectedIds.includes(recipient.id);
            return (
              <button
                key={recipient.id}
                onClick={() => toggleRecipient(recipient.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-celestial-indigo/5'
                    : 'hover:bg-slate-50 dark:hover:bg-deep-cosmos'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-celestial-indigo border-celestial-indigo'
                      : 'border-cloud dark:border-nebula-purple/50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Avatar / Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    recipient.type === 'team'
                      ? 'bg-celestial-indigo/10'
                      : 'bg-slate-50 dark:bg-deep-cosmos'
                  }`}
                >
                  {recipient.type === 'team' ? (
                    <Building2 className="w-4 h-4 text-celestial-indigo" />
                  ) : (
                    <User className="w-4 h-4 text-silver-mist" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-black dark:text-pearl truncate">
                    {recipient.name}
                  </p>
                  <p className="text-xs text-silver-mist truncate">{recipient.email}</p>
                </div>

                {/* Meta */}
                <div className="text-right flex-shrink-0">
                  {recipient.type === 'team' && recipient.teamSize && (
                    <span className="text-xs text-silver-mist">{recipient.teamSize} members</span>
                  )}
                  {recipient.department && (
                    <p className="text-[10px] text-silver-mist">{recipient.department}</p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* External Email Input */}
      <div>
        <h3 className="text-xs font-semibold text-silver-mist uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          External Recipients
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-cloud dark:border-nebula-purple/50 bg-white dark:bg-stellar-blue">
            <AtSign className="w-4 h-4 text-silver-mist flex-shrink-0" />
            <input
              type="email"
              value={externalInput}
              onChange={(e) => setExternalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExternalEmail()}
              placeholder="Enter external email address"
              className="flex-1 text-sm bg-transparent outline-none text-ink-black dark:text-pearl placeholder:text-silver-mist"
            />
          </div>
          <button
            onClick={addExternalEmail}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-celestial-indigo text-white rounded-lg hover:bg-celestial-indigo/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add
          </button>
        </div>
        <p className="text-xs text-silver-mist mt-1.5">
          Add email addresses for recipients outside the organization
        </p>
      </div>
    </div>
  );
}
