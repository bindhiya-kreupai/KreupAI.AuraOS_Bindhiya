"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  type: "employee" | "team";
  department?: string;
  teamSize?: number;
  avatar?: string;
}

interface RecipientSelectorProps {
  selectedRecipients?: string[];
  onChange?: (recipientIds: string[], externalEmails: string[]) => void;
}

const mockRecipients: Recipient[] = [
  {
    id: "emp-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    type: "employee",
    department: "Human Resources",
  },
  {
    id: "emp-002",
    name: "Michael Chen",
    email: "michael.chen@company.com",
    type: "employee",
    department: "Engineering",
  },
  {
    id: "emp-003",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    type: "employee",
    department: "Marketing",
  },
  {
    id: "emp-004",
    name: "James Wilson",
    email: "james.wilson@company.com",
    type: "employee",
    department: "Finance",
  },
  {
    id: "emp-005",
    name: "Lisa Anderson",
    email: "lisa.anderson@company.com",
    type: "employee",
    department: "Operations",
  },
  {
    id: "emp-006",
    name: "David Martinez",
    email: "david.martinez@company.com",
    type: "employee",
    department: "Engineering",
  },
  {
    id: "team-001",
    name: "Engineering Team",
    email: "engineering@company.com",
    type: "team",
    department: "Engineering",
    teamSize: 12,
  },
  {
    id: "team-002",
    name: "HR Department",
    email: "hr@company.com",
    type: "team",
    department: "Human Resources",
    teamSize: 5,
  },
  {
    id: "team-003",
    name: "Leadership Team",
    email: "leadership@company.com",
    type: "team",
    department: "Executive",
    teamSize: 4,
  },
  {
    id: "team-004",
    name: "Finance Team",
    email: "finance@company.com",
    type: "team",
    department: "Finance",
    teamSize: 6,
  },
];

export function RecipientSelector({
  selectedRecipients: initialSelected,
  onChange,
}: RecipientSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelected || ["emp-001", "team-001"]
  );
  const [externalEmails, setExternalEmails] = useState<string[]>([
    "partner@external.com",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [externalInput, setExternalInput] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "employees" | "teams">(
    "all"
  );

  const filteredRecipients = useMemo(() => {
    let filtered = mockRecipients;

    if (activeTab === "employees") {
      filtered = filtered.filter((r) => r.type === "employee");
    } else if (activeTab === "teams") {
      filtered = filtered.filter((r) => r.type === "team");
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          r.department?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, activeTab]);

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
    if (email && email.includes("@") && !externalEmails.includes(email)) {
      const updated = [...externalEmails, email];
      setExternalEmails(updated);
      setExternalInput("");
      onChange?.(selectedIds, updated);
    }
  };

  const removeExternalEmail = (email: string) => {
    const updated = externalEmails.filter((e) => e !== email);
    setExternalEmails(updated);
    onChange?.(selectedIds, updated);
  };

  const selectedRecipientObjects = mockRecipients.filter((r) =>
    selectedIds.includes(r.id)
  );

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
            <h2 className="text-lg font-semibold text-ink-black dark:text-pearl">
              Recipients
            </h2>
            <p className="text-sm text-silver-mist">
              Select recipients for report delivery
            </p>
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
                {recipient.type === "team" ? (
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
          {(["all", "employees", "teams"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-stellar-blue text-celestial-indigo shadow-sm"
                  : "text-silver-mist hover:text-ink-black dark:hover:text-pearl"
              }`}
            >
              {tab === "all"
                ? "All"
                : tab === "employees"
                  ? "Employees"
                  : "Teams"}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient List */}
      <div className="max-h-60 overflow-y-auto border border-cloud dark:border-nebula-purple/50 rounded-lg divide-y divide-cloud dark:divide-nebula-purple/50 mb-5">
        {filteredRecipients.length === 0 ? (
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
                    ? "bg-celestial-indigo/5"
                    : "hover:bg-slate-50 dark:hover:bg-deep-cosmos"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors ${
                    isSelected
                      ? "bg-celestial-indigo border-celestial-indigo"
                      : "border-cloud dark:border-nebula-purple/50"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Avatar / Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    recipient.type === "team"
                      ? "bg-celestial-indigo/10"
                      : "bg-slate-50 dark:bg-deep-cosmos"
                  }`}
                >
                  {recipient.type === "team" ? (
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
                  <p className="text-xs text-silver-mist truncate">
                    {recipient.email}
                  </p>
                </div>

                {/* Meta */}
                <div className="text-right flex-shrink-0">
                  {recipient.type === "team" && recipient.teamSize && (
                    <span className="text-xs text-silver-mist">
                      {recipient.teamSize} members
                    </span>
                  )}
                  {recipient.department && (
                    <p className="text-[10px] text-silver-mist">
                      {recipient.department}
                    </p>
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
              onKeyDown={(e) => e.key === "Enter" && addExternalEmail()}
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
